import React, { useEffect, useState } from "react";
import { useUniqueBatches } from "../../contexts/UniqueBatchesContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "../../../cryptoUtils.jsx";

export const ManagerExamDashboard = () => {
  const navigate = useNavigate();
  const { batches, loading, fetchBatches } = useUniqueBatches();
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // You can adjust the number of items per page

  const sessionStorageLocation = decryptData(
    sessionStorage.getItem("location")
  );

  useEffect(() => {
    fetchBatches(sessionStorageLocation);
  }, [fetchBatches, sessionStorageLocation]);

  useEffect(() => {
    if (locationFilter === "all" || sessionStorageLocation !== "all") {
      setFilteredBatches(batches);
    } else {
      setFilteredBatches(
        batches.filter(
          (batch) =>
            batch.location.toLowerCase() === locationFilter.toLowerCase()
        )
      );
    }
    // Reset pagination when the filtered batches change
    setCurrentPage(1);
  }, [batches, locationFilter, sessionStorageLocation]);

  const checkDailyExamStatus = async (batch) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/check-exam-status`,
        {
          params: {
            date: date,
            examType: "Daily-Exam",
            batch: batch.Batch,
            location: batch.location,
          },
        }
      );
      handleDailyClick(batch);
    } catch (error) {
      if (error.status === 409) {
        toast.warning(error.response?.data.message);
      }
      console.log(error);
    }
  };

  const handleDailyClick = async (batch) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/get-exam-data`,
        {
          params: {
            batch: batch.Batch,
            location: batch.location,
            date,
          },
        }
      );
      const data = response.data;
      console.log(data);
      toast.warning(response.data.warning, {
        autoClose: false,
        closeOnClick: true,
        closeButton: true,
        style: { width: "500px", whiteSpace: "pre-wrap" },
      });
      navigate("/set-exam", {
        state: { examData: data.data, batch: batch },
      });
    } catch (error) {
      const err = error.response?.data;
      const errorMessage = err?.error || err?.message;
      const tags = err?.tags ? `\nTags: ${err.tags.join(", ")}` : "";

      toast.error(`${errorMessage}${tags}`, {
        autoClose: false,
        closeOnClick: true,
        closeButton: true,
        style: {
          width: "500px",
          whiteSpace: "pre-wrap", // keeps the line breaks for better readability
        },
      });
    }
  };

  const checkWeeklyExamStatus = async (batch) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/check-exam-status`,
        {
          params: {
            date: date,
            examType: "Weekly-Exam",
            batch: batch.Batch,
            location: batch.location,
          },
        }
      );
      handleWeeklyClick(batch);
    } catch (error) {
      if (error.status === 409) {
        toast.warning(error.response?.data.message);
      }
      console.log(error);
    }
  };

  const handleWeeklyClick = async (batch) => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/get-exam-data`,
        {
          params: {
            batch: batch.Batch,
            location: batch.location,
            date,
          },
        }
      );
      const data = response.data;
      console.log(data);
      toast.warning(response.data.warning, {
        autoClose: false,
        closeOnClick: true,
        closeButton: true,
        style: { width: "500px", whiteSpace: "pre-wrap" },
      });
      navigate("/set-exam", {
        state: { examData: data.data, batch: batch },
      });
    } catch (error) {
      const err = error.response?.data;
      const errorMessage = err?.error || err?.message;
      const tags = err?.tags ? `\nTags: ${err.tags.join(", ")}` : "";

      toast.error(`${errorMessage}${tags}`, {
        autoClose: false,
        closeOnClick: true,
        closeButton: true,
        style: {
          width: "500px",
          whiteSpace: "pre-wrap", // keeps the line breaks for better readability
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <h1 className="text-2xl font-medium text-center text-gray-800 mb-8">
        <span className="bg-black bg-clip-text">Scheduling Exam</span>
      </h1>

     

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
                onClick={() => checkDailyExamStatus(batch)}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800"
              >
                <span className="relative px-2 py-0.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  Daily Exam
                </span>
              </button>
              <button
                disabled
                onClick={() => checkWeeklyExamStatus(batch)}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-400 to-blue-600 group-hover:from-red-400 group-hover:to-blue-600 hover:text-white focus:ring-red-200 dark:focus:ring-red-800 cursor-not-allowed"
              >
                <span className="relative px-2 py-0.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  Weekly Exam
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
