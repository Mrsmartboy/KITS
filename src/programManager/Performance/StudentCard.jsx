import React from "react";
import {
  FaUser,
  FaIdBadge,
  FaPhone,
  FaStar,
  FaClipboardCheck,
} from "react-icons/fa";

const StudentCard = ({ student }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
      <div className="flex items-center mb-4">
        <FaUser className="text-indigo-500 mr-3 text-3xl" />
        <h2 className="text-2xl font-bold text-indigo-600">{student.name}</h2>
      </div>
      <p className="text-gray-700 mb-2 flex items-center">
        <FaIdBadge className="mr-2 text-indigo-500" />
        <span className="font-semibold">ID:</span>{" "}
        {student.studentId || student.id}
      </p>
      <p className="text-gray-700 mb-2 flex items-center">
        <FaPhone className="mr-2 text-indigo-500" />
        <span className="font-semibold">Phone:</span> {student.phone}
      </p>
      <p className="text-gray-700 mb-2 flex items-center">
        <FaClipboardCheck className="mr-2 text-indigo-500" />
        <span className="font-semibold">Attempted Exam:</span>{" "}
        {student.attempted ? "Attempted Exam" : "Did Not Attempt"}
      </p>
      {student.totalScore !== undefined && (
        <p className="text-gray-700 flex items-center">
          <FaStar className="mr-2 text-yellow-500" />
          <span className="font-semibold">Total Score:</span>{" "}
          {student.totalScore}
        </p>
      )}
    </div>
  );
};

export default StudentCard;
