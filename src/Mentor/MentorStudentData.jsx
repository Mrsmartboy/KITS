import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import "../StudentsList/StudentsList.css";
import { write, utils } from "xlsx";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";
import { saveAs } from "file-saver";
import { decryptData } from "../../cryptoUtils.jsx";

export default function MentorStudentData() {
  const [searchStudentId, setSearchStudentId] = useState("");
  const [searchStudentName, setSearchStudentName] = useState("");
  const [searchBatchNo, setSearchBatchNo] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [page, setPage] = useState(1);

  const { studentsList, loading, error, fetchMentorStudents, scheduleData } = useStudentsMentorData();
  const { book_new, book_append_sheet, json_to_sheet } = utils;

  const location = decryptData(sessionStorage.getItem("location"));

  // Fetch data on mount
  useEffect(() => {
    fetchMentorStudents();
  }, [fetchMentorStudents]);

  // Extract unique batch numbers from scheduleData
  const uniqueBatches = scheduleData
    ? Array.from(
        new Set(
          scheduleData.flatMap((schedule) => schedule.batchNo || [])
        )
      ).map((batch) => ({ Batch: batch, _id: batch })) // Map to match the expected structure
    : [];

  const studentsPerPage = 5;

  // Remove duplicate students based on studentId
  const uniqueStudentsList = studentsList
    ? Array.from(new Map(studentsList.map((s) => [s.studentId, s])).values())
    : [];

  const handleChange = (event, value) => {
    setPage(value);
  };

  const exportToExcel = () => {
    const wb = book_new();
    const studentsWithoutPassword = filteredStudents.map(({ password, ...rest }) => rest);
    const ws = json_to_sheet(studentsWithoutPassword);
    book_append_sheet(wb, ws, "Students");
    const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "mentor-students-list.xlsx");
  };

  // Filter students based on multiple criteria
  const filteredStudents = uniqueStudentsList.filter((student) => {
    const studentName = student?.name || "";
    const studentId = student?.studentId || "";
    const batchNo = student?.BatchNo || "";
    const studentLocation = student?.location || "";

    return (
      (searchStudentId === "" || studentId.toLowerCase().includes(searchStudentId.toLowerCase())) &&
      (searchStudentName === "" || studentName.toLowerCase().includes(searchStudentName.toLowerCase())) &&
      (searchBatchNo === "" || batchNo.toLowerCase() === searchBatchNo.toLowerCase()) &&
      (searchLocation === "" || studentLocation.toLowerCase().includes(searchLocation.toLowerCase()))
    );
  });

  const indexOfLastStudent = page * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);

  return (
    <div className="min-h-screen flex flex-col mx-auto p-6 mt-0">
      <h2 className="text-blue-800 text-2xl font-bold text-center mb-4">
        Students List ({totalStudents})
      </h2>
      <div className="flex flex-col items-center space-y-4 mb-4">
        <button
          className="bg-pink-600 hover:bg-pink-500 text-white font-semibold px-4 py-2 rounded"
          onClick={exportToExcel}
        >
          Download Excel
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white shadow-md rounded-md">
        <input
          type="text"
          value={searchStudentId}
          onChange={(e) => setSearchStudentId(e.target.value)}
          placeholder="Filter by Student ID"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <input
          type="text"
          value={searchStudentName}
          onChange={(e) => setSearchStudentName(e.target.value)}
          placeholder="Filter by Student Name"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <select
          value={searchBatchNo}
          onChange={(e) => setSearchBatchNo(e.target.value)}
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        >
          <option value="">All Batches</option>
          {uniqueBatches.map((batch) => (
            <option key={batch._id} value={batch.Batch}>
              {batch.Batch}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Filter by Location"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error loading students. Please try again.</p>
      ) : totalStudents > 0 ? (
        <div className="overflow-x-auto w-full mb-4">
          <table className="w-full border-collapse">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-2">StudentId</th>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">BatchNO</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">College Name</th>
                <th className="px-4 py-2">Highest Graduation</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Graduation Percentage</th>
                <th className="px-4 py-2">Graduation Passout Year</th>
                <th className="px-4 py-2">Skills</th>
                <th className="px-4 py-2">Backlogs</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.id} className="bg-white odd:bg-gray-100">
                  <td className="px-4 py-2 text-center">{student.studentId || "__"}</td>
                  <td className="px-4 py-2 text-center">{student.name || "__"}</td>
                  <td className="px-4 py-2 text-center">{student.BatchNo || "__"}</td>
                  <td className="px-4 py-2 text-center">{student.email || "__"}</td>
                  <td className="px-4 py-2 text-center">{student.studentPhNumber || "__"}</td>
                  <td className="px-4 py-2 text-center">{student.collegeName || "__"}</td>
                  <td className="px-4 py-2 text-center">{student.qualification || "__"}</td>
                  <td className="px-4 py-2 text-center">{student.department || "__"}</td>
                  <td className="px-4 py-2 text-center">
                    {student.highestGraduationpercentage ? `${student.highestGraduationpercentage}%` : "__"}
                  </td>
                  <td className="px-4 py-2 text-center">{student.yearOfPassing || "__"}</td>
                  <td className="px-4 py-2 text-center">
                    {student.studentSkills?.length > 0 ? student.studentSkills.join(", ") : "No skills listed"}
                  </td>
                  <td className="px-4 py-2 text-center">{student.ArrearsCount || "__"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChange}
                variant="outlined"
                shape="rounded"
              />
            </Stack>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">No students found.</p>
      )}
    </div>
  );
}