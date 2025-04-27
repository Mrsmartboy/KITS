import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { decryptData } from '../../cryptoUtils.jsx';


const LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const location = decryptData(sessionStorage.getItem('location'));
  const id = decryptData(sessionStorage.getItem('id'));

  // Fetch leave requests from the API
  const fetchLeaveRequests = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/leaves`, {
        params: { location },
      });
      const data = response.data.leaves || [];
      setLeaveRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      // Swal.fire({
      //   title: 'Error',
      //   text: 'Failed to fetch leave requests. Please try again later.',
      //   icon: 'error',
      //   confirmButtonText: 'OK',
      // });
    } finally {
      setLoading(false);
    }
  }, [location]);

  // Update leave request status
  const updateLeaveStatus = async (studentId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/leaves`, { studentId, status,managerId:id });
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request.studentId === studentId ? { ...request, status } : request
        )
      );
      setFilteredRequests((prev) =>
        prev.map((request) =>
          request.studentId === studentId ? { ...request, status } : request
        )
      );
      Swal.fire({
        title: status === 'accepted' ? 'Accepted!' : 'Rejected!',
        text: `Leave request has been ${status}.`,
        icon: status === 'accepted' ? 'success' : 'error',
        confirmButtonText: 'OK',
      });
      fetchLeaveRequests(); // Fetch updated data
    } catch (error) {
      console.error('Error updating leave status:', error);
      // Swal.fire({
      //   title: 'Error',
      //   text: 'Failed to update leave status. Please try again.',
      //   icon: 'error',
      //   confirmButtonText: 'OK',
      // });
    }
    setShowModal(false); // Close the modal after action
  };

  // Handle viewing details
  const handleViewDetails = (studentId) => {
    const student = leaveRequests.find((request) => request.id === studentId);
    setSelectedStudent(student);
    setShowModal(true);
  };
  // Handle accept and reject actions
  const handleAccept = () => {
    updateLeaveStatus(selectedStudent.id, 'accepted');
  };

  const handleReject = () => {
    updateLeaveStatus(selectedStudent.id, 'rejected');
  };

  // Filter leave requests based on the search term
  const handleSearch = (e) => {
    const term = e.target.value ? e.target.value.toLowerCase() : ""; // Handle empty input
    setSearchTerm(term);
  
    const filtered = leaveRequests.filter((request) => {
      return (
        (request.studentName && request.studentName.toLowerCase().includes(term)) ||
        (request.studentId && request.studentId.toLowerCase().includes(term)) ||
        (request.batchNo && request.batchNo.toLowerCase().includes(term)) ||
        (request.location && request.location.toLowerCase().includes(term))
      );
    });
  
    setFilteredRequests(filtered);
  };
  

  useEffect(() => {
    if (leaveRequests.length === 0) {
      fetchLeaveRequests();
    }
  }, [fetchLeaveRequests,leaveRequests.length]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2 py-1 text-lg font-semibold text-green-700 bg-green-100 rounded-full">
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-lg font-semibold text-red-700 bg-red-100 rounded-full">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-lg font-semibold text-yellow-700 bg-yellow-100 rounded-full">
            Pending
          </span>
        );
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 py-10 mt-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-8">
          Leave Requests
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600">Requests</h2>
            <input
              type="text"
              placeholder="Search by Name, Batch, or Location"
              value={searchTerm}
              onChange={handleSearch}
              className="border rounded-lg px-4 py-2 text-sm sm:text-base"
            />
          </div>

          {loading ? (
            <p className="text-gray-600 text-center">Loading leave requests...</p>
          ) : filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
  <table className="table-auto w-full border-collapse border border-gray-200">
    <thead>
      <tr className="bg-blue-100 text-blue-800">
        <th className="border border-gray-300 px-2 sm:px-4 py-2">Student ID</th>
        <th className="border border-gray-300 px-2 sm:px-4 py-2">Student Name</th>
        <th className="border border-gray-300 px-2 sm:px-4 py-2">Reason</th>
        <th className="border border-gray-300 px-2 sm:px-4 py-2">Start Date</th>
        <th className="border border-gray-300 px-2 sm:px-4 py-2">End Date</th>
        <th className="border border-gray-300 px-2 sm:px-4 py-2">Total Days</th>
        <th className="border border-gray-300 px-2 sm:px-4 py-2">Status</th>
        {location==='all'&&<th className="border border-gray-300 px-2 sm:px-4 py-2">Location</th>
        }
         {location==='all'?<th className="border border-gray-300 px-2 sm:px-4 py-2">Accepted By</th>
          :<th className="border border-gray-300 px-2 sm:px-4 py-2">Action</th>
        }
        
      </tr>
    </thead>
    <tbody>
      {filteredRequests.map((request, index) => (
        <tr
          key={`${request.id}-${index}`}
          className={`hover:bg-blue-50 ${
            request.status === 'accepted'
              ? 'bg-green-100'
              : request.status === 'rejected'
              ? 'bg-red-100'
              : 'bg-white'
          }`}
        >
          <td className="border border-gray-300 px-2 sm:px-4 py-3 text-gray-700 text-center">
            {request.studentId}
          </td>
          <td className="border border-gray-300 px-2 sm:px-4 py-3 text-gray-700 text-center">
            {request.studentName || 'N/A'}
          </td>
          <td className="border border-gray-300 px-2 sm:px-4 py-3 text-gray-700 text-center">
            {request.Reason}
          </td>
          <td className="border border-gray-300 px-2 sm:px-4 py-3 text-gray-700 text-center">
            {request.StartDate}
          </td>
          <td className="border border-gray-300 px-2 sm:px-4 py-3 text-gray-700 text-center">
            {request.EndDate}
          </td>
          <td className="border border-gray-300 px-2 sm:px-4 py-3 text-gray-700 text-center">
            {request.TotalDays}
          </td>
          <td className="border border-gray-300 px-2 sm:px-4 py-3 text-center">
            {getStatusBadge(request.status)}
          </td>
          {location==='all'&&<td className="border border-gray-300 px-2 sm:px-4 py-2">{request.location}</td>}
          {location==='all'?'':  <td className="border border-gray-300 px-2 sm:px-4 py-3 text-center">
            {request.status === 'pending' ? (
              <button
                onClick={() => handleViewDetails(request.id)}
                className="bg-blue-500 text-white px-2 sm:px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
              >
                View Details
              </button>
            ) : (
              'Completed'
            )}
          </td>}

          {location==='all'&&<td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">{request.AcceptedBy || "pending..."}</td>}
          

        
        
        </tr>
      ))}
    </tbody>
  </table>
</div>

          ) : (
            <p className="text-gray-600 text-center">No leave requests found.</p>
          )}
        </div>
        
{showModal && selectedStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 w-full sm:w-3/4 lg:w-1/3">
      <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-4">
        Student Details
      </h2>
      <div className="text-gray-700 mb-4">
      <p className="mb-2">
          <span className="font-bold">Student Id:</span> {selectedStudent.studentId}
        </p>
        <p className="mb-2">
          <span className="font-bold">Name:</span> {selectedStudent.studentName || 'N/A'}
        </p>
        <p className="mb-2">
          <span className="font-bold">Reason:</span> {selectedStudent.Reason}
        </p>
        <p className="mb-2">
          <span className="font-bold">Start Date:</span> {selectedStudent.StartDate}
        </p>
        <p className="mb-2">
          <span className="font-bold">End Date:</span> {selectedStudent.EndDate}
        </p>
        <p className="mb-2">
          <span className="font-bold">Total Days:</span> {selectedStudent.TotalDays}
        </p>
        <p className="mb-2">
          <span className="font-bold">Batch No:</span> {selectedStudent.batchNo}
        </p>
        <p className="mb-2">
          <span className="font-bold">Parent Phone:</span> {selectedStudent.parentPhNumber}
        </p>
        <p className="mb-2">
          <span className="font-bold">Student Phone:</span> {selectedStudent.studentPhNumber}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <button
          onClick={handleAccept}
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
        >
          Reject
        </button>
        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default LeaveRequest;



