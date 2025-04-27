import React, { useState, useEffect } from "react";
import UploadQuestions from "./UploadQuestions";
import ViewQuestionBank from "./ViewQuestionBank";

const ManageExams = () => {
  // Initialize state from localStorage or default to "upload"
  const [activeComponent, setActiveComponent] = useState(
    localStorage.getItem("activeComponent") || "upload"
  );

  // Update localStorage whenever activeComponent changes
  useEffect(() => {
    localStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);

  const toggleComponent = (component) => {
    setActiveComponent(component);
  };

  return (
    <div className="manage-exams bg-gradient-to-b from-blue-100 to-white h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        <span className="bg-gradient-to-r from-blue-600 to-red-500 text-transparent bg-clip-text">
          Manage Exams
        </span>
      </h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => toggleComponent("upload")}
          className={`px-6 py-2 rounded-lg text-white font-medium shadow-md ${
            activeComponent === "upload"
              ? "bg-gradient-to-br from-red-400 to-blue-600"
              : "bg-gray-400 hover:bg-gray-600"
          } transition`}
        >
          Upload Questions
        </button>
        <button
          onClick={() => toggleComponent("question-bank")}
          className={`px-6 py-2 rounded-lg text-white font-medium shadow-md ${
            activeComponent === "question-bank"
              ? "bg-gradient-to-br from-red-400 to-blue-600"
              : "bg-gray-400 hover:bg-gray-600"
          } transition`}
        >
          View Question Bank
        </button>
      </div>
      <div className="component-container">
        {activeComponent === "upload" && <UploadQuestions />}
        {activeComponent === "question-bank" && <ViewQuestionBank />}
      </div>
    </div>
  );
};

export default ManageExams;
