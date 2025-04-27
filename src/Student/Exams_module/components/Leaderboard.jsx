import React, { useState } from "react";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Mock leaderboard data
  const leaderboardData = { 
    all: [
      { id: 1, name: "John Doe", points: 1200, isCurrentUser: true },
      { id: 2, name: "Jane Smith", points: 1100, isCurrentUser: false },
      { id: 3, name: "Bob Johnson", points: 1050, isCurrentUser: false },
    ],
    daily: [
      { id: 1, name: "John Doe", points: 95, isCurrentUser: true },
      { id: 2, name: "Jane Smith", points: 92, isCurrentUser: false },
      { id: 3, name: "Bob Johnson", points: 88, isCurrentUser: false },
    ],
    weekly: [
      { id: 1, name: "Alice Brown", points: 300, isCurrentUser: false },
      { id: 2, name: "John Doe", points: 280, isCurrentUser: true },
      { id: 3, name: "Jane Smith", points: 270, isCurrentUser: false },
    ],
    grand: [
      { id: 1, name: "Bob Johnson", points: 500, isCurrentUser: false },
      { id: 2, name: "Charlie Davis", points: 450, isCurrentUser: false },
      { id: 3, name: "John Doe", points: 400, isCurrentUser: true },
    ],
  };

  return (
    <div className="bg-blue-100 p-6 md:p-10 rounded-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
        Leaderboard
      </h2>

      {/* Tabs for Exam Types */}
      <div className="flex justify-center space-x-4 mb-6">
        {["all", "daily", "weekly", "grand"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium rounded-lg shadow ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 hover:bg-gray-200"
            }`}
          >
            {tab === "all" ? "All Exams" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Exams`}
          </button>
        ))}
      </div>

      {/* Leaderboard Content */}
      <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
        {leaderboardData[activeTab].map((entry, index) => (
          <div
            key={entry.id}
            className={`flex justify-between items-center p-4 ${
              entry.isCurrentUser ? "bg-gray-100 border-l-4 border-blue-600" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-gray-800">
                #{index + 1}
              </span>
              <span className="text-lg font-medium text-gray-800">
                {entry.name}
              </span>
              {entry.isCurrentUser && (
                <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-lg">
                  You
                </span>
              )}
            </div>
            <span className="text-lg font-bold text-gray-700">
              {entry.points} points
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
