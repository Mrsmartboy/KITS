import React, { useState, useEffect } from "react";
import { useStudentsMentorData } from "../contexts/MentorStudentsContext";

const MentorBatches = () => {
  const { scheduleData = [], studentsList = [], fetchMentorStudents } = useStudentsMentorData();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchMentorStudents(selectedBatch);
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchMentorStudents]);

  // Handle batch selection
  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
    setModalOpen(true);
  };

  // Close modal function
  const closeModal = () => {
    setModalOpen(false);
    setSelectedBatch(null);
  };

  return (
    <div className="container mx-auto p-8">
      {/* Page Title */}
      <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
        Scheduled Batches
      </h2>

      {/* Loading State */}
      {loading ? (
        <p className="text-center text-gray-500 text-lg font-semibold animate-pulse">
          🔄 Fetching Batches...
        </p>
      ) : scheduleData.length === 0 ? (
        <p className="text-center text-red-500 text-lg font-semibold">
          ❌ No Batches Found!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scheduleData.map((batch) => (
            <div
              key={batch.id}
              className="bg-gradient-to-br from-blue-100 to-blue-300 shadow-lg rounded-lg p-6 hover:scale-105 transition-transform duration-300 cursor-pointer hover:shadow-2xl border border-gray-300"
              onClick={() => handleBatchClick(batch)}
            >
              <h3 className="text-2xl font-semibold text-gray-800">
                {batch.subject} <span className="text-sm text-gray-600">({batch.batchNo?.join(", ") || "N/A"})</span>
              </h3>
              <p className="text-md text-gray-700 mt-2">
                Mentor: <span className="font-bold text-blue-800">{batch.MentorName || "Unknown"}</span>
              </p>
             
            </div>
          ))}
        </div>
      )}

      {/* Student List Modal */}
      {modalOpen && selectedBatch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-all">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-lg w-full transition-transform transform scale-95 animate-fadeIn">
            {/* Modal Title */}
            <h3 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
              Students in <span className="text-blue-600">{selectedBatch.batchNo?.join(", ") || "N/A"}</span>
            </h3>

            {/* Student List */}
            <div className="mt-4 max-h-64 overflow-auto border rounded-md shadow-inner p-3">
              {studentsList.length > 0 ? (
                studentsList
                  .filter((student) =>
                    selectedBatch.batchNo?.some((batch) => batch === student.BatchNo)
                  )
                  .map((student) => (
                    <div
                      key={student.id}
                      className="p-3 border-b border-gray-200 flex justify-between hover:bg-gray-100 rounded-md transition duration-200"
                    >
                      <span className="font-medium text-gray-900">{student.name || "N/A"}</span>
                      <span className="text-sm text-gray-600">{student.email || "N/A"}</span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center font-medium">No students available.</p>
              )}
            </div>

            {/* Close Button */}
            <button
              className="mt-6 w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorBatches;
