import React, { useState } from "react";
import AttendanceTableData from "../AttendanceReport/AttendanceTableData";
import CourseAnalytics from "../AttendanceReport/CourseAnalytics";
import AttendanceStats from "../AttendanceReport/AttendanceStats";
import StudentSearch from "../AttendanceReport/StudentSearch";
import AttendanceTrends from "../AttendanceReport/AttendanceTrends";
import StudentDetails from "../AttendanceReport/StudentDetails";

const MainReport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Student Attendance Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Track and analyze student attendance across all courses.
          </p>
        </header>

        {/* Search Bar */}
        <section>
          <StudentSearch onSearch={setSearchQuery} />
        </section>

        {/* Selected Student Details */}
        {selectedStudent && (
          <section className="animate-fade-in">
            <StudentDetails student={selectedStudent} />
          </section>
        )}

        {/* Stats Overview */}
        {/* <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        </section> */}
        <AttendanceStats />


        {/* Charts and Table */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-10">
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <AttendanceTrends />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CourseAnalytics />
            </div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Attendance Records
              </h2>
              <AttendanceTableData
                searchQuery={searchQuery}
                onStudentSelect={handleStudentSelect}
                
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MainReport;
