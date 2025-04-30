import React, { useEffect, useState, useMemo } from "react";
import { useUniqueBatches } from "../../contexts/UniqueBatchesContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "../../../cryptoUtils.jsx";
import { useStudentsMentorData } from "../../contexts/MentorStudentsContext.jsx";

export const MentorReportsDashboard = () => {
  const navigate = useNavigate();
  const { batches, loading, fetchBatches } = useUniqueBatches();
  const { scheduleData, fetchMentorStudents } = useStudentsMentorData();
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [loadingId, setLoadingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Adjust as needed

  const sessionStorageLocation = decryptData(sessionStorage.getItem("location"));

  const uniqueBatches = useMemo(() => {
    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      const allBatches = scheduleData
        .map((entry) => entry.batchNo) // Extract batchNo arrays
        .flat(); // Flatten the array
      return [...new Set(allBatches)]; // Get unique batches
    }
    return [];
  }, [scheduleData]);

  // Fetch batches on mount
  useEffect(() => {
    fetchBatches(sessionStorageLocation);
    fetchMentorStudents();
  }, [fetchBatches, sessionStorageLocation, fetchMentorStudents]);

  // Filter batches based on location and uniqueBatches
  useEffect(() => {
    const filtered = batches.filter(
      (batch) =>
        (batch.location.toLowerCase() === locationFilter.toLowerCase() ||
          locationFilter === "all") && // Filter by location
        uniqueBatches.includes(batch.Batch) // Check if batch.Batch is in uniqueBatches
    );
    setFilteredBatches(filtered);
    setCurrentPage(1); // Reset pagination on filter change
  }, [batches, locationFilter, uniqueBatches]);

  const handleDailyClick = async (batch) => {
    setLoadingId(batch.id);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/exam-day-list`,
        {
          params: {
            batch: batch.Batch,
            location: sessionStorageLocation,
          },
        }
      );
      const data = response.data;
      navigate("/students-performance-mentor/daily", { state: data });
    } catch (error) {
      console.error("Error fetching exam details:", error);
      toast.error("No Reports are available at this moment");
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-lg font-semibold text-gray-600">
          Loading batches...
        </p>
      </div>
    );
  }

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBatches = filteredBatches.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className=" flex flex-col items-center p-6 mt-0">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        <span className="bg-black bg-clip-text">
          Students Performance Dashboard
        </span>
      </h1>

      {/* Location Filter */}
    

      {/* Display Batches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full max-w-6xl">
        {currentBatches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 hover:shadow-2xl transition duration-300 ease-in-out"
            style={{
              borderTop: "4px solid transparent",
              borderImage: "linear-gradient(to bottom right, red, blue) 1",
            }}
          >
            <div className="flex gap-2">
              <h2 className="text-xl font-bold text-gray-700 flex items-center mb-2">
                {batch.Batch}
              </h2>
            </div>
            <div className="flex flex-row">
              <button
                onClick={() => handleDailyClick(batch)}
                disabled={loadingId === batch.id}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
              >
                <span className="relative px-2 py-0.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  {loadingId === batch.id ? "Loading..." : "Daily Exam"}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {page}
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
