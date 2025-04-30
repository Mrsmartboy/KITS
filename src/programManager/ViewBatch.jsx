import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaIdCard, FaCodeBranch, FaCalendarAlt, FaClock, FaInfoCircle, FaEdit } from "react-icons/fa";
import axios from "axios";
import { decryptData } from "../../cryptoUtils.jsx";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useUniqueBatches } from "../contexts/UniqueBatchesContext";

const ViewBatch = () => {
  const navigate = useNavigate();
  const { batches, loading, fetchBatches } = useUniqueBatches();
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [editingBatch, setEditingBatch] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 batches per page

  const sessionStorageLocation = decryptData(sessionStorage.getItem("location"));

  useEffect(() => {
    fetchBatches(sessionStorageLocation);
  }, [fetchBatches, sessionStorageLocation]);

  useEffect(() => {
    let filtered =
      locationFilter === "all"
        ? batches
        : batches.filter(
            (batch) =>
              batch.location.toLowerCase() === locationFilter.toLowerCase()
          );

    const updatedBatches = filtered.map((batch) => ({
      ...batch,
      Status: determineStatus(batch.StartDate, batch.EndDate),
    }));

    setFilteredBatches(updatedBatches);
  }, [batches, locationFilter]);

  // Reset page when filteredBatches changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredBatches]);

  const determineStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) return "Upcoming";
    if (today >= start && today <= end) return "Active";
    return "Completed";
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch.id);
    setEditedData({
      ...batch,
      StartDate: batch.StartDate,
      EndDate: batch.EndDate,
      Duration: batch.Duration,
      Status: determineStatus(batch.StartDate, batch.EndDate),
    });
  };

  const handleDateChange = (e, field) => {
    const value = e.target.value;
    const newEditedData = { ...editedData, [field]: value };

    if (field === "StartDate" || field === "EndDate") {
      const startDate = new Date(
        field === "StartDate" ? value : newEditedData.StartDate
      );
      const endDate = new Date(
        field === "EndDate" ? value : newEditedData.EndDate
      );

      if (startDate && endDate && endDate >= startDate) {
        const diffTime = Math.abs(endDate - startDate);
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        newEditedData.Duration = `${durationDays} Days`;
      } else {
        newEditedData.Duration = "Invalid Dates";
      }
    }

    newEditedData.Status = determineStatus(
      newEditedData.StartDate,
      newEditedData.EndDate
    );
    setEditedData(newEditedData);
  };

  const handleCancel = () => {
    setEditingBatch(null);
    setEditedData({});
  };

  const handleSave = async (batchId) => {
    setIsSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/batches`, {
        id: batchId,
        StartDate: editedData.StartDate,
        EndDate: editedData.EndDate,
        Duration: editedData.Duration,
      });

      setFilteredBatches((prevBatches) =>
        prevBatches.map((batch) =>
          batch.id === batchId
            ? {
                ...batch,
                ...editedData,
                Status: determineStatus(
                  editedData.StartDate,
                  editedData.EndDate
                ),
              }
            : batch
        )
      );

      setEditingBatch(null);
      fetchBatches(sessionStorageLocation);
    } catch (error) {
      console.error("Error updating batch:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewMore = (batch) => {
    navigate("/batch-schedule", { state: { batch } }); // Navigate and pass the batch data
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-lg font-semibold text-gray-600">Loading batches...</p>
      </div>
    );
  }

  // Calculate pagination variables
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const displayedBatches = filteredBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col items-center p-3 mt-0">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
        <span className="text-black bg-clip-text">
          View & Edit Batches
        </span>
      </h1>

    

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {displayedBatches.map((batch) => (
          <div
            key={batch.id}
            className="relative bg-white rounded-lg shadow-lg p-6 border-t-4 hover:shadow-2xl transition duration-300 ease-in-out"
            style={{
              borderTopColor:
                batch.Status === "Active"
                  ? "green"
                  : batch.Status === "Upcoming"
                  ? "yellow"
                  : "gray",
            }}
          >
            {/* Edit Icon at Top Right */}
            {!editingBatch && (
              <button
                onClick={() => handleEdit(batch)}
                className="absolute top-4 right-4 text-gray-500 hover:text-blue-500 transition duration-300 ease-in-out"
                title="Edit Batch"
              >
                <FaEdit className="w-5 h-5" />
              </button>
            )}

            <h2 className="text-xl font-bold text-gray-700 flex items-center mb-2">
              <FaIdCard className="mr-2 text-blue-500" />
              {batch.Batch}
            </h2>
            <p className="text-md text-gray-500 flex items-center mb-2">
              <FaCodeBranch className="mr-2 text-green-500" />
              {batch.Course}
            </p>

            {/* Start Date (Editable) */}
            <div className="text-md text-gray-500 flex items-center mb-2">
              <FaCalendarAlt className="mr-2 text-yellow-500" />
              {editingBatch === batch.id ? (
                <input
                  type="date"
                  value={editedData.StartDate}
                  onChange={(e) => handleDateChange(e, "StartDate")}
                  className="border rounded px-2 py-1"
                />
              ) : (
                <>Start Date: {batch.StartDate}</>
              )}
            </div>

            {/* End Date (Editable) */}
            <div className="text-md text-gray-500 flex items-center mb-2">
              <FaCalendarAlt className="mr-2 text-yellow-500" />
              {editingBatch === batch.id ? (
                <input
                  type="date"
                  value={editedData.EndDate}
                  onChange={(e) => handleDateChange(e, "EndDate")}
                  min={editedData.StartDate}
                  className="border rounded px-2 py-1"
                />
              ) : (
                <>End Date: {batch.EndDate}</>
              )}
            </div>

            {/* Duration (Auto-Calculated) */}
            <p className="text-md text-gray-500 flex items-center mb-2">
              <FaClock className="mr-2 text-indigo-500" />
              Duration: {editingBatch === batch.id ? editedData.Duration : batch.Duration}
            </p>

            <p
              className={`text-md font-semibold flex items-center ${
                batch.Status === "Active"
                  ? "text-green-600"
                  : batch.Status === "Upcoming"
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            >
              <FaInfoCircle className="mr-2 text-pink-500" />
              {batch.Status}
            </p>

            {/* Save Button */}
            {editingBatch === batch.id && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSave(batch.id)}
                  disabled={isSaving}
                  className={`mt-3 px-4 py-2 rounded shadow-lg transition ${
                    isSaving
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <FaEdit className="inline mr-2" />
                      Save
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  className="mt-3 px-4 py-2 rounded shadow-lg transition flex items-center bg-red-500 hover:bg-red-600 text-white"
                >
                  <FaEdit className="inline mr-2" />
                  Cancel
                </button>
              </div>
            )}

            {/* View More Button */}
            <button
              onClick={() => handleViewMore(batch)}
              className="mt-3 px-4 py-2 rounded shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              View More
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              variant="outlined"
              shape="rounded"
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default ViewBatch;
