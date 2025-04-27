import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const Table = ({ data, onEditRow }) => {
  const [filter, setFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [editedData, setEditedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Define the number of items per page (adjust as needed)
  const itemsPerPage = 5;

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
    setCurrentPage(1); // reset pagination on new filter
  };

  const handleRoomFilterChange = (e) => {
    setRoomFilter(e.target.value.toLowerCase());
    setCurrentPage(1); // reset pagination on new filter
  };

  const handleDeleteClick = async (id) => {
    console.log(id)
    const rowToDelete = editedData.find((row) => row.id === id);
    const batchInfo = Array.isArray(rowToDelete.batchNo)
      ? rowToDelete.batchNo.join(", ")
      : rowToDelete.batchNo;

    try {
      const result = await Swal.fire({
        title: `Are you sure you want to delete ${rowToDelete.MentorName} from batch(es) ${batchInfo}?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
          { params: { id } }
        );

        if (response.status !== 200) throw new Error("Failed to delete row.");

        setEditedData((prevData) => prevData.filter((row) => row.id !== id));

        Swal.fire("Deleted!", "The row has been deleted.", "success");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "Failed to delete the row. Please try again.",
        "error"
      );
      console.error("Error deleting row:", error.message);
    }
  };

  const filteredData = editedData.filter((batch) => {
    const globalFilterMatch = [
      Array.isArray(batch.batchNo) ? batch.batchNo.join(", ") : batch.batchNo,
      batch.MentorName,
      batch.RoomNo,
      batch.subject,
      batch.StartTime,
      batch.EndTime,
      batch.StartDate,
      batch.EndDate,
    ].some((value) => (value ? value.toString().toLowerCase() : "").includes(filter));

    const roomFilterMatch = (batch.RoomNo
      ? batch.RoomNo.toString().toLowerCase()
      : ""
    ).includes(roomFilter);

    return globalFilterMatch && roomFilterMatch;
  });

  // Calculate total pages and slice data for current page only after filteredData is set
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-6xl">
        <div className="flex gap-4 mb-4 mt-2">
          <input
            type="text"
            placeholder="Search in all columns..."
            className="border px-4 py-2 rounded w-full"
            value={filter}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Filter by Room No..."
            className="border px-4 py-2 rounded w-1/3"
            value={roomFilter}
            onChange={handleRoomFilterChange}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-blue-100 sticky top-0 z-10">
              <tr>
                <th className="border px-4 py-2 text-left font-semibold">
                  Batch IDs
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  Mentor Name
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  Start Time
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  End Time
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  Start Date
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  End Date
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  Room No
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  Subject
                </th>
                <th className="border px-4 py-2 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((batch) => (
                <tr
                  key={batch.id}
                  className={batch.id % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border px-4 py-2">
                    {Array.isArray(batch.batchNo)
                      ? batch.batchNo.join(", ")
                      : batch.batchNo}
                  </td>
                  <td className="border px-4 py-2">{batch.MentorName}</td>
                  <td className="border px-4 py-2">{batch.StartTime}</td>
                  <td className="border px-4 py-2">{batch.EndTime}</td>
                  <td className="border px-4 py-2">{batch.StartDate}</td>
                  <td className="border px-4 py-2">{batch.EndDate}</td>
                  <td className="border px-4 py-2">{batch.RoomNo}</td>
                  <td className="border px-4 py-2">{batch.subject}</td>
                  <td className="border px-4 py-2 flex items-center gap-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded flex items-center gap-2"
                      onClick={() => onEditRow(batch)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded flex items-center gap-2"
                      onClick={() => handleDeleteClick(batch.id)} // Pass the id directly here
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </div>
  );
};

export default Table;
