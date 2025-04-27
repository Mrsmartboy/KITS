import React, { useState, useEffect } from "react";
import axios from "axios";
import { useStudentsMentorData } from "../../../contexts/MentorStudentsContext";
import { useNavigate } from "react-router-dom";
import { decryptData } from '../../cryptoUtils.jsx';
 
export const WeeklyQuestionBank = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [scheduleData, setScheduleData] = useState([]);
  const { scheduleData: mentorScheduleData } = useStudentsMentorData();
  const location = decryptData(localStorage.getItem("location"));
  const mentorId = decryptData(localStorage.getItem("Mentors"));

  // Endpoint to fetch the exam syllabus data
  const API_ENDPOINT = `${import.meta.env.VITE_BACKEND_URL}/api/v1/fetch-daily-exam-syllabus`;

  useEffect(() => {
    if (selectedBatch) {
      fetchScheduleData(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchScheduleData = async (batchNo) => {
    try {
      const response = await axios.get(API_ENDPOINT, {
        params: { batchNo, location, mentorId },
      });

      if (response.data.success) {
        setScheduleData(response.data.schedule);
      } else {
        setScheduleData([]);
      }
    } catch (error) {
      console.error("API Call Failed:", error);
      setScheduleData([]);
    }
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  // Groups the schedule data into weeks, each containing 6 days.
  const groupScheduleByWeeks = () => {
    const weeks = [];
    let currentWeek = [];
    scheduleData.forEach((item, index) => {
      currentWeek.push(item);
      if ((index + 1) % 6 === 0 || index === scheduleData.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeks;
  };

  // This function aggregates the tags from all 6 days of the week and then sends them
  const handleViewQuestionsForWeek = async (weekData) => {
    // Aggregate tags from all items in the week
    const combinedTags = weekData.reduce((acc, item) => {
      const tags = [
        ...item.SubTopics.map((sub) => `${sub.Id}`.toLowerCase()),
        // ...item.PreviousSubTopics.map((sub) => `${sub.Id}`.toLowerCase()),
      ].filter(Boolean);
      return acc.concat(tags);
    }, []);

    // Remove duplicate tags
    const uniqueTags = [...new Set(combinedTags)];

    if (uniqueTags.length === 0) {
      console.warn("No valid subtopic IDs found for the week.");
      return;
    }

    // Determine subject:
    // If all items share the same subject, use that subject.
    // Otherwise, default to "Multiple Subjects" (adjust as needed).
    const subjects = [...new Set(weekData.map((item) => item.Subject))];
    const subject = subjects.length === 1 ? subjects[0] : "Multiple Subjects";

    // Create the request payload with aggregated tags
    const requestBody = {
      subject,
      Tags: uniqueTags,
    };


    // API endpoint for fetching questions (using the same endpoint as before)
    const requestUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/fetch-daily-question-bank`;

    try {
      const response = await axios.post(requestUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        navigate("/view-daily-exams", {
          state: {
            batch: selectedBatch,
            data: response.data,
            subject,
            // Aggregate subtopics from all days (if needed on the next screen)
            subTopics: weekData.flatMap((item) =>
              item.SubTopics.map((sub) => sub.subTopic)
            ),
            previousSubTopics: weekData.flatMap((item) =>
              item.PreviousSubTopics.map((sub) => sub.subTopic)
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

  return (
    <div className="min-h-screen h-full bg-gradient-to-b from-blue-200 to-blue-50 p-4">
      <h1 className="text-4xl text-blue-700 font-bold mb-4 text-center">
        Weekly Question Bank
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

      {/* Week Layout */}
      {groupScheduleByWeeks().map((weekData, index) => (
        <div key={index} className="mb-8">
          <div className="text-xl font-semibold text-blue-700 mb-4">
            Week {index + 1}
          </div>

          {/* Cards for the week */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {weekData.map((item, idx) => (
              <div
                key={idx}
                className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between border border-gray-200"
              >
                {/* Day Order */}
                <h3 className="text-lg font-bold text-blue-700">
                  {item.DayOrder.charAt(0).toUpperCase() +
                    item.DayOrder.slice(1)}
                </h3>

                {/* Subject */}
                <p className="text-gray-800 font-semibold text-md">
                  {item.Subject.charAt(0).toUpperCase() + item.Subject.slice(1)}
                </p>

                {/* Topics */}
                <p className="text-gray-600 mt-2">
                  <span className="font-semibold">Topics:</span> {item.Topics}
                </p>

                {/* Current Topics */}
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

                {/* Previous Topics */}
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
              </div>
            ))}
          </div>

          {/* View Questions for Week Button */}
          <button
            onClick={() => handleViewQuestionsForWeek(weekData)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
          >
            View Questions for Week {index + 1}
          </button>
        </div>
      ))}
    </div>
  );
};
