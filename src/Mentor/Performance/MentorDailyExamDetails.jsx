import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useStudentsMentorData } from "../../contexts/MentorStudentsContext";

const MentorDailyExamDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData();


  // Fetch data on mount
  useEffect(() => {
    fetchMentorStudents();
  }, [fetchMentorStudents]);

  // Extract unique subjects from scheduleData
  const uniqueSubjects = useMemo(() => {
    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      const allSubjects = scheduleData
        .map((entry) => entry.subject) // Extract subject from each entry
        .filter(Boolean); // Remove any undefined or null values if any
      return [...new Set(allSubjects)]; // Get unique subjects
    }
    return [];
  }, [scheduleData]);




  // Redirect if data is missing or doesn't have reports
  useEffect(() => {
    if (!data || !data.reports) {
      navigate("/exam-dashboard");
    }
  }, [data, navigate]);

  if (!data || !data.reports) return null;

  // -----------------------------
  //     Utility Functions
  // -----------------------------
  const getSubjectWiseAnalysis = (subjects) => {
    if (!subjects || Object.keys(subjects).length === 0) return [];
    return Object.entries(subjects).map(([subjectName, subjData]) => {
      const maxCode = subjData.max_code_marks || 0;
      const maxMCQ = subjData.max_mcq_marks || 0;
      const obtainedCode = subjData.obtained_code_marks || 0;
      const obtainedMCQ = subjData.obtained_mcq_marks || 0;
      return {
        subject: subjectName,
        scoreObtained: obtainedCode + obtainedMCQ,
        totalPossible: maxCode + maxMCQ,
      };
    });
  };

  const getTotalScore = (subjects) => {
    const analysis = getSubjectWiseAnalysis(subjects);
    return analysis.reduce((acc, subj) => acc + subj.scoreObtained, 0);
  };

  // -----------------------------
  //  Enrich the Data
  // -----------------------------
  const enrichedData = useMemo(() => {
    return data.reports.map((report) => {
      const totalScore = getTotalScore(report.subjects);
      return {
        ...report,
        totalScore,
        exam: {
          examName: data.examName,
          batch: data.batch,
        },
        examDetails: report.examDetails, // include exam details (date, time, totalExamTime)
      };
    });
  }, [data.reports, data.examName, data.batch]);

  // Extract exam details from the first report (assumes all reports share the same exam details)
  const examDetails = useMemo(() => {
    return enrichedData.length > 0 ? enrichedData[0].examDetails : null;
  }, [enrichedData]);

  // -----------------------------
  //     Filtering
  // -----------------------------
  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [studentNameFilter, setStudentNameFilter] = useState("");
  const [attemptStatusFilter, setAttemptStatusFilter] = useState("all");
  const [scoreSort, setScoreSort] = useState("none"); // "none", "highest", "lowest"

  const filteredData = useMemo(() => {
    return enrichedData.filter((item) => {
      const { student, subjects } = item;

      // Filter by Student ID
      if (
        studentIdFilter.trim() &&
        !(student.studentId || "")
          .toLowerCase()
          .includes(studentIdFilter.trim().toLowerCase())
      ) {
        return false;
      }

      // Filter by Student Name
      if (
        studentNameFilter.trim() &&
        !(student.name || "")
          .toLowerCase()
          .includes(studentNameFilter.trim().toLowerCase())
      ) {
        return false;
      }

      // Filter by attempt status (inferred from subjects object)
      const attempted = subjects && Object.keys(subjects).length > 0;
      if (attemptStatusFilter !== "all") {
        if (attemptStatusFilter === "attempted" && !attempted) return false;
        if (attemptStatusFilter === "not attempted" && attempted) return false;
      }

      return true;
    });
  }, [enrichedData, studentIdFilter, studentNameFilter, attemptStatusFilter]);

  // -----------------------------
  //     Sorting
  // -----------------------------
  const sortedData = useMemo(() => {
    let dataToSort = [...filteredData];
    if (scoreSort === "highest") {
      dataToSort.sort((a, b) => b.totalScore - a.totalScore);
    } else if (scoreSort === "lowest") {
      dataToSort.sort((a, b) => a.totalScore - b.totalScore);
    }
    return dataToSort;
  }, [filteredData, scoreSort]);

  // -----------------------------
  //  Pagination State
  // -----------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // -----------------------------
  //     Export to Excel
  // -----------------------------
  const exportToExcel = () => {
    const exportData = sortedData.map((item) => {
      const { student, exam, totalScore, subjects, examDetails } = item;
      const subjectAnalysis = getSubjectWiseAnalysis(subjects);
      const subjectAnalysisString =
        subjectAnalysis.length > 0
          ? subjectAnalysis
              .map(
                (subj) =>
                  `${subj.subject}(${subj.scoreObtained}/${subj.totalPossible})`
              )
              .join(", ")
          : "N/A";
      const attempted = subjects && Object.keys(subjects).length > 0;
      return {
        "Student ID": student?.studentId || "",
        Name: student?.name || "",
        Phone: student?.phNumber || "",
        Batch: exam?.batch || "",
        "Attempt Status": attempted ? "Attempted" : "Not Attempted",
        "Marks Overall": totalScore,
        "Subject-wise Analysis": subjectAnalysisString,
        Date: examDetails?.startDate || "N/A",
        Time: examDetails?.startTime || "N/A",
        "Total Time (mins)": examDetails?.totalExamTime || "N/A",
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "DailyPerformance.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-0">
      <h1 className="text-3xl font-bold text-center mb-2">
        Exam Performance Dashboard
      </h1>
      <h2 className="text-xl font-semibold text-center mb-4">
        Exam: {data.examName} | Batch: {data.batch}
      </h2>
      {examDetails && (
        <div className="text-center mb-6">
          <p className="text-xl">
            Exam Date: {examDetails.startDate} | Exam Time:{" "}
            {examDetails.startTime} | Total Time: {examDetails.totalExamTime}{" "}
            mins
          </p>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-6 flex-wrap">
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Student ID</label>
          <input
            type="text"
            value={studentIdFilter}
            onChange={(e) => setStudentIdFilter(e.target.value)}
            placeholder="Filter by Student ID..."
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Student Name</label>
          <input
            type="text"
            value={studentNameFilter}
            onChange={(e) => setStudentNameFilter(e.target.value)}
            placeholder="Filter by Student Name..."
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Attempt Status
          </label>
          <select
            value={attemptStatusFilter}
            onChange={(e) => setAttemptStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="attempted">Attempted</option>
            <option value="not attempted">Not Attempted</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Sort by Score
          </label>
          <select
            value={scoreSort}
            onChange={(e) => setScoreSort(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="none">None</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1 invisible">
            Export
          </label>
          <button
            onClick={exportToExcel}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {/* Display Filtered Count */}
      <div className="text-right mb-2">
        <p className="text-gray-700">
          <strong>Filtered Results Count:</strong> {sortedData.length}
        </p>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Student ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Phone
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Attempt Status
              </th>
             
              <th className="border border-gray-300 px-4 py-2 text-left">
                Subject-wise Analysis
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((item, index) => {
              const { student, exam, totalScore, subjects, examDetails } = item;
              const subjectAnalysis = getSubjectWiseAnalysis(subjects);
              const attempted = subjects && Object.keys(subjects).length > 0;
              const rowKey = `${student.id}-${index}`;
              const rowClassName = attempted
                ? index % 2 === 0
                  ? "bg-green-50"
                  : "bg-green-100"
                : "bg-red-50";

              return (
                <tr key={rowKey} className={rowClassName}>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.studentId}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.name || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.phNumber || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {attempted ? "Attempted" : "Not Attempted"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {uniqueSubjects.length > 0
                      ? uniqueSubjects.map((subject, idx) => {
                          // Filter the subjectAnalysis for the current subject
                          const subjectData = subjectAnalysis.filter(
                            (subj) => subj.subject === subject
                          );

                          // If data for this subject exists, display it
                          return subjectData.length > 0 ? (
                            <div key={idx}>
                              <strong>{subject}:</strong>{" "}
                              {subjectData[0].scoreObtained} /{" "}
                              {subjectData[0].totalPossible}
                            </div>
                          ) : (
                            <div key={idx}>
                              <strong>{subject}:</strong> N/A
                            </div>
                          );
                        })
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-3 py-1 rounded ${
                currentPage === pageNumber
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MentorDailyExamDetails;
