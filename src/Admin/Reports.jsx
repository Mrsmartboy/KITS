import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaUserTie, FaChalkboardTeacher, FaMapMarkerAlt, FaEnvelope, FaPhone, FaBuilding } from "react-icons/fa";

// Default data arrays (for fallback)
const defaultBDEData = [];
const defaultMentorData = [];
const defaultProgramManagerData = [];

const Reports = () => {
  const [bdeData, setBdeData] = useState(defaultBDEData);
  const [mentorData, setMentorData] = useState(defaultMentorData);
  const [programManagerData, setProgramManagerData] = useState(defaultProgramManagerData);

  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchCounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/adminsdata`);
      const { BDE, Mentors, Managers } = response.data;

      setBdeData(BDE || []);
      setMentorData(Mentors || []);
      setProgramManagerData(Managers || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching report counts:", error);
      setBdeData(defaultBDEData);
      setMentorData(defaultMentorData);
      setProgramManagerData(defaultProgramManagerData);
      setLoading(false);
    }
  };
 
  // Fetch data from API
  useEffect(() => {

    fetchCounts();
  }, []);

  // Filtered data based on location
  const getFilteredData = (data) =>
    locationFilter ? data.filter((item) => item.location === locationFilter) : data;

  const filteredBDE = getFilteredData(bdeData);
  const filteredMentors = getFilteredData(mentorData);
  const filteredProgramManagers = getFilteredData(programManagerData);

  // Handle modal
  const handleUserClick = (user) => setSelectedUser(user);
  const handleModalClose = () => setSelectedUser(null);

  return (
    <div className="container mx-auto  px-4 py-8 overflow-auto mt-0">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Dashboard</h2>

      {loading ? (
        <p className="text-gray-500 text-center">Loading data...</p>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              <FaMapMarkerAlt className="inline-block mr-2 text-blue-600" />
              Filter by Location:
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-7xl p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            >
              <option value="">-- All Locations --</option>
              {[...new Set([...bdeData, ...mentorData, ...programManagerData].map((item) => item.location))].map(
                (location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* BDE Management */}
            <div className="bg-blue-100 text-blue-800 px-6 py-4 rounded shadow hover:bg-blue-200 cursor-pointer">
              <div className="flex items-center gap-2">
                <FaUsers className="text-3xl" />
                <h3 className="text-2xl font-bold">BDE Management</h3>
              </div>
              <p className="text-2xl font-semibold mt-2">Total: {filteredBDE.length}</p>
              <ul className="mt-4 space-y-2">
                {filteredBDE.map((bde, index) => (
                  <li
                    key={index}
                    onClick={() => handleUserClick(bde)}
                    className="cursor-pointer hover:underline font-semibold"
                  >
                    {bde.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mentor Management */}
            <div className="bg-green-100 text-green-800 px-6 py-4 rounded shadow hover:bg-green-200 cursor-pointer">
              <div className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-3xl" />
                <h3 className="text-2xl font-bold">Mentor Management</h3>
              </div>
              <p className="text-2xl font-semibold mt-2">Total: {filteredMentors.length}</p>
              <ul className="mt-4 space-y-2">
                {filteredMentors.map((mentor, index) => (
                  <li
                    key={index}
                    onClick={() => handleUserClick(mentor)}
                    className="cursor-pointer hover:underline font-semibold"
                  >
                    {mentor.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Program Managers */}
            <div className="bg-purple-100 text-purple-800 px-6 py-4 rounded shadow hover:bg-purple-200 cursor-pointer">
              <div className="flex items-center gap-2">
                <FaUserTie className="text-3xl" />
                <h3 className="text-2xl font-bold">Program Managers</h3>
              </div>
              <p className="text-2xl font-semibold mt-2">Total: {filteredProgramManagers.length}</p>
              <ul className="mt-4 space-y-2">
                {filteredProgramManagers.map((manager, index) => (
                  <li
                    key={index}
                    onClick={() => handleUserClick(manager)}
                    className="cursor-pointer hover:underline font-semibold"
                  >
                    {manager.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Modal for User Details */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              <FaBuilding className="inline-block mr-2 text-blue-500" />
              {selectedUser.usertype} Details
            </h3>
            <ul className="text-gray-700 space-y-2">
              <li>
                <strong>Name:</strong> {selectedUser.name}
              </li>
              <li>
                <strong>Email:</strong> <FaEnvelope className="inline-block mr-1" />
                {selectedUser.email}
              </li>
              <li>
                <strong>Phone:</strong> <FaPhone className="inline-block mr-1" />
                {selectedUser.PhNumber}
              </li>
              <li>
                <strong>Location:</strong> {selectedUser.location}
              </li>
             
              {selectedUser.Designation && (
                <li className="text-lg font-bold text-green-800">
                  <strong>Designation:</strong> {selectedUser.Designation.join(', ')}
                </li>
              )}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                onClick={handleModalClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
