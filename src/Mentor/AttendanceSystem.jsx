import React, { useState, useEffect, useCallback } from "react";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext"; // Import the context
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Save, FileSpreadsheet, Eye } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.min.js";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { decryptData } from '../../cryptoUtils.jsx';


export default function AttendanceSystem() {
  const navigate = useNavigate(); 
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData(); // Get schedule data from context
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate] = useState(new Date());
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [counts, setCounts] = useState({ total: 0, present: 0, absent: 0 });
  const location = decryptData(sessionStorage.getItem("location"));
  useEffect(() => {
    fetchMentorStudents(selectedBatch);
  }, [fetchMentorStudents]);

  // Extract subjects and batches from scheduleData
  const subjects = ["Select Subject", ...new Set(scheduleData.map((item) => item.subject))];

  useEffect(() => {
    if (selectedSubject && selectedSubject !== "Select Subject") {
      const subjectBatches = scheduleData
        .filter((item) => item.subject === selectedSubject)
        .flatMap((item) => item.batchNo);
      setFilteredBatches(["Select Batch", ...subjectBatches]);
    } else {
      setFilteredBatches(["Select Batch"]); // Reset if no subject is selected
    }
    setSelectedBatch(""); // Reset the selected batch
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
        // Explicitly handling the "notexisted" case (optional)
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance`,
          payload
        );
  
        if (response.status === 200) {
          Swal.fire({
            title: "Attendance Successfully Saved",
            icon: "success",
          });
          // Reset state after successful submission.
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
  

  const exportToExcel = () => {
    const data = students.map(({ studentId, name, email, status, remarks }) => ({
      "Student ID": studentId,
      "Student Name": name || email,
      Status: status,
      Remarks: remarks,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(
      wb,
      `Attendance_${selectedBatch}_${selectedDate.toISOString().split("T")[0]}.xlsx`
    );
  };

  const viewAttendance = () => {
    navigate("/attendancedata");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 mt-0">
      <div className="flex-1 ml-0 md:ml-2 mr-2 mt-4">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Attendance Management
            </h1>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold">Select Subject</h2>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold">Select Batch</h2>
              <Select
                value={selectedBatch}
                onValueChange={setSelectedBatch}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Batch..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredBatches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold">Date & Time</h2>
              <div className="rounded-md border p-3 text-gray-700">
                {selectedDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                {selectedDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Student Attendance</h2>
              <div className="flex gap-2">
                <Button onClick={exportToExcel} disabled={!selectedBatch}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
                <Button onClick={viewAttendance}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Attendance
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.name ? student.name : student.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={student.status === "present"}
                            onChange={() => toggleAttendance(student.studentId)}
                          />
                          <div
                            className={`w-14 h-7 rounded-full relative transition-colors duration-300 ease-in-out ${
                              student.status === "present" ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out ${
                              student.status === "present" ? "translate-x-7" : "translate-x-0"
                            }`}></div>
                          </div>
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Add remarks..."
                        value={student.remarks}
                        onChange={(e) => updateRemarks(student.studentId, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total Students: {counts.total} |
                Present: <span className="text-green-600">{counts.present}</span> |
                Absent: <span className="text-red-600">{counts.absent}</span>
              </div>
              <Button onClick={saveAttendance} disabled={!selectedBatch}>
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
