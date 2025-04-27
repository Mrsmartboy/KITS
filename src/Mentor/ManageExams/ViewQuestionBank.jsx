import React from "react";
import { useNavigate } from "react-router-dom";

const ViewQuestionBank = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="flex gap-2 flex-col items-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Daily Exam */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-2xl transition duration-300 ease-in-out"
          style={{
            borderTop: "4px solid transparent",
            borderImage: "linear-gradient(to bottom right, red, blue) 1",
          }}
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Check Daily Exam Questions
          </h2>
          <button
            onClick={() => navigate("/daily-exams")}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
          >
            <span className="relative p-3 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Go to Daily Exam
            </span>
          </button>
        </div>

        {/* Weekly Exam */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500 hover:shadow-2xl transition duration-300 ease-in-out"
          style={{
            borderTop: "4px solid transparent",
            borderImage: "linear-gradient(to bottom right, red, blue) 1",
          }}
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Check Weekly Exam Questions
          </h2>
          <button
            onClick={() => navigate("/weekly-exams")}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
          >
            <span className="relative p-3 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Go to Weekly Exam
            </span>
          </button>
        </div>

        {/* Grand Test */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-2xl transition duration-300 ease-in-out"
          style={{
            borderTop: "4px solid transparent",
            borderImage: "linear-gradient(to bottom right, red, blue) 1",
          }}
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Check Grand Test Questions
          </h2>
          <button
            onClick={() => navigate("/grand-tests")}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
          >
            <span className="relative p-3 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Go to Grand Test
            </span>
          </button>
        </div>

        {/* Monthly Exam */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-500 hover:shadow-2xl transition duration-300 ease-in-out"
          style={{
            borderTop: "4px solid transparent",
            borderImage: "linear-gradient(to bottom right, red, blue) 1",
          }}
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Check Monthly Exam Questions
          </h2>
          <button
            onClick={() => navigate("/monthly-exams")}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
          >
            <span className="relative p-3 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Go to Monthly Exam
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuestionBank;
