import React, { useState, useEffect } from "react";
// import axios from "axios"; // Import axios for API calls
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";
import { Table } from "./Table.jsx";
import { decryptData } from "../../cryptoUtils.jsx";

const Course = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const mentorId = decryptData(sessionStorage.getItem("id"));
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData();
  const [selectedBatch, setSelectedBatch] = useState(""); // Add this at the top

  useEffect(() => {
    fetchMentorStudents(selectedBatch);
  }, [fetchMentorStudents]);

  useEffect(() => {
    if (Array.isArray(scheduleData)) {
      const uniqueSubjects = [
        ...new Set(scheduleData.map((item) => item.subject)),
      ];
      setAvailableSubjects(uniqueSubjects);
    }
  }, [scheduleData]);

  // Dynamically filter batches based on selected subject
  useEffect(() => {
    if (selectedSubject && Array.isArray(scheduleData)) {
      const batches = scheduleData
        .filter((entry) => entry.subject === selectedSubject) // Filter by subject
        .flatMap((entry) => entry.batchNo); // Flatten batchNo lists
      setFilteredBatches(batches); // Store filtered batches
    } else {
      setFilteredBatches([]);
    }
  }, [selectedSubject, scheduleData]);

  

  return (
    <div className="flex flex-col justify-start items-center px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8 mt-0">
      <h1 className="text-[#19216f] font-poppins font-semibold text-[32px] leading-[48px] text-center">
        Mentor Curriculum
      </h1>


      <div className="bg-white w-full max-w-full h-auto shadow-md rounded-md mt-6 p-8 flex flex-col justify-center">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center px-1 space-y-4 sm:space-y-0">
          <div className="flex items-center w-full sm:w-1/2">
            <label className="text-[#19216f] font-poppins font-semibold text-md leading-[36px] text-xl  mr-2">
              Select a Subject
            </label>
            <select
              className="w-full sm:w-[263px] h-[46px] bg-white border border-gray-300 rounded-[2px] px-3 shadow-md focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedSubject(e.target.value)}
              value={selectedSubject}
            >
              <option value="" className="text-gray-400">
                --Select Subject--
              </option>
              {availableSubjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center w-full sm:w-1/2">
            <label className="text-[#19216f] font-poppins font-semibold text-xl leading-[36px] mr-2">
              Select a Batch
            </label>
            <select
              className={`w-full sm:w-[263px] h-[46px] border rounded-[2px] px-3 shadow-md focus:ring-2 focus:ring-blue-500
                ${
                  selectedSubject
                    ? "bg-white border-gray-300 text-black"
                    : "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                }`}
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={!selectedSubject} 
            >
              <option value="" disabled>
                Choose a batch
              </option>
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch, index) => (
                  <option key={index} value={batch}>
                    {batch}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No batches available
                </option>
              )}
            </select>
          </div>
        </div>

        {/* <div className="w-full max-w-full border-t border-[#303C60] mt-6 mx-auto"></div> */}

        <div className="w-full max-w-full mx-auto mt-6 bg-white rounded-md min-h-[500px]  md:p-2">
          <div className="overflow-x-auto flex items-center justify-center h-full">
            <Table
              subject={selectedSubject}
              batch={selectedBatch}
              mentorId={mentorId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
