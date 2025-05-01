import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const DailyExamReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve exam data from the navigation state; defaults to an empty array if not provided
  const { exams = [] } = location.state || {};
  const [loadingId, setLoadingId] = useState(null);

  // 1) Sort exams in descending order based on the numeric part of examName.
  //    For example, "Daily-Exam-9" will come before "Daily-Exam-8".
  //    If examName doesn't follow this format, adjust the logic as needed.
  const sortedExams = exams.slice().sort((a, b) => {
    const numA = parseInt(a.examName.replace(/\D+/g, ""), 10) || 0;
    const numB = parseInt(b.examName.replace(/\D+/g, ""), 10) || 0;
    return numB - numA; // descending order
  });

  const handleExamClick = async (exam) => {
    setLoadingId(exam.examName);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/exam-batch-reports`,
        {
          params: {
            batch: exam.batch,
            examName: exam.examName,
          },
        }
      );
      const data = response.data;
      // Navigate to the exam day details page with the fetched data
      navigate("/students-performance-manager/exam-day", { state: data });
    } catch (error) {
      console.error("Error fetching exam details:", error);
      toast.error("Error fetching exam details");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen  p-6 mt-0">
      {/* Back button */}
      <button
        className="mb-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded shadow-lg transition duration-200"
        onClick={() => navigate(-1)}
      >
        Back to Dashboard
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Daily Exam Report
      </h1>

      {sortedExams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedExams.map((exam, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 border-t-4 hover:shadow-2xl transition duration-300 ease-in-out"
              style={{
                borderTop: "4px solid transparent",
                borderImage: "linear-gradient(to bottom right, red, purple) 1",
              }}
            >
              {/* Exam Title */}
              <h2 className="text-xl font-bold text-gray-700 mb-3">
                {exam.examName}
              </h2>

              {/* Action Button */}
              <button
                onClick={() => handleExamClick(exam)}
                disabled={loadingId === exam.examName}
                // className="relative inline-block px-4 py-2 font-medium text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-70"
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
              >
                <span className="relative px-3 py-1 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent text-lg">
                  {loadingId === exam.examName ? "Loading..." : "Daily Exam"}
                </span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No exam performance data available.
        </p>
      )}
    </div>
  );
};

export default DailyExamReport;
