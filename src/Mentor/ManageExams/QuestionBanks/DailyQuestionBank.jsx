
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useStudentsMentorData } from "../../../contexts/MentorStudentsContext";
import { useNavigate } from "react-router-dom";
import { decryptData } from '../../../../cryptoUtils.jsx'

export const DailyQuestionBank = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [scheduleData, setScheduleData] = useState([]);
  const [examStatus, setExamStatus] = useState({}); // To store existing exams
  const { scheduleData: mentorScheduleData } = useStudentsMentorData();
  const location = decryptData(localStorage.getItem("location"));
  const mentorId = decryptData(localStorage.getItem("Mentors"));

  const API_FETCH_SCHEDULE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/fetch-daily-exam-syllabus`;
  const API_CHECK_EXAM = `${import.meta.env.VITE_BACKEND_URL}/api/v1/check-exam-status`;

  useEffect(() => {
    if (selectedBatch) {
      fetchScheduleData(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchScheduleData = async (batchNo) => {
    try {
      const response = await axios.get(API_FETCH_SCHEDULE, {
        params: { batchNo, location, mentorId },
      });

      if (response.data.success) {
        setScheduleData(response.data.schedule);
        fetchExamStatus(batchNo, response.data.schedule); // Fetch exam status after fetching schedule
      } else {
        setScheduleData([]);
      }
    } catch (error) {
      console.error("API Call Failed:", error);
      setScheduleData([]);
    }
  };

  const fetchExamStatus = async (batchNo, schedule) => {
    try {
      const statusMap = {};

      await Promise.all(
        schedule.map(async (item) => {
          const requestBody = {
            batch: batchNo,
            mentorId,
            subject: item.Subject,
            dayOrder: item.DayOrder,
          };

          const response = await axios.post(API_CHECK_EXAM, requestBody, {
            headers: { "Content-Type": "application/json" },
          });

          statusMap[`${item.Subject}_${item.DayOrder}`] = response.data.exists;
        })
      );

      setExamStatus(statusMap);
    } catch (error) {
      console.error("Error fetching exam status:", error);
    }
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  const handleViewQuestions = async (item) => {


    // Ensure SubTopics and PreviousSubTopics exist and filter out undefined or empty subtopic IDs
    const Tags = [
      ...item.SubTopics?.map((sub) => `${sub.Id}`.toLowerCase()).filter(
        Boolean
      ),
      ...item.PreviousSubTopics?.map((sub) => `${sub.Id}`.toLowerCase()).filter(
        Boolean
      ),
    ];

    if (Tags.length === 0) {
      console.warn("No valid subtopic IDs found.");
      return;
    }

    const requestBody = { subject: item.Subject, Tags };

    const requestUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/fetch-daily-question-bank`;

    try {
      const response = await axios.post(requestUrl, requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        navigate("/view-daily-exams", {
          state: {
            Tags: [
              ...item.SubTopics?.map((sub) => `${sub.Id}`.toLowerCase()).filter(
                Boolean
              ),
              ...item.PreviousSubTopics?.map((sub) =>
                `${sub.Id}`.toLowerCase()
              ).filter(Boolean),
            ],
            dayOrder: item.DayOrder,
            batch: selectedBatch,
            data: response.data,
            subject: item.Subject,
            subTopics: item.SubTopics.map((sub) => sub.subTopic),
            previousSubTopics: item.PreviousSubTopics.map(
              (sub) => sub.subTopic
            ),
          },
        });
      } else {
        console.warn("No questions found.");
      }
    } catch (error) {
      console.error("Failed to fetch daily question bank:", error);
    }
  };

  // Sort scheduleData in descending order by DayOrder
  const sortedScheduleData = scheduleData.slice().sort((a, b) => {
    const dayA = isNaN(a.DayOrder) ? a.DayOrder : Number(a.DayOrder);
    const dayB = isNaN(b.DayOrder) ? b.DayOrder : Number(b.DayOrder);
    if (typeof dayA === "number" && typeof dayB === "number") {
      return dayB - dayA;
    }
    return String(dayB).localeCompare(String(dayA));
  });

  return (
    <div className="min-h-screen h-full bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        <span className="bg-gradient-to-r from-red-500 to-blue-500 text-transparent bg-clip-text">
          Daily Question Bank
        </span>
      </h1>

      {/* Batch Selection Dropdown */}
      <div className="flex justify-end items-center mb-6">
        <select
          onChange={handleBatchChange}
          value={selectedBatch}
          className="w-48 bg-white px-4 py-2 rounded-md text-sm font-semibold text-blue-900 shadow-md border border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="" disabled>
            Select Batch
          </option>
          {mentorScheduleData?.length > 0 &&
            mentorScheduleData.map((data, index) => (
              <option key={index} value={data.batchNo?.[0] || ""}>
                {data.batchNo?.[0] || "Unknown Batch"}
              </option>
            ))}
        </select>
      </div>

      {/* Card Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedScheduleData.length > 0 ? (
          sortedScheduleData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 border-t-4 hover:shadow-2xl transition duration-300 ease-in-out"
              style={{
                borderTop: "4px solid transparent",
                borderImage: "linear-gradient(to bottom right, red, blue) 1",
              }}
            >
              <h3 className="text-lg font-bold text-blue-700">
                {item.DayOrder.charAt(0).toUpperCase() + item.DayOrder.slice(1)}
              </h3>

              <p className="text-gray-800 font-semibold text-md">
                {item.Subject.charAt(0).toUpperCase() + item.Subject.slice(1)}
              </p>

              <p className="text-gray-600 mt-2">
                <span className="font-semibold">Topics:</span> {item.Topics}
              </p>

              <div className="mt-2">
                <h4 className="text-sm font-semibold text-blue-700">
                  Current Topics:
                </h4>
                {item.SubTopics.length > 0 ? (
                  <ul className="list-disc pl-4 text-gray-700">
                    {item.SubTopics.map((sub, idx) => (
                      <li key={idx}>{sub.subTopic}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No Current Topics</p>
                )}
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-semibold text-blue-700">
                  Previous Topics:
                </h4>
                {item.PreviousSubTopics.length > 0 ? (
                  <ul className="list-disc pl-4 text-gray-700">
                    {item.PreviousSubTopics.map((sub, idx) => (
                      <li key={idx}>{sub.subTopic}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No Previous Topics</p>
                )}
              </div>

              <button
                onClick={() => handleViewQuestions(item)}
                disabled={examStatus[`${item.Subject}_${item.DayOrder}`]} // Disable if exam exists
                className={`mt-4 px-4 py-2 rounded-lg font-semibold transition duration-200 ${
                  examStatus[`${item.Subject}_${item.DayOrder}`]
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {examStatus[`${item.Subject}_${item.DayOrder}`]
                  ? "Question Created"
                  : "View Questions"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">
            No data available.
          </p>
        )}
      </div>
    </div>
  );
};

