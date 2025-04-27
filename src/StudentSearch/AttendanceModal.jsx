import React, { useState } from "react";

const AttendanceModal = ({ isOpen, onClose, attendance = [] }) => {
  // useState must be at the top level
  const [expandedCourse, setExpandedCourse] = useState(null);

  if (!isOpen) return null; // Don't render if modal is closed

  // Group attendance by course
  const groupedAttendance = attendance.reduce((acc, record) => {
    if (!acc[record.course]) {
      acc[record.course] = [];
    }
    acc[record.course].push(record);
    return acc;
  }, {});

  const toggleCourse = (course) => {
    setExpandedCourse(expandedCourse === course ? null : course);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
        >
          &times;
        </button>

        <h3 className="text-2xl font-extrabold text-center text-gradient bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
          Attendance Details
        </h3>

        <div className="overflow-y-auto max-h-96 space-y-4">
          {Object.keys(groupedAttendance).length > 0 ? (
            Object.keys(groupedAttendance).map((course, index) => {
              // For each course, aggregate attendance by unique datetime
              const uniqueAttendance = groupedAttendance[course].reduce(
                (acc, record) => {
                  const date = record.datetime;
                  // If this date hasn't been seen, add it
                  if (!acc[date]) {
                    acc[date] = record.status.toLowerCase();
                  } else {
                    // If already exists, mark the date as present if any record is "present"
                    if (acc[date] !== "present" && record.status.toLowerCase() === "present") {
                      acc[date] = "present";
                    }
                  }
                  return acc;
                },
                {}
              );

              const totalDays = Object.keys(uniqueAttendance).length;
              const presentDays = Object.values(uniqueAttendance).filter(
                (status) => status === "present"
              ).length;
              const absentDays = totalDays - presentDays;

              return (
                <div key={index} className="border border-gray-300 rounded-lg shadow-md">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 font-semibold cursor-pointer flex justify-between items-center rounded-t-lg"
                    onClick={() => toggleCourse(course)}
                  >
                    <span className="text-lg">{course}</span>
                    <span className="text-xl">{expandedCourse === course ? "▼" : "▶"}</span>
                  </div>

                  {expandedCourse === course && (
                    <div className="bg-white p-4">
                      {/* Totals for this course */}
                      <div className="mb-4 text-center">
                        <span className="text-blue-500 font-bold mr-4">
                          Total Days: {totalDays}
                        </span>
                        <span className="text-green-600 font-bold mr-4">
                          Present: {presentDays}
                        </span>
                        <span className="text-red-600 font-bold">
                          Absent: {absentDays}
                        </span>
                      </div>

                      {/* Table with unique attendance by date */}
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100 text-gray-800">
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                              Date
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(uniqueAttendance)
                            .sort() // sort dates if needed
                            .map((date, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                <td className="border border-gray-300 px-4 py-2">{date}</td>
                                <td
                                  className={`border border-gray-300 px-4 py-2 font-semibold text-center rounded-md ${
                                    uniqueAttendance[date] === "present"
                                      ? "text-green-600 bg-green-100"
                                      : "text-red-600 bg-red-100"
                                  }`}
                                >
                                  {uniqueAttendance[date].charAt(0).toUpperCase() +
                                    uniqueAttendance[date].slice(1)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center text-lg">
              No attendance data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
