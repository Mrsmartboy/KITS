import React from "react";
import { useNavigate } from "react-router-dom";

const Exams = () => {
  const navigate = useNavigate();

  const examTypes = [
    {
      name: "Daily Exam",
      description: "Solve daily challenges to boost your skills.",
      path: "/daily-exam",
    },
    { 
      name: "Weekly Exam",
      description: "Test your knowledge weekly on broader topics.",
      path: "/weekly-exam",
    },
    {
      name: "Grand Exam",
      description: "A comprehensive test covering all major topics.",
      path: "/grand-exam",
    },
    {
      name: "Surprise Exam",
      description: "Ad-hoc exams to keep you sharp and ready.",
      path: "/surprise-exam",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {examTypes.map((exam) => (
        <div
          key={exam.name}
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate(exam.path)}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{exam.name}</h2>
          <p className="text-gray-600">{exam.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Exams;
