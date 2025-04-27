import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const mockSubjects = [
  "SelectSubject",
  "Python",
  "MySQL",
  "Flask",
  "Frontend",
  "SoftSkills",
  "Aptitude",
  "CoreJava",
  "AdvancedJava",
];
const mockBatches = ["SelectBatch", "PFS-100", "PFS-101", "PFS-102", "JFS-100", "JFS-101", "JFS-102"];

const AttendanceTableData = ({ searchQuery, onStudentSelect }) => {
  const [selectedSubject, setSelectedSubject] = useState("SelectSubject");
  const [filteredBatches, setFilteredBatches] = useState(["SelectBatch"]);
  const [selectedBatch, setSelectedBatch] = useState("SelectBatch");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update filtered batches based on the selected subject
  useEffect(() => {
    if (selectedSubject === "CoreJava" || selectedSubject === "AdvancedJava") {
      setFilteredBatches(["SelectBatch", "JFS-100", "JFS-101", "JFS-102"]);
    } else if (selectedSubject === "Python" || selectedSubject === "Flask") {
      setFilteredBatches(["SelectBatch", "PFS-100", "PFS-101", "PFS-102"]);
    } else {
      setFilteredBatches(mockBatches); // Default batches
    }
    setSelectedBatch("SelectBatch"); // Reset batch when subject changes
  }, [selectedSubject]);

  const fetchAttendanceData = useCallback( async () => {
    if (selectedSubject === "SelectSubject" || selectedBatch === "SelectBatch") {
      setStudents([]);
      setError("Please select both a subject and a batch.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/getattends`, {
        params: {
          subject: selectedSubject,
          batch: selectedBatch,
        },
      });
      const data = response.data?.data || [];
      if (data.length === 0) {
        setError("No attendance records found for the selected subject and batch.");
      }
      setStudents(data);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data. Please try again later.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  },[selectedBatch,selectedSubject]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedSubject, selectedBatch,fetchAttendanceData]);

  const handleExportToExcel = () => {
    if (!students.length) {
      alert("No attendance data to export!");
      return;
    }

    const wb = XLSX.utils.book_new();
    const formattedData = students.flatMap((record) =>
      record.students.map((student, index) => ({
        "S.No": index + 1,
        "Student ID": student.studentId || "N/A",
        Name: student.name || "N/A",
        Status: student.status || "N/A",
        Remarks: student.remarks || "N/A",
        "Batch No": record.batchNo || "N/A",
        Course: record.course || "N/A",
        Date: record.datetime || "N/A",
      }))
    );

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const columnWidths = [
      { wch: 5 }, // S.No
      { wch: 15 }, // Student ID
      { wch: 20 }, // Name
      { wch: 10 }, // Status
      { wch: 20 }, // Remarks
      { wch: 15 }, // Batch No
      { wch: 20 }, // Course
      { wch: 20 }, // Date
    ];
    ws["!cols"] = columnWidths;

    const sheetName = students[0]?.course?.replace(/[^a-zA-Z0-9]/g, "_") || "Attendance";

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(wb, `${sheetName}_Summary.xlsx`);
  };

  const groupedByDate = students.reduce((acc, record) => {
    const date = record.datetime || "Unknown Date";
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(...record.students);
    return acc;
  }, {});

  const filteredBySearch = (date, student) =>
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.status.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-lg mb-6 shadow-md">
        <h1 className="text-xl font-semibold text-white">Attendance Dashboard</h1>
        <button
          className="bg-white text-green-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition"
          onClick={handleExportToExcel}
        >
          Export to Excel
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Select Subject</label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {mockSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Select Batch</label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {filteredBatches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}

      {/* Attendance Table */}
      {loading ? (
        <p className="text-blue-600 font-semibold mt-4">Loading attendance data...</p>
      ) : Object.keys(groupedByDate).length > 0 ? (
        Object.keys(groupedByDate).map((date) => (
          <div key={date} className="bg-gray-50 p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-500">{date}</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto mt-4">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="p-4 font-semibold">Student ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByDate[date]
                    .filter((student) => filteredBySearch(date, student))
                    .map((student, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-blue-50 cursor-pointer`}
                        onClick={() => onStudentSelect(student)}
                      >
                        <td className="p-4">{student.studentId}</td>
                        <td className="p-4">{student.name}</td>
                        <td
                          className={`p-4 font-semibold ${
                            student.status === "present" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {student.status}
                        </td>
                        <td className="p-4">{student.remarks || "N/A"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 font-semibold mt-4">No attendance records match the search query.</p>
      )}
    </div>
  );
};

export default AttendanceTableData;
