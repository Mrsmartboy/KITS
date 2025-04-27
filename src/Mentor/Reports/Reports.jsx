import React from "react";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div>
      <div
        onClick={() => handleNavigation("/daily-exams-reports")}
        className="schedule-exams-reports bg-transparent p-6"
      >
        <div className="flex flex-wrap justify-center gap-6">
          {/* Daily Exams */}
          <div className="exam-card w-full sm:w-[calc(50%-1rem)] p-6 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
            <h3 className="font-bold text-xl text-blue-700 mb-3">
              Daily Exams
            </h3>
            <p className="mb-3 font-normal text-gray-600">
              View and manage daily exam reports easily.
            </p>
          </div>

          {/* Weekly Exams */}
          <div
            onClick={() => handleNavigation("/weekly-exams-reports")}
            className="exam-card w-full sm:w-[calc(50%-1rem)] p-6 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <h3 className="font-bold text-xl text-blue-700 mb-3">
              Weekly Exams
            </h3>
            <p className="mb-3 font-normal text-gray-600">
              Access weekly exam performance reports here.
            </p>
          </div>

          {/* Grand Exams */}
          <div
            onClick={() => handleNavigation("/grand-test-reports")}
            className="exam-card w-full sm:w-[calc(50%-1rem)] p-6 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <h3 className="font-bold text-xl text-blue-700 mb-3">
              Grand Exams
            </h3>
            <p className="mb-3 font-normal text-gray-600">
              Analyze performance for grand tests here.
            </p>
          </div>

          {/* Surprise Test */}
          <div
            onClick={() => handleNavigation("/surprise-test-reports")}
            className="exam-card w-full sm:w-[calc(50%-1rem)] p-6 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <h3 className="font-bold text-xl text-blue-700 mb-3">
              Surprise Test
            </h3>
            <p className="mb-3 font-normal text-gray-600">
              Explore surprise test reports in detail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
