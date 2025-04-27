import React from "react";
import { FaTrophy, FaStar, FaMedal } from "react-icons/fa";
import { useStudent } from '../contexts/StudentProfileContext';


const StudentDashboard = () => {
  const { studentDetails } = useStudent();
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-800 to-blue-600 text-white">
    

      {/* Main Dashboard */}
      <div className="container mx-auto py-10 px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg shadow-xl mb-8  transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-2">Welcome Back, John!</h2>
          <p className="text-lg">
            You're on a <span className="font-extrabold text-yellow-400">7-day streak</span>! Keep it up!
          </p>
          <p className="text-sm mt-2">Level: <span className="font-bold text-green-300">5 Achiever</span></p>
        </div>

        {/* Gamification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
            <p className="text-lg mb-4">Course Completion: 75%</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: "75%" }}
              ></div>
            </div>
            <p className="text-sm mt-2 text-gray-600">Almost there! Keep pushing! 🚀</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 text-center">
            <h3 className="text-xl font-semibold mb-4">Your Badges</h3>
            <div className="flex justify-center space-x-4">
            <FaStar className="text-white text-3xl animate-spin" />
            <FaTrophy className="text-white text-3xl animate-bounce" />
            <FaMedal className="text-white text-3xl animate-pulse" />
            </div>
            <p className="text-sm mt-4">Earn more badges by completing challenges!</p>
          </div>
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
            <ul className="text-sm space-y-2">
              <li>🏆 <strong>Sarah M.</strong> - 5000 Points</li>
              <li>🎉 <strong>John D.</strong> - 3500 Points</li>
              <li>💪 <strong>Chris P.</strong> - 3000 Points</li>
            </ul>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 rounded-lg shadow-xl mb-8  transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-bold">[5 mins ago]</span> Completed Assignment 5 🎉
            </li>
            <li>
              <span className="font-bold">[2 hours ago]</span> Attended React Basics class 💻
            </li>
            <li>
              <span className="font-bold">[Yesterday]</span> Scored 95% on Python Quiz 🎯
            </li>
          </ul>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg shadow-xl  transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-4">Upcoming Classes</h3>
          <ul className="space-y-2 text-sm">
            <li>📘 Data Science - Today at 5 PM</li>
            <li>📙 React Basics - Tomorrow at 10 AM</li>
            <li>📗 AI and ML - Friday at 2 PM</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


