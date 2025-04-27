import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import axios from "axios";
import { FaBookOpen, FaCalendarAlt, FaClock, FaChalkboardTeacher } from "react-icons/fa";

const BatchSchedulePage = () => {
  const { state } = useLocation();
  const batch = state?.batch || {}; // Default to empty object if state or batch is null
  const navigate = useNavigate();

  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    if (!batch || !batch.location || !batch.Batch) {
      console.error("Batch data is missing or incomplete:", batch);
      navigate("/"); 
      return;
    }

    const fetchScheduledData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule?location=${batch.location}`
        );
        const filteredSchedule = response.data.schedule_data.filter((item) =>
          item.batchNo.includes(batch.Batch)
        );
        setScheduleData(filteredSchedule);
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      }
    };

    fetchScheduledData();
  }, [batch, navigate]);

  // Render fallback UI if batch data is missing
  if (!batch || !batch.Batch) {
    return (
      <div className="text-center text-xl text-red-600">
        No batch data available. Please select a batch from the batch list page.
        <button
          onClick={() => navigate("/batch-list")} // Redirect to batch selection page
          className="ml-2 text-blue-500 underline"
        >
          Go to Batch List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        Schedule for {batch.Batch}
      </h1>

      {scheduleData.length === 0 ? (
        <div className="text-center text-xl text-gray-600">No schedule data available for this batch.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scheduleData.map((item) => (
            <div
              key={item._id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <FaBookOpen className="text-teal-600" />
                  <h3 className="font-semibold text-xl text-gray-800">{item.subject}</h3>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <FaChalkboardTeacher className="text-blue-500" />
                <p className="text-gray-700 font-medium">{item.MentorName}</p>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <FaCalendarAlt className="text-yellow-500" />
                <p className="text-gray-700 font-medium">Start Date: {item.StartDate}</p>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <FaCalendarAlt className="text-orange-500" />
                <p className="text-gray-700 font-medium">End Date: {item.EndDate}</p>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <FaClock className="text-purple-500" />
                <p className="text-gray-700 font-medium">
                  Time: {item.StartTime} - {item.EndTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchSchedulePage;