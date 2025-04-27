import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { decryptData } from "../../../cryptoUtils.jsx";

export const SetExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { examData, batch, type } = location.state || {};

  // Manager info, if needed by your API
  const managerId = decryptData(sessionStorage.getItem("Manager"));
  const managerLocation = decryptData(sessionStorage.getItem("location"));

  // Keep track of which subject is chosen
  const [selectedSubject, setSelectedSubject] = useState("");

  // These track how many questions the user chooses for MCQ & Coding
  const [selectedMCQs, setSelectedMCQs] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [selectedCoding, setSelectedCoding] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // For displaying available totals from examData[subject].breakdown
  const [totalMCQs, setTotalMCQs] = useState({ easy: 0, medium: 0, hard: 0 });
  const [totalCoding, setTotalCoding] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Subtitles come from examData[subject]
  const [displaySubtopics, setDisplaySubtopics] = useState([]);
  // (Not used now, but retained for structure if needed)
  const [displayTopics, setDisplayTopics] = useState([]);

  // Summaries of all chosen subjects (if user picks multiple)
  const [examSubjects, setExamSubjects] = useState([]);

  // For scheduling
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [creatingExam, setCreatingExam] = useState(false);

  // Expand/collapse time constraint details in UI
  const [isTimeCollapsed, setIsTimeCollapsed] = useState(true);

  // Gather the list of subjects from the examData keys.
  const [subjectList, setSubjectList] = useState([]);
  useEffect(() => {
    if (examData) {
      // examData is an object whose keys are subject names
      setSubjectList(Object.keys(examData));
    }
  }, [examData]);

  // When the user selects a subject, grab its breakdown & subtitles
  useEffect(() => {
    if (selectedSubject && examData?.[selectedSubject]) {
      const breakdown = examData[selectedSubject].breakdown;
      if (breakdown) {
        setTotalMCQs(breakdown.mcq || { easy: 0, medium: 0, hard: 0 });
        setTotalCoding(breakdown.code || { easy: 0, medium: 0, hard: 0 });
      } else {
        setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
        setTotalCoding({ easy: 0, medium: 0, hard: 0 });
      }

      // Use subtitles instead of topics
      const { subtitles } = examData[selectedSubject];
      setDisplaySubtopics(subtitles || []);
      // Clear topics if present
      setDisplayTopics([]);
    } else {
      setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
      setTotalCoding({ easy: 0, medium: 0, hard: 0 });
      setDisplaySubtopics([]);
      setDisplayTopics([]);
    }

    // Reset chosen counts each time we pick a new subject
    setSelectedMCQs({ easy: 0, medium: 0, hard: 0 });
    setSelectedCoding({ easy: 0, medium: 0, hard: 0 });
  }, [selectedSubject, examData]);

  // Handling user-chosen question counts for MCQs
  const handleMCQInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);
    const safeValue = Math.min(
      Math.max(0, isNaN(parsedValue) ? 0 : parsedValue),
      totalMCQs[name] || 0
    );
    setSelectedMCQs({
      ...selectedMCQs,
      [name]: safeValue,
    });
  };

  // Handling user-chosen question counts for Coding questions
  const handleCodingInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);
    const safeValue = Math.min(
      Math.max(0, isNaN(parsedValue) ? 0 : parsedValue),
      totalCoding[name] || 0
    );
    setSelectedCoding({
      ...selectedCoding,
      [name]: safeValue,
    });
  };

  // Add or update the chosen subject in the examSubjects array
  const handleSetSubject = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject first.");
      return;
    }

    const existingIndex = examSubjects.findIndex(
      (item) => item.subject === selectedSubject
    );

    const tags = examData[selectedSubject]?.tags || [];
    const mcqTime = selectedMCQs.easy + selectedMCQs.medium + selectedMCQs.hard;
    const codingTime =
      selectedCoding.easy * 5 +
      selectedCoding.medium * 10 +
      selectedCoding.hard * 15;
    const totalTime = mcqTime + codingTime;

    const newEntry = {
      subject: selectedSubject,
      tags,
      selectedMCQs: { ...selectedMCQs },
      selectedCoding: { ...selectedCoding },
      totalTime,
    };

    if (existingIndex >= 0) {
      setExamSubjects((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? newEntry : item))
      );
      toast.success(`Updated questions for ${selectedSubject}.`);
    } else {
      setExamSubjects((prev) => [...prev, newEntry]);
      toast.success(`Questions set for ${selectedSubject}.`);
    }
  };

  const handleDeleteSubject = (subjectName) => {
    setExamSubjects((prev) =>
      prev.filter((item) => item.subject !== subjectName)
    );
    toast.success(`Deleted questions for ${subjectName}.`);
  };

  // Optionally, let the user edit by re-selecting the subject
  const handleEditSubject = (subjectName) => {
    const found = examSubjects.find((item) => item.subject === subjectName);
    if (found) {
      setSelectedSubject(found.subject);
      setSelectedMCQs(found.selectedMCQs);
      setSelectedCoding(found.selectedCoding);
    }
  };

  // Submit final data to create the exam
  const handleCreateExam = async () => {
    if (examSubjects.length === 0 || !startDate || !startTime) {
      toast.error("Please select at least one subject and enter date/time.");
      return;
    }

    setCreatingExam(true);

    // Gather total exam time
    const totalExamTime = examSubjects.reduce(
      (sum, item) => sum + item.totalTime,
      0
    );
    console.log("Exam Data", examData);
    const type = "Daily-Exam";
    const newExamPayload = {
      type: type,
      batch: batch?.Batch,
      subjects: examSubjects,
      totalExamTime,
      startDate,
      startTime,
      managerId,
      managerLocation,
    };
    console.log(newExamPayload);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/generate-exam-paper`,
        newExamPayload
      );
      toast.success(response.data.message);
      navigate("/create-exam");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to create exam. Try again."
      );
    } finally {
      setCreatingExam(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-6 mt-0">
      <div className="flex flex-col lg:flex-row lg:w-[90%] mx-auto gap-6 justify-center">
        {/* Left Panel - Setting up one subject at a time */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full lg:w-[60%]">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Set Questions for{" "}
            <span className="bg-gradient-to-r from-red-500 to-blue-500 text-transparent bg-clip-text">
              {batch?.Batch}
            </span>
          </h2>

          {/* Subject Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Select Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Subject --</option>
              {subjectList.map((subKey) => (
                <option key={subKey} value={subKey}>
                  {subKey}
                </option>
              ))}
            </select>
          </div>

          {/* Subtopics Display */}
          {selectedSubject && (
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Topics for Exam
              </h3>
              {displaySubtopics.length > 0 ? (
                <ul className="list-disc ml-5 text-gray-700">
                  {displaySubtopics.map((subtopic, idx) => (
                    <li key={idx}>{subtopic.trim()}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No subtopics available.</p>
              )}
            </div>
          )}

          {/* Question Breakdown */}
          {selectedSubject && (
            <>
              {/* MCQ Questions */}
              {totalMCQs.easy + totalMCQs.medium + totalMCQs.hard > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    MCQ Questions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {["easy", "medium", "hard"].map((level) => {
                      const total = totalMCQs[level] || 0;
                      if (total > 0) {
                        return (
                          <div key={level} className="flex flex-col">
                            <label className="mb-2 font-medium text-gray-600">
                              {level.charAt(0).toUpperCase() + level.slice(1)}{" "}
                              (Total: {total})
                            </label>
                            <input
                              type="number"
                              name={level}
                              value={
                                selectedMCQs[level] === 0
                                  ? ""
                                  : selectedMCQs[level]
                              }
                              onChange={handleMCQInputChange}
                              placeholder="Enter count"
                              min="0"
                              max={total}
                              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Coding Questions */}
              {totalCoding.easy + totalCoding.medium + totalCoding.hard > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Coding Questions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {["easy", "medium", "hard"].map((level) => {
                      const total = totalCoding[level] || 0;
                      if (total > 0) {
                        return (
                          <div key={level} className="flex flex-col">
                            <label className="mb-2 font-medium text-gray-600">
                              {level.charAt(0).toUpperCase() + level.slice(1)}{" "}
                              (Total: {total})
                            </label>
                            <input
                              type="number"
                              name={level}
                              value={
                                selectedCoding[level] === 0
                                  ? ""
                                  : selectedCoding[level]
                              }
                              onChange={handleCodingInputChange}
                              placeholder="Enter count"
                              min="0"
                              max={total}
                              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Button to set/update the chosen subject’s question counts */}
              {(totalMCQs.easy + totalMCQs.medium + totalMCQs.hard > 0 ||
                totalCoding.easy + totalCoding.medium + totalCoding.hard >
                  0) && (
                <button
                  onClick={handleSetSubject}
                  className={`mt-4 px-6 py-3 text-white rounded-lg ${
                    creatingExam
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={creatingExam}
                  hidden={creatingExam}
                >
                  Set Questions
                </button>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Summary & Creation */}
        {examSubjects.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md w-full lg:w-[40%]">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Exam Summary (Total Time:{" "}
              {examSubjects.reduce((sum, s) => sum + s.totalTime, 0)} mins)
            </h3>
            <ul className="space-y-3">
              {examSubjects.map((item, index) => {
                const { subject, selectedMCQs, selectedCoding, totalTime } =
                  item;
                return (
                  <li
                    key={index}
                    className="p-4 border rounded-lg bg-gray-100 shadow-md flex flex-col space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl font-semibold text-gray-800">
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteSubject(subject)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-row gap-1 text-gray-700">
                      <p>
                        <strong>MCQs:</strong> Easy ({selectedMCQs.easy}),
                        Medium ({selectedMCQs.medium}), Hard (
                        {selectedMCQs.hard})
                      </p>
                      <p>
                        <strong>Coding:</strong> Easy ({selectedCoding.easy}),
                        Medium ({selectedCoding.medium}), Hard (
                        {selectedCoding.hard})
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mt-2 text-sm text-blue-800">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsTimeCollapsed(!isTimeCollapsed)}
                      >
                        <span className="font-semibold">
                          ⏳ Time Constraints: {totalTime} mins
                        </span>
                        <span>{isTimeCollapsed ? "▼" : "▲"}</span>
                      </div>
                      {!isTimeCollapsed && (
                        <ul className="mt-1 space-y-1">
                          <li>
                            <strong>MCQ Time:</strong>{" "}
                            {selectedMCQs.easy +
                              selectedMCQs.medium +
                              selectedMCQs.hard}{" "}
                            mins (assuming 1 min each MCQ)
                          </li>
                          <li>
                            <strong>Coding Time:</strong>{" "}
                            {selectedCoding.easy * 5 +
                              selectedCoding.medium * 10 +
                              selectedCoding.hard * 15}{" "}
                            mins
                          </li>
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Date and Time Selection */}
            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Select Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Select Start Time:
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Create Exam Button */}
            <button
              onClick={handleCreateExam}
              className={`mt-4 px-6 py-3 text-white rounded-lg ${
                creatingExam
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={creatingExam}
            >
              {creatingExam ? "Creating Exam..." : "Create Exam"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
