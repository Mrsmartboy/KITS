import React, { useState } from "react";
import { useUniqueBatches } from "../contexts/UniqueBatchesContext";
import {
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaCodeBranch,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { decryptData } from '../../cryptoUtils.jsx';

const techStacks = {
  vijayawada: ["Python Full Stack (PFS)", "Java Full Stack (JFS)","DSA","C"],
  hyderabad: [
    "Python Full Stack (PFS)",
    "Java Full Stack (JFS)",
    "Data Science",
    "Data Analytics",

  ],
  bangalore: ["Java Full Stack (JFS)"],
};

const BatchForm = () => {
  const [formData, setFormData] = useState({
    BatchId: "",
    TechStack: "",
    StartDate: "",
    EndDate: "",
    Status: "",
  });

  const [duration, setDuration] = useState(null); // Store calculated duration
  const location = decryptData(sessionStorage.getItem("location")); // Default to Vijayawada
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { fetchBatches } = useUniqueBatches();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setFormData({ ...formData, [name]: value });
  
    // Auto-calculate EndDate and Duration when StartDate is selected and TechStack is PFS or JFS
    if (name === "StartDate" && value) {
      const techStack = formData.TechStack;
      if (techStack === "Python Full Stack (PFS)" || techStack === "Java Full Stack (JFS)") {
        const holidays = [
          "2025-01-14", // Jan-14
          "2025-01-26", // Jan-26
          "2025-02-26", // Feb-26
          "2025-03-30", // Mar-30
          "2025-03-31", // Mar-31
          "2025-04-06", // Apr-6
          "2025-08-15", // Aug-15
          "2025-08-27", // Aug-27
          "2025-10-02", // Oct-2
          "2025-10-20", // Oct-20
          "2025-12-25", // Dec-25
        ];
  
        let currentDate = new Date(value);
        let daysCounted = 0;
  
        // Loop until we reach 100 valid days (excluding Sundays and holidays)
        while (daysCounted < 100) {
          currentDate.setDate(currentDate.getDate() + 1); // Move to next day
  
          const isSunday = currentDate.getDay() === 0;
          const formattedDate = currentDate.toISOString().split("T")[0];
          const isHoliday = holidays.includes(formattedDate);
  
          if (!isSunday && !isHoliday) {
            daysCounted++;
          }
        }
  
        // Set the calculated EndDate
        const endDate = currentDate.toISOString().split("T")[0];
        setFormData((prev) => ({ ...prev, EndDate: endDate }));
  
        // **Change 1**: Set duration to 100 working days directly
        setDuration("100 Days");
      }
    } else if (name === "EndDate" && formData.StartDate) {
      // **Change 2**: Calculate working days between StartDate and EndDate when EndDate is manually changed
      const holidays = [
        "2025-01-14", // Jan-14
        "2025-01-26", // Jan-26
        "2025-02-26", // Feb-26
        "2025-03-30", // Mar-30
        "2025-03-31", // Mar-31
        "2025-04-06", // Apr-6
        "2025-08-15", // Aug-15
        "2025-08-27", // Aug-27
        "2025-10-02", // Oct-2
        "2025-10-20", // Oct-20
        "2025-12-25", // Dec-25
      ];
  
      const startDate = new Date(formData.StartDate);
      const endDate = new Date(value);
      let currentDate = new Date(startDate);
      let workingDays = 0;
  
      // Count working days between StartDate and EndDate
      while (currentDate <= endDate) {
        const isSunday = currentDate.getDay() === 0;
        const formattedDate = currentDate.toISOString().split("T")[0];
        const isHoliday = holidays.includes(formattedDate);
  
        if (!isSunday && !isHoliday) {
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      if (endDate >= startDate) {
        setDuration(`${workingDays} Days`);
      } else {
        setDuration(null);
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);


    

    const payload = {
      BatchId: formData.BatchId.toUpperCase(),
      TechStack: formData.TechStack,
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      Duration: duration, // Calculated duration in days
      Status: formData.Status,
      location,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/batches`,
        payload
      );
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Batch Created Successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      await fetchBatches(location)

      setFormData({
        BatchId: "",
        TechStack: "",
        StartDate: "",
        EndDate: "",
        Status: "",
      });
      setDuration(null);
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text:
          err.response?.data?.error || "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleViewBatches = (e) => {
    e.preventDefault()
    fetchBatches(location)
    navigate("/viewbatch");
  };

  return (
    <div className=" flex items-center justify-center p-6 mt-0">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          <span className="text-black bg-clip-text">
            Create New Batch
          </span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Tech Stack */}
                <div>
              <label
                htmlFor="TechStack"
                className="block text-sm font-medium text-gray-700"
              >
                <FaCodeBranch className="inline mr-2 text-green-500" />
                Tech Stack
              </label>
              <select
                name="TechStack"
                id="TechStack"
                value={formData.TechStack}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="" disabled>
                  Select a Tech Stack
                </option>
                {techStacks[location]?.map((stack) => (
                  <option key={stack} value={stack}>
                    {stack}
                  </option>
                ))}
              </select>
            </div>
            {/* Batch ID */}
            <div>
              <label
                htmlFor="BatchId"
                className="block text-sm font-medium text-gray-700"
              >
                <FaIdCard className="inline mr-2 text-blue-500" />
                Batch ID
              </label>
              <input
                type="text"
                name="BatchId"
                id="BatchId"
                value={formData.BatchId.toUpperCase()}
                onChange={handleInputChange}
                placeholder="Enter Batch ID (e.g., PFS-100)"
                className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

        

            {/* Start Date */}
            <div>
              <label
                htmlFor="StartDate"
                className="block text-sm font-medium text-gray-700"
              >
                <FaCalendarAlt className="inline mr-2 text-yellow-500" />
                Start Date
              </label>
              <input
                type="date"
                name="StartDate"
                id="StartDate"
                value={formData.StartDate}
                onChange={handleInputChange}
                // Sets the minimum date to today
                className="mt-1 cursor-pointer block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="EndDate"
                className="block text-sm font-medium text-gray-700"
              >
                <FaCalendarAlt className="inline mr-2 text-red-500" />
                End Date
              </label>
              <input
                type="date"
                name="EndDate"
                id="EndDate"
                value={formData.EndDate}
                onChange={handleInputChange}
                min={formData.StartDate} // Ensure End Date is after Start Date
                className="mt-1 cursor-pointer block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Duration (Auto-Calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaClock className="inline mr-2 text-indigo-500" />
                Course Duration
              </label>
              <div className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm bg-gray-100">
                {duration ? duration : "Select Start and End Date"}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="Status"
                className="block text-sm font-medium text-gray-700"
              >
                <FaInfoCircle className="inline mr-2 text-pink-500" />
                Course Status
              </label>
              <select
                name="Status"
                id="Status"
                value={formData.Status}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>
          

          
          

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-6 py-3 rounded-md shadow-lg transform transition duration-300 ease-in-out ${
                isLoading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:scale-105"
              }`}
            >
              {isLoading ? "Submitting..." : "Create Batch"}
            </button>
            <button
              onClick={handleViewBatches}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
            >
              View Batches
            </button>
          </div>
          
        </form>

        
        
      </div>
    </div>
  );
};

export default BatchForm;
