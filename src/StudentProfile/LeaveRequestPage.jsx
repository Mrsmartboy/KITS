import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useStudent } from "../contexts/StudentProfileContext"; 
import { FaCalendarAlt } from "react-icons/fa"; // Calendar Icon

const LeaveRequestPage = () => {
  const { studentDetails } = useStudent();
  const [leaveData, setLeaveData] = useState({ reason: '', startDate: '', endDate: ''});
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    if (!studentDetails) return;
    try {
      const { studentId, location } = studentDetails;
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/stdleave`, {
        params: { studentId, location }
      });
      setLeaveRequests(response.data.leaves || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setFetchLoading(false);
    }
  }, [studentDetails]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prevData) => ({ ...prevData, [name]: value }));
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); 
    return difference + 1; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("hello world")
    setLoading(true);

    if (!studentDetails) {
      setLoading(false);
      return Swal.fire("Error", "Student details not found. Please log in again.", "error");
    }

    const totalDays = calculateDays(leaveData.startDate, leaveData.endDate);

    if (totalDays <= 0) {
      setLoading(false);
      return Swal.fire("Error", "End date must be after start date.", "error");
    }

    const payload = {
      studentId: studentDetails.studentId,
      batchNo: studentDetails.BatchNo,
      studentName: studentDetails.name,
      studentNumber: Number(studentDetails.phone),
      parentNumber: Number(studentDetails.parentNumber),
      reason: leaveData.reason,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      location: studentDetails.location,
      totalDays,
      status: "pending"
    };
    console.log(payload)

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/stdleave`, payload);
      Swal.fire("Success", "Leave request submitted successfully!", "success");
      setLeaveData({ reason: '', startDate: '', endDate: '', leaveType: '' });
      fetchLeaveRequests();
    } catch (error) {
      console.error("Error submitting leave request:", error);
      Swal.fire("Error", "Failed to submit leave request.", "error");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);
  const currentItems = leaveRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  return (
    <div className="bg-[#f4f4f4] flex justify-center    lg:py-10 sm:px-5 sm:py-5 px-4 py-2 mt-0 font-[inter]">
      <div className="relative w-full max-w-full min-h-[80vh] bg-white shadow-lg rounded-md lg:p-10 p-3 flex flex-col gap-10">
        
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
  {/* Left/Form Column */}
  <div>
    {/* Heading */}
    <div className="relative w-[253px] h-[47px] bg-[#19216F] flex items-center px-5 rounded-md shadow-md">
      <div className="absolute left-0 top-0 h-full w-2 bg-red-500 rounded-l-md"></div>
      <img
        src="/leave/leaverequesticon.svg"
        alt="Leave Request Icon"
        className="w-6 h-6 mr-2"
      />
      <span className="text-white text-lg font-semibold">Leave Request</span>
    </div>

    {/* Form */}
    <form
      id="leaveForm"
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
    >
      {/* Start Date */}
      <div className="flex flex-col">
        <label className="text-gray-700 font-semibold mb-2">Start Date</label>
        <div className="relative flex items-center bg-[#EFF0F7] border border-[#0C1BAA] rounded-md w-full h-[50px] px-4">
          <FaCalendarAlt className="text-[#0C1BAA] mr-2" />
          <input
            type="date"
            name="startDate"
            value={leaveData.startDate}
            onChange={handleChange}
            className="w-full outline-none bg-transparent"
            required
          />
        </div>
      </div>

      {/* End Date */}
      <div className="flex flex-col">
        <label className="text-gray-700 font-semibold mb-2">End Date</label>
        <div className="relative flex items-center bg-[#EFF0F7] border border-[#0C1BAA] rounded-md w-full h-[50px] px-4">
          <FaCalendarAlt className="text-[#0C1BAA] mr-2" />
          <input
            type="date"
            name="endDate"
            value={leaveData.endDate}
            onChange={handleChange}
            className="w-full outline-none bg-transparent"
            required
          />
        </div>
      </div>
    </form>

    {/* Reason and Submit Button */}
    <div className="flex flex-col md:flex-row items-center gap-6 mt-6">
      <textarea
        form="leaveForm"
        name="reason"
        value={leaveData.reason}
        onChange={handleChange}
        className="w-full md:w-2/3 h-[60px] border border-[#0C1BAA] rounded-md p-4 bg-[#EFF0F7] text-gray-600 resize-none"
        placeholder="Reason..."
        required
      />
      <button
        form="leaveForm"
        type="submit"
        className="w-full md:w-1/3 h-[60px] bg-[#19216F] text-white font-semibold rounded-md shadow-md hover:bg-blue-800 transition flex items-center justify-center"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </div>
  </div>

  {/* Right/Image Column (hidden below md) */}
  <div className="hidden md:flex justify-center items-center">
    <img
      src="/leave/Frame.svg"
      alt="Leave Request Illustration"
      className="w-auto max-w-xs md:max-w-md lg:max-w-lg"
    />
  </div>
</div>



        <div className="border-t border-[#303C60] pt-8">
          <h2 className="text-2xl font-bold text-center text-[#0C1BAA]">Applied Leave Requests</h2>

          <div className="overflow-x-auto mt-6">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-[#19216F] text-white ">
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {fetchLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-3">Loading...</td>
                  </tr>
                ) : (
                  currentItems.map((leave, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                      <td className="p-3 border">{formatDate(leave.StartDate)}</td>
                      <td className="p-3 border">{formatDate(leave.EndDate)}</td>

                      <td className="p-3 border">{leave.Reason}</td>
                      <td className="p-3 border">
                        
                        <span className={`px-4 py-2   rounded-md text-white ${leave.status === "accepted" ? "bg-[#11940A]" : "bg-[#EC5300]"}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!fetchLoading && totalPages > 1 && (
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`mx-1 px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-[#0C1BAA] text-white" : "bg-white text-[#0C1BAA]"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestPage;