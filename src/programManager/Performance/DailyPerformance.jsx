import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const DailyPerformance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  useEffect(() => {
    if (!data || !data.reports) {
      navigate("/exam-dashboard");
    }
  }, [data, navigate]);

  if (!data || !data.reports) return null;

  const getSubjectWiseAnalysis = (subjects) => {
    if (!subjects || Object.keys(subjects).length === 0) return [];
    return Object.entries(subjects).map(([subjectName, subjData]) => {
      const maxCode = subjData.max_code_marks || 0;
      const maxMCQ = subjData.max_mcq_marks || 0;
      const obtainedCode = subjData.obtained_code_marks || 0;
      const obtainedMCQ = subjData.obtained_mcq_marks || 0;
      return {
        subject: subjectName,
        scoreText:
          maxCode + maxMCQ === 0
            ? "N/A"
            : `${obtainedCode + obtainedMCQ}/${maxCode + maxMCQ}`,
      };
    });
  };

  const getTotalScore = (subjects) => {
    const analysis = getSubjectWiseAnalysis(subjects);
    return analysis.reduce((acc, subj) => {
      const scoreMatch = subj.scoreText.match(/^(\d+)/);
      return scoreMatch ? acc + parseInt(scoreMatch[1]) : acc;
    }, 0);
  };

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
        examDetails: report.examDetails,
      };
    });
  }, [data.reports, data.examName, data.batch]);

  const examDetails = useMemo(() => {
    return enrichedData.length > 0 ? enrichedData[0].examDetails : null;
  }, [enrichedData]);

  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [studentNameFilter, setStudentNameFilter] = useState("");
  const [attemptStatusFilter, setAttemptStatusFilter] = useState("all");
  const [scoreSort, setScoreSort] = useState("none");

  const filteredData = useMemo(() => {
    return enrichedData.filter((item) => {
      const { student, subjects } = item;

      if (
        studentIdFilter.trim() &&
        !(student.studentId || "")
          .toLowerCase()
          .includes(studentIdFilter.trim().toLowerCase())
      ) {
        return false;
      }

      if (
        studentNameFilter.trim() &&
        !(student.name || "")
          .toLowerCase()
          .includes(studentNameFilter.trim().toLowerCase())
      ) {
        return false;
      }

      const attempted =
        subjects &&
        Object.keys(subjects).some((subject) => {
          const subjData = subjects[subject];
          return (
            subjData &&
            (typeof subjData.max_code_marks !== "undefined" ||
              typeof subjData.max_mcq_marks !== "undefined" ||
              subjData.obtained_code_marks > 0 ||
              subjData.obtained_mcq_marks > 0)
          );
        });

      if (attemptStatusFilter !== "all") {
        if (attemptStatusFilter === "attempted" && !attempted) return false;
        if (attemptStatusFilter === "not attempted" && attempted) return false;
      }

      return true;
    });
  }, [enrichedData, studentIdFilter, studentNameFilter, attemptStatusFilter]);

  const sortedData = useMemo(() => {
    let dataToSort = [...filteredData];
    if (scoreSort === "highest") {
      dataToSort.sort((a, b) => b.totalScore - a.totalScore);
    } else if (scoreSort === "lowest") {
      dataToSort.sort((a, b) => a.totalScore - b.totalScore);
    }
    return dataToSort;
  }, [filteredData, scoreSort]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const exportToExcel = () => {
    const exportData = sortedData.map((item) => {
      const { student, exam, totalScore, subjects, examDetails } = item;
      const subjectAnalysis = getSubjectWiseAnalysis(subjects);
      const subjectAnalysisString = subjectAnalysis
        .map((subj) => `${subj.subject}: ${subj.scoreText}`)
        .join(", ");
      const attempted =
        subjects &&
        Object.keys(subjects).some((subject) => {
          const subjData = subjects[subject];
          return (
            subjData &&
            (typeof subjData.max_code_marks !== "undefined" ||
              typeof subjData.max_mcq_marks !== "undefined" ||
              subjData.obtained_code_marks > 0 ||
              subjData.obtained_mcq_marks > 0)
          );
        });
      return {
        "Student ID": student?.studentId || "",
        "Name": student?.name || "Unknown",
        "Phone": student?.phNumber || "",
        "Batch": exam?.batch || "",
        "Attempt Status": attempted ? "Attempted" : "Not Attempted",
        "Marks Overall": totalScore,
        "Subject-wise Analysis": subjectAnalysisString || "N/A",
        "Date": examDetails?.startDate || "N/A",
        "Time": examDetails?.startTime || "N/A",
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
      <h1 className="text-2xl font-bold text-center mb-2">
        Exam Performance Dashboard
      </h1>
      <h2 className="text-xl font-medium text-center mb-4">
        Exam: {data.examName} | Batch: {data.batch}
      </h2>
      {examDetails && (
        <div className="text-center mb-6">
          <p className="text-xl">
            Exam Date: {examDetails.startDate} | Exam Time: {examDetails.startTime} | Total Time: {examDetails.totalExamTime} mins
          </p>
        </div>
      )}
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
          <label className="font-medium text-gray-700 mb-1">Attempt Status</label>
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
          <label className="font-medium text-gray-700 mb-1">Sort by Score</label>
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
      <div className="text-right mb-2">
        <p className="text-gray-700">
          <strong>Filtered Results Count:</strong> {sortedData.length}
        </p>
      </div>
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
                Exam Date
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Attempt Status
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Marks Overall
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
              const attempted =
                subjects &&
                Object.keys(subjects).some((subject) => {
                  const subjData = subjects[subject];
                  return (
                    subjData &&
                    (typeof subjData.max_code_marks !== "undefined" ||
                      typeof subjData.max_mcq_marks !== "undefined" ||
                      subjData.obtained_code_marks > 0 ||
                      subjData.obtained_mcq_marks > 0)
                  );
                });
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
                    {student.name || "Unknown"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.phNumber || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {examDetails.startDate || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {attempted ? "Attempted" : "Not Attempted"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {totalScore === 0
                      ? attempted
                        ? "0 (Attempted)"
                        : "0 (Not Attempted)"
                      : totalScore}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {subjectAnalysis.length > 0
                      ? subjectAnalysis.map((subj, idx) => (
                          <div key={idx}>
                            <strong>{subj.subject}:</strong> {subj.scoreText}
                          </div>
                        ))
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

export default DailyPerformance;