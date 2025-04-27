import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";
import { decryptData } from '../../cryptoUtils.jsx';

/** Convert "YY-MM-DD" => "YYYY-MM-DD". */
function convertDateYYMMDDtoYYYYMMDD(shortDate) {
  const parts = shortDate.split("-");
  if (parts.length !== 3) return "";
  const yy = parseInt(parts[0], 10);
  const mm = parts[1];
  const dd = parts[2];
  const fullYear = 2000 + yy;
  return `${fullYear.toString().padStart(4, "0")}-${mm}-${dd}`;
}

/** Return short weekday name from "YYYY-MM-DD" (e.g., "Mon"). */
function getDayName(isoDate) {
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return "";
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.toLocaleDateString("en-US", { weekday: "short" });
}

/** Check if "YYYY-MM-DD" is Sunday => override status with "-". */
function isSunday(isoDate) {
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return false;
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.getDay() === 0; // 0 => Sunday
}

const AttendanceTable = () => {
  const navigate = useNavigate();
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData();

  // ----------- FILTER STATE -----------
  const [selectedLocation, setSelectedLocation] = useState("SelectLocation");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("SelectSubject");
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("SelectBatch");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false); // For mobile responsiveness

  // Data from server
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [studentMap, setStudentMap] = useState({}); // subject => studentId => { name, daily }
  const [uniqueDates, setUniqueDates] = useState([]);
  const [datesWithRemarks, setDatesWithRemarks] = useState(new Set());

  useEffect(() => {
    fetchMentorStudents(selectedBatch);
  }, [fetchMentorStudents, selectedBatch]);

  useEffect(() => {
    const location = decryptData(sessionStorage.getItem("location"));
    setSelectedLocation(location);
  }, []);

  // Build subject drop-down from scheduleData
  useEffect(() => {
    const subjects = scheduleData.map((item) => item.subject);
    setAvailableSubjects([...new Set(subjects)]);
    setSelectedSubject("SelectSubject");
    setFilteredBatches([]);
  }, [scheduleData]);

  // Filter batches when subject changes
  useEffect(() => {
    if (selectedSubject !== "SelectSubject") {
      const validBatches = scheduleData
        .filter((item) => item.subject === selectedSubject)
        .flatMap((item) => item.batchNo);
      setFilteredBatches(validBatches);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedSubject, scheduleData]);

  // ------------- Fetch Data -------------
  const fetchAttendanceData = useCallback(async () => {
    if (
      selectedLocation === "SelectLocation" ||
      selectedSubject === "SelectSubject" ||
      selectedBatch === "SelectBatch"
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/getattends`, {
        params: {
          location: selectedLocation,
          subject: selectedSubject,
          batch: selectedBatch,
        },
      });
      const data = response.data?.data || [];
      setRecords(data);
      transformDataToSpreadsheet(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setRecords([]);
      setStudentMap({});
      setUniqueDates([]);
      setDatesWithRemarks(new Set());
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedSubject, selectedBatch]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // ------------- Transform to a multi-day map -------------
  function transformDataToSpreadsheet(rawData) {
    const dateSet = new Set();
    const remarksSet = new Set();
    const map = {};

    // Step 1: Convert and sort dates to find latest record
    const sortedByDate = rawData
      .map((record) => ({
        ...record,
        isoDate: convertDateYYMMDDtoYYYYMMDD(record.datetime),
      }))
      .sort((a, b) => (a.isoDate < b.isoDate ? 1 : -1)); // Descending

    const latestDate = sortedByDate[0]?.isoDate;
    const latestStudents = sortedByDate[0]?.students || [];

    // Step 2: Create studentId => name map from latest date
    const latestNamesMap = {};
    latestStudents.forEach((stu) => {
      latestNamesMap[stu.studentId] = stu.name;
    });

    // Step 3: Group by subject (assuming one subject for now)
    const subject = selectedSubject;
    if (!map[subject]) {
      map[subject] = {};
    }

    // Step 4: Loop through all records
    rawData.forEach((record) => {
      const isoDate = convertDateYYMMDDtoYYYYMMDD(record.datetime);
      dateSet.add(isoDate);

      record.students.forEach((stu) => {
        const { studentId, status, remarks } = stu;

        if (!map[subject][studentId]) {
          map[subject][studentId] = {
            studentId,
            name: latestNamesMap[studentId] || "Unknown",
            daily: {},
          };
        }

        map[subject][studentId].daily[isoDate] = {
          status: status || "absent", // Default to absent
          remarks: remarks || "",
        };

        if (remarks) {
          remarksSet.add(isoDate);
        }
      });
    });

    const sortedDates = Array.from(dateSet).sort();
    setUniqueDates(sortedDates);
    setDatesWithRemarks(remarksSet);
    setStudentMap(map);
  }

  // ------------- Build array of students, then apply search filter -------------
  const getDisplayedStudents = (subject) => {
    if (!studentMap[subject]) return [];
    const allStudents = Object.values(studentMap[subject]).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return allStudents.filter((stu) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = stu.name.toLowerCase().includes(q);
        const matchesId = stu.studentId.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  };

  // ------------- Totals -------------
  function getTotals(stu, dates) {
    let presentCount = 0;
    let absentCount = 0;
    let dayCount = 0;

    dates.forEach((dt) => {
      if (isSunday(dt)) return; // Skip Sunday
      dayCount++;
      const info = stu.daily[dt] || {};
      let status = info.status?.toLowerCase() || "absent";
      if (status === "present") presentCount++;
      else if (status === "absent" || status === "ab") absentCount++;
    });

    return { presentCount, absentCount, dayCount };
  }

  // ------------- Excel Export -------------
  const handleExportToExcel = (subject) => {
    if (!records.length || !studentMap[subject]) {
      alert(`No attendance data to export for ${subject}!`);
      return;
    }

    const wb = XLSX.utils.book_new();
    const rows = getDisplayedStudents(subject).map((stu, idx) => {
      const row = {
        "S.No": idx + 1,
        "Student ID": stu.studentId,
        Name: stu.name,
      };

      uniqueDates.forEach((dt) => {
        const dayName = getDayName(dt);
        if (isSunday(dt)) {
          row[`${dt} (${dayName}) - Status`] = "-";
          if (datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = "-";
          }
        } else {
          const info = stu.daily[dt] || {};
          let st = info.status || "absent";
          let rm = info.remarks || "";
          row[`${dt} (${dayName}) - Status`] = st;
          if (datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = rm;
          }
        }
      });

      const { presentCount, absentCount, dayCount } = getTotals(stu, uniqueDates);
      row["Total Present"] = presentCount;
      row["Total Absent"] = absentCount;
      row["Total Days"] = dayCount;

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `${subject}_Attendance`);
    XLSX.writeFile(wb, `${subject}_Attendance_Spreadsheet.xlsx`);
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <div className="container mx-auto p-6">
        {/* Title */}
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-8">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Student Attendance
          </span>
        </h1>

        {/* Top buttons */}
        <div className="mb-6 flex justify-between items-center">
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        {/* Subject & Batch Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Select Subject
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={availableSubjects.length === 0}
            >
              <option value="SelectSubject" disabled>
                Select Subject
              </option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Select Batch
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={filteredBatches.length === 0}
            >
              <option value="SelectBatch" disabled>
                Select Batch
              </option>
              {filteredBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Student ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>

        {/* Loading or table */}
        {loading ? (
          <p className="text-blue-600 font-semibold mt-6 text-center">
            Loading attendance data...
          </p>
        ) : Object.keys(studentMap).length === 0 ? (
          <p className="text-gray-500 font-semibold mt-6 text-center">
            No attendance records found.
          </p>
        ) : (
          // Render table for each subject
          Object.keys(studentMap).map((subject) => (
            <div key={subject} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{subject} Attendance</h2>
                <button
                  className="bg-green-600 text-white py-1 px-3 md:py-2 md:px-4 rounded text-xs md:text-sm hover:bg-green-700"
                  onClick={() => handleExportToExcel(subject)}
                >
                  Export to Excel
                </button>
              </div>

              {getDisplayedStudents(subject).length === 0 ? (
                <p className="text-gray-500 font-semibold">No students found for {subject}.</p>
              ) : (
                <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
                  <table className="border-collapse min-w-full text-xs md:text-sm">
                    <thead>
                      <tr className="bg-blue-500 text-white">
                        <th
                          className="p-1 md:p-2 border sticky left-0 bg-blue-500 z-10 table-cell md:sticky"
                          rowSpan={2}
                          style={{ minWidth: "40px", left: "0" }}
                        >
                          S.no
                        </th>
                        <th
                          className={`p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-blue-500 z-10 ${
                            showDetails ? "table-cell md:sticky" : "hidden md:table-cell"
                          }`}
                          rowSpan={2}
                          style={{ minWidth: "70px" }}
                        >
                          Student ID
                        </th>
                        <th
                          className={`p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-blue-500 z-10 ${
                            showDetails ? "table-cell md:sticky" : "hidden md:table-cell"
                          }`}
                          rowSpan={2}
                          style={{ minWidth: "120px" }}
                        >
                          Name
                        </th>
                        {uniqueDates.map((dt) => (
                          <th
                            key={dt}
                            colSpan={datesWithRemarks.has(dt) ? 2 : 1}
                            className="p-1 md:p-2 border text-center"
                            style={{ minWidth: datesWithRemarks.has(dt) ? "120px" : "100px" }}
                          >
                            {dt} ({getDayName(dt)})
                          </th>
                        ))}
                        <th
                          className="p-1 md:p-2 border text-center"
                          rowSpan={2}
                          style={{ minWidth: "80px" }}
                        >
                          Total Present
                        </th>
                        <th
                          className="p-1 md:p-2 border text-center"
                          rowSpan={2}
                          style={{ minWidth: "80px" }}
                        >
                          Total Absent
                        </th>
                        <th
                          className="p-1 md:p-2 border text-center"
                          rowSpan={2}
                          style={{ minWidth: "70px" }}
                        >
                          Total Days
                        </th>
                      </tr>
                      <tr className="bg-blue-400 text-white">
                        {uniqueDates.map((dt) => (
                          <React.Fragment key={dt}>
                            <th
                              className="p-1 md:p-2 border text-center"
                              style={{ minWidth: "60px" }}
                            >
                              Status
                            </th>
                            {datesWithRemarks.has(dt) && (
                              <th
                                className="p-1 md:p-2 border text-center"
                                style={{ minWidth: "60px" }}
                              >
                                Remarks
                              </th>
                            )}
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getDisplayedStudents(subject).map((stu, index) => {
                        const { presentCount, absentCount, dayCount } = getTotals(
                          stu,
                          uniqueDates
                        );

                        return (
                          <tr key={stu.studentId} className="hover:bg-blue-50">
                            <td
                              className="p-1 md:p-2 border text-center font-semibold sticky left-0 bg-gray-100 z-10 table-cell md:sticky"
                              style={{ minWidth: "40px", left: "0" }}
                            >
                              {index + 1}
                            </td>
                            <td
                              className={`p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-gray-100 z-10 ${
                                showDetails ? "table-cell md:sticky" : "hidden md:table-cell"
                              }`}
                              style={{ minWidth: "70px" }}
                            >
                              {stu.studentId}
                            </td>
                            <td
                              className={`p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-gray-100 z-10 ${
                                showDetails ? "table-cell md:sticky" : "hidden md:table-cell"
                              }`}
                              style={{ minWidth: "120px" }}
                            >
                              {stu.name}
                            </td>
                            {uniqueDates.map((dt) => {
                              if (isSunday(dt)) {
                                return (
                                  <React.Fragment key={dt}>
                                    <td className="p-1 md:p-2 border text-center font-semibold">
                                      -
                                    </td>
                                    {datesWithRemarks.has(dt) && (
                                      <td className="p-1 md:p-2 border text-center">-</td>
                                    )}
                                  </React.Fragment>
                                );
                              }
                              const info = stu.daily[dt] || {};
                              let status = info.status || "absent";
                              let remarks = info.remarks || "";
                              const isAbsent =
                                status.toLowerCase() === "absent" ||
                                status.toLowerCase() === "ab";

                              return (
                                <React.Fragment key={dt}>
                                  <td
                                    className={`p-1 md:p-2 border text-center font-semibold ${
                                      isAbsent ? "text-red-600" : "text-green-600"
                                    }`}
                                  >
                                    {status}
                                  </td>
                                  {datesWithRemarks.has(dt) && (
                                    <td className="p-1 md:p-2 border text-center">{remarks}</td>
                                  )}
                                </React.Fragment>
                              );
                            })}
                            <td className="p-1 md:p-2 border text-green-700 font-semibold text-center">
                              {presentCount}
                            </td>
                            <td className="p-1 md:p-2 border text-red-600 font-semibold text-center">
                              {absentCount}
                            </td>
                            <td className="p-1 md:p-2 border text-purple-700 font-semibold text-center">
                              {dayCount}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="md:hidden mt-2 text-center">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? "Hide Details" : "Show Details"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;