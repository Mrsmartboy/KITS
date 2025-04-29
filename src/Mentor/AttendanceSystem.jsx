import React, { useState, useEffect, useCallback } from "react";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.min.js";
import { decryptData } from '../../cryptoUtils.jsx';

// Dropdown styles
const dropdownStyles = {
  container: "relative w-full sm:w-[230px] h-[46px] rounded-[4px] bg-white border border-[#00007F] shadow-sm",
  select: "w-full h-full px-4 py-2 bg-transparent text-[#00007F] text-[14px] sm:text-[16px] font-medium outline-none appearance-none cursor-pointer",
  icon: "absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00007F] pointer-events-none"
};

const AttendanceSystem = () => {
  const navigate = useNavigate();
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate] = useState(new Date());
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [counts, setCounts] = useState({ total: 0, present: 0, absent: 0 });
  const location = decryptData(sessionStorage.getItem("location"));

  useEffect(() => {
    fetchMentorStudents(selectedBatch);
  }, [fetchMentorStudents, selectedBatch]);

  const subjects = ["Select Subject", ...new Set(scheduleData.map((item) => item.subject))];

  useEffect(() => {
    if (selectedSubject && selectedSubject !== "Select Subject") {
      const subjectBatches = scheduleData
        .filter((item) => item.subject === selectedSubject)
        .flatMap((item) => item.batchNo);
      setFilteredBatches(["Select Batch", ...subjectBatches]);
    } else {
      setFilteredBatches(["Select Batch"]);
    }
    setSelectedBatch("");
  }, [selectedSubject, scheduleData]);

  const fetchStudents = useCallback(
    async (batches, subject) => {
      const payload = { batches, subject, location };
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attend`,
          payload
        );
        if (response.status === 200) {
          if (selectedBatch && selectedBatch !== "Select Batch") {
            const initialStudents = response.data.students_data.map((student) => ({
              ...student,
              status: "absent",
              remarks: "",
            }));
            setStudents(initialStudents);
          } else {
            setStudents([]);
          }
        } else {
          console.error("Failed to fetch students:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    },
    [location, selectedBatch]
  );

  useEffect(() => {
    if (selectedBatch && selectedSubject && selectedBatch !== "Select Batch" && selectedSubject !== "Select Subject") {
      fetchStudents(selectedBatch, selectedSubject);
    }
  }, [selectedBatch, selectedSubject, fetchStudents]);

  useEffect(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === "present").length;
    setCounts({ total, present, absent: total - present });
  }, [students]);

  const toggleAttendance = (studentId) => {
    setStudents(
      students.map((student) =>
        student.studentId === studentId
          ? { ...student, status: student.status === "present" ? "absent" : "present" }
          : student
      )
    );
    console.log(`Toggled student ${studentId} to ${students.find(s => s.studentId === studentId)?.status === "present" ? "absent" : "present"}`);
  };

  const updateRemarks = (studentId, remarks) => {
    setStudents(
      students.map((student) =>
        student.studentId === studentId ? { ...student, remarks } : student
      )
    );
  };

  const saveAttendance = async () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateTime = `${year}-${month}-${day}`;
    const checkDate = `${year}-${month}-${day}`;

    const payload = {
      subject: selectedSubject,
      batch: selectedBatch,
      datetime: dateTime,
      location,
      students: students.map(({ studentId, name, email, status, remarks }) => ({
        studentId,
        name: name || email,
        status,
        remarks,
      })),
    };

    try {
      const checkResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendcheck`,
        { subject: selectedSubject, batch: selectedBatch, date: checkDate, location }
      );

      if (checkResponse.status === 200 && checkResponse.data.Message === "existed") {
        Swal.fire({
          title: "Attendance Already Submitted",
          text: `Attendance for ${selectedBatch} on ${selectedDate.toLocaleDateString()} has already been saved.`,
          icon: "info",
        });
        return;
      } else if (checkResponse.status === 202 && checkResponse.data.Message === "notexisted") {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance`,
          payload
        );

        if (response.status === 200) {
          Swal.fire({
            title: "Attendance Successfully Saved",
            icon: "success",
          });
          setStudents([]);
          setCounts({ total: 0, present: 0, absent: 0 });
          setSelectedSubject("");
          setSelectedBatch("");
        } else {
          console.error("Failed to save attendance:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const viewAttendance = () => {
    navigate("/attendancedata");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center gap-6 font-['Inter'] p-4 pb-10">
      {/* Heading */}
      <div className="text-[#00007F] font-semibold text-[25px] leading-[25px] text-center">
        Attendance Management
      </div>

      {/* Selection Filters */}
      <div className="w-full sm:w-[90%] max-w-[1440px] bg-white shadow-md rounded-[20px] flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-6 gap-6">
        {/* Select a Subject */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="text-[#00007F] font-semibold text-[18px] sm:text-[20px] leading-[24px] whitespace-nowrap">
            Select a Subject
          </div>
          <div className={dropdownStyles.container}>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={dropdownStyles.select}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <FaChevronDown className={dropdownStyles.icon} />
          </div>
        </div>

        {/* Select a Batch */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="text-[#00007F] font-semibold text-[18px] sm:text-[20px] leading-[24px] whitespace-nowrap">
            Select a Batch
          </div>
          <div className={dropdownStyles.container}>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className={dropdownStyles.select}
            >
              {filteredBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
            <FaChevronDown className={dropdownStyles.icon} />
          </div>
        </div>

        {/* Select Date & Time */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="text-[#00007F] font-semibold text-[18px] sm:text-[20px] leading-[24px] whitespace-nowrap">
            Date & Time
          </div>
          <div className="flex items-center justify-between w-full sm:w-[230px] h-[46px] bg-[#EFF0F7] rounded-[4px] px-4">
            <span className="text-black text-[14px] sm:text-[16px] font-normal">
              {selectedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full sm:w-[90%] max-w-[1440px] flex flex-col lg:grid lg:grid-cols-[70%_30%] gap-6 min-h-[calc(100vh-400px)]">
        {/* Left Side - Student Attendance */}
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex flex-col gap-6 h-full">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[#00007F] font-semibold text-[18px] sm:text-[20px] leading-[24px]">
              Student Attendance
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={viewAttendance}
                className="flex items-center justify-center gap-2 border border-[#00007F] text-[#00007F] font-semibold text-[14px] sm:text-[16px] rounded-[4px] px-4 sm:px-6 h-[46px] bg-white w-full sm:w-auto"
              >
                <IoEyeSharp className="text-[#00007F]" />
                View Attendance
              </button>
            </div>
          </div>

          {/* Line */}
          <div className="w-full border-t-[1.2px] border-[#939393]"></div>

          {/* Table Section */}
          <div className="bg-white shadow-md rounded-md overflow-x-auto h-[400px] overflow-y-auto">
            {/* Table Header */}
            <div className="bg-[#00007F] text-white grid grid-cols-4 text-center font-semibold text-[14px] sm:text-[16px] leading-[71px] sticky top-0">
              <div>Student ID</div>
              <div>Name</div>
              <div>Attendance</div>
              <div>Remarks</div>
            </div>

            {/* Table Rows */}
            {students.length === 0 && (selectedSubject === "Select Subject" || selectedBatch === "Select Batch") ? (
              <div className="text-center text-[#00007F] text-[14px] sm:text-[16px] py-10">
                Please select a subject and batch to view students.
              </div>
            ) : students.length === 0 ? (
              <div className="text-center text-[#00007F] text-[14px] sm:text-[16px] py-10">
                No students found for this batch.
              </div>
            ) : (
              students.map((student, index) => (
                <div
                  key={student.studentId}
                  className={`grid grid-cols-4 items-center text-center text-black text-[14px] sm:text-[16px] ${
                    index % 2 === 0 ? "bg-[#EFF0F7]" : "bg-white"
                  }`}
                >
                  <div className="py-3 px-2">{student.studentId}</div>
                  <div className="py-3 px-2">{student.name || student.email}</div>
                  <div className="py-3 px-2 flex justify-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={student.status === "present"}
                        onChange={() => toggleAttendance(student.studentId)}
                      />
                      <div
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                          student.status === "present" ? "bg-[#129E00]" : "bg-[#FF9999]"
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                            student.status === "present" ? "translate-x-5" : ""
                          }`}
                        ></span>
                      </div>
                    </label>
                  </div>
                  <div className="flex justify-center py-3 px-2">
                    <input
                      type="text"
                      placeholder="Add Remarks........."
                      value={student.remarks}
                      onChange={(e) => updateRemarks(student.studentId, e.target.value)}
                      className="bg-[#E0E4FE] border border-[#00007F] rounded-[10px] text-[#8992CC] text-[12px] sm:text-[13px] px-3 py-1 w-[80%]"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination + Save */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-black font-medium text-[14px] sm:text-[16px]">
              <FaArrowLeft />
              <span>Prev</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>Next</span>
              <FaArrowRight />
            </div>
            <button
              onClick={saveAttendance}
              disabled={!selectedBatch || students.length === 0}
              className="flex items-center justify-center gap-2 bg-[#00007F] text-white font-semibold text-[14px] sm:text-[16px] rounded-[4px] px-4 sm:px-6 h-[46px] disabled:bg-gray-400 w-full sm:w-auto"
            >
              Save Attendance
            </button>
          </div>
        </div>

        {/* Right Side - Summary Cards */}
        <div className="flex justify-center">
          <div className="w-full max-w-[383px] h-auto bg-white shadow-md rounded-[20px] p-4 sm:p-6 grid grid-rows-3 gap-6">
            {/* Total Students Card */}
            <div className="w-full border border-[#00007F] rounded-[10px] shadow-md grid grid-rows-[auto_1fr] overflow-hidden">
              <div className="bg-[#00007F] rounded-t-[10px] p-3 flex items-center justify-center min-h-[60px]">
                <span className="text-white font-semibold text-[18px] sm:text-[20px] leading-[24px]">
                  Total Students
                </span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-[#00007F] font-bold text-[36px] sm:text-[40px] leading-[48px]">
                  {counts.total}
                </span>
              </div>
            </div>

            {/* Present Card */}
            <div className="w-full border border-[#129E00] rounded-[10px] shadow-md grid grid-rows-[auto_1fr] overflow-hidden">
              <div className="bg-[#129E00] rounded-t-[10px] p-3 flex items-center justify-center min-h-[60px]">
                <span className="text-white font-semibold text-[18px] sm:text-[20px] leading-[24px]">
                  Present
                </span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-[#129E00] font-bold text-[36px] sm:text-[40px] leading-[48px]">
                  {counts.present}
                </span>
              </div>
            </div>

            {/* Absent Card */}
            <div className="w-full border border-[#FF6000] rounded-[10px] shadow-md grid grid-rows-[auto_1fr] overflow-hidden">
              <div className="bg-[#FF6000] rounded-t-[10px] p-3 flex items-center justify-center min-h-[60px]">
                <span className="text-white font-semibold text-[18px] sm:text-[20px] leading-[24px]">
                  Absent
                </span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-[#FF6000] font-bold text-[36px] sm:text-[40px] leading-[48px]">
                  {counts.absent}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSystem;