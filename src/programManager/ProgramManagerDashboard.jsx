import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTasks,
  FaClipboardList,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { decryptData } from "../../cryptoUtils.jsx";

const ProgramManagerDashboard = () => {
  const navigate = useNavigate();
  const location = decryptData(sessionStorage.getItem("location"));

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className=" mt-0">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-8">
          {" "}
          Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Students Enrolled */}
          {location !== "all" && (
            <div
              className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer hover:shadow-2xl transform transition-transform hover:scale-105"
              onClick={() => handleNavigation("/student-enroll")}
            >
              <FaUserGraduate className="text-blue-600 text-5xl" />
              <div>
                <h3 className="text-2xl font-semibold text-blue-600">
                  Students Enrollment
                </h3>
                <p className="text-gray-600"> students enroll</p>
              </div>
            </div>
          )}

          {/* Ongoing Live Classes */}
          <div
            className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer hover:shadow-2xl transform transition-transform hover:scale-105"
            onClick={() => handleNavigation("/live-classes")}
          >
            <FaChalkboardTeacher className="text-green-600 text-5xl" />
            <div>
              <h3 className="text-2xl font-semibold text-green-600">
                Live Classes
              </h3>
              <p className="text-gray-600">ongoing live classes</p>
            </div>
          </div>

          <div
            className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer hover:shadow-2xl transform transition-transform hover:scale-105"
            onClick={() => handleNavigation("/viewbatch")}
          >
            <FaClipboardList className="text-purple-600 text-5xl" />
            <div>
              <h3 className="text-2xl font-semibold text-purple-600">
                Batches
              </h3>
              <p className="text-gray-600">View and manage all batches</p>
            </div>
          </div>

          {/* Student Performance */}
          {location !== "all" && (
            <div
              className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer hover:shadow-2xl transform transition-transform hover:scale-105"
              onClick={() => handleNavigation("/students-performance-manager")}
            >
              <FaTasks className="text-red-600 text-5xl" />
              <div>
                <h3 className="text-2xl font-semibold text-red-600">
                  Student Performance
                </h3>
                <p className="text-gray-600">Analyze and monitor performance</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgramManagerDashboard;
