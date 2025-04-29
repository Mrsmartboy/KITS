import React,{useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";


const MentorDashboard = () => {
    const {  fetchMentorStudents } = useStudentsMentorData();
      useEffect(() => {
        fetchMentorStudents();
      }, [fetchMentorStudents]);

  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div
    className="min-h-screen mt-0 bg-repeat"
    style={{ backgroundImage: "url('/bgimage.png')", backgroundColor: "#EDF2FF" }}
  >
  
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Mentor Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Live Classes */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg" 
            onClick={() => handleNavigation('/mentor-batches')}
          >
            <FaChalkboardTeacher className="text-blue-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-blue-600">Live Batches</h2>
              <p className="text-gray-600">Ongoing Live Batches </p>
            </div>
          </div>

          {/* Students */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg" 
            onClick={() => handleNavigation('/mentorstudentslist')}
          >
            <FaUsers className="text-green-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-green-600">Students</h2>
              <p className="text-gray-600">Monitor student progress and engagement</p>
            </div>
          </div>

          {/* Attendance */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg" 
            onClick={() => handleNavigation('/attendance')}
          >
            <FaCalendarAlt className="text-yellow-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-yellow-600">Attendance</h2>
              <p className="text-gray-600">Track and manage attendance records</p>
            </div>
          </div>

           {/* <div 
            className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer hover:shadow-2xl transform transition-transform hover:scale-105"
            onClick={() => handleNavigation('/studentdata')}
          >
            <FaTasks className="text-red-600 text-5xl" />
            <div>
              <h3 className="text-2xl font-semibold text-red-600">Student Performance</h3>
              <p className="text-gray-600">Analyze and monitor performance</p>
            </div>
          </div> */}

          {/* <div 
            className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg" 
            onClick={() => handleNavigation('/assignments')}
          >
            <FaBook className="text-purple-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-purple-600">Assignments</h2>
              <p className="text-gray-600">Review and grade assignments.</p>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg" 
            onClick={() => handleNavigation('/tasks')}
          >
            <FaTasks className="text-red-600 text-4xl" />
            <div>
              <h2 className="text-xl font-semibold text-red-600">Tasks</h2>
              <p className="text-gray-600">Manage and delegate tasks effectively.</p>
            </div>
          </div> */}

        
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;