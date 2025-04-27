import React from 'react';

const InstructorCompletion = () => {
  // Sample data for instructors and their details
  const instructors = [
    { id: 1, name: 'John Doe', subject: 'Core Java', completion: 85, currentlyTeaching: true, topic: 'OOP Concepts' },
    { id: 2, name: 'Jane Smith', subject: 'Advance Java', completion: 70, currentlyTeaching: false, topic: '' },
    { id: 3, name: 'Sam Wilson', subject: 'Python', completion: 95, currentlyTeaching: true, topic: 'Data Structures' },
    { id: 4, name: 'Emily Davis', subject: 'Frontend', completion: 60, currentlyTeaching: false, topic: '' },
    { id: 5, name: 'Robert Brown', subject: 'MYSQL', completion: 75, currentlyTeaching: true, topic: 'Joins and Queries' },
    { id: 6, name: 'Sophia Johnson', subject: 'Aptitude', completion: 90, currentlyTeaching: false, topic: '' },
    { id: 7, name: 'Michael Lee', subject: 'Soft Skills', completion: 80, currentlyTeaching: true, topic: 'Effective Communication' },
    { id: 8, name: 'Olivia Green', subject: 'Data Science', completion: 88, currentlyTeaching: false, topic: '' },
    { id: 9, name: 'William Harris', subject: 'Data Analytics', completion: 92, currentlyTeaching: true, topic: 'Visualization Techniques' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-10">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-center text-purple-800 mb-12">Instructor Subject Completion</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="p-6 rounded-xl shadow-lg bg-white transition transform hover:scale-105 hover:shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-purple-600 mb-2">{instructor.name}</h2>
              <p className="text-gray-700 text-lg mb-2">
                <span className="font-medium">Subject:</span> {instructor.subject}
              </p>
              <div className="relative pt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-purple-700">Completion</span>
                  <span className="text-sm font-medium text-purple-700">{instructor.completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${instructor.completion}%` }}
                  ></div>
                </div>
              </div>
              <p className={`mt-4 text-lg font-semibold ${
                instructor.currentlyTeaching ? 'text-green-600' : 'text-red-600'
              }`}>
                {instructor.currentlyTeaching ? 'Currently Teaching' : 'Not Teaching Now'}
              </p>
              {instructor.currentlyTeaching && (
                <p className="mt-2 text-gray-700 text-lg">
                  <span className="font-medium">Topic:</span> {instructor.topic}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-0 text-center">
          <p className="text-gray-600 text-lg">Track the progress of each instructor's subject, their teaching status, and topics covered!</p>
        </div>
      </div>
    </div>
  );
};

export default InstructorCompletion;
