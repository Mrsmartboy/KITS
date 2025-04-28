import React from 'react';
import { useStudent } from '../contexts/StudentProfileContext';
import { useNavigate } from 'react-router-dom';

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 m-4 w-72 h-48 flex flex-col justify-center items-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/codepractice/${subject}`)}
    >
      <div className="absolute inset-0 bg-black opacity-10" />
      <h2 className="text-2xl font-bold z-10">{subject}</h2>
      <p className="text-sm mt-2 z-10">Explore {subject} curriculum</p>
    </div>
  );
};

const CodePractice = () => {
  const { studentDetails } = useStudent();
  const subjects = studentDetails?.subjects || ['DS-C', 'Python', 'C'];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Code Practice</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {subjects.slice(0, 3).map((subject) => (
          <SubjectCard key={subject} subject={subject} />
        ))}
      </div>
    </div>
  );
};

export default CodePractice;