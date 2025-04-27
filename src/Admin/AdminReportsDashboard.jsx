import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaBuilding } from "react-icons/fa";
import { decryptData } from '../../cryptoUtils.jsx';

// Default data array (for fallback)
const defaultMentorData = [];

const AdminReportsDashboard = () => {
  const [mentorData, setMentorData] = useState(defaultMentorData);
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  // Define subject sets for PFS and JFS
  const PFS = ["Python", "Flask", "Frontend", "SoftSkills", "MySQL", "Aptitude"];
  const JFS = ["Java", "AdvancedJava", "Frontend", "SoftSkills", "MySQL", "Aptitude"];

  // Decrypt userType from sessionStorage
  useEffect(() => {
    const encryptedUserType = sessionStorage.getItem("userType");
    if (encryptedUserType) {
      try {
        const decryptedUserType = decryptData(encryptedUserType);
        if (decryptedUserType === "Python" || decryptedUserType === "Java") {
          setUserType(decryptedUserType);
        } else {
          console.error("Invalid userType:", decryptedUserType);
          setUserType(null);
        }
      } catch (error) {
        console.error("Error decrypting userType:", error);
        setUserType(null);
      }
    } else {
      console.error("No userType found in sessionStorage");
      setUserType(null);
    }
  }, []);

  const fetchMentorData = async () => {
    if (!userType) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/adminsdata`);
      const mentors = response.data.Mentors || [];

      // Filter mentors based on any subject match in PFS or JFS, excluding opposite key subjects
      const updatedMentors = mentors.filter((mentor) => {
        const designations = Array.isArray(mentor.Designation) ? mentor.Designation : [mentor.Designation];
        const subjectSet = userType === "Python" ? PFS : JFS;
        const oppositeKeySubjects = userType === "Python" ? ["Java", "AdvancedJava"] : ["Python", "Flask"];

        // Include only if at least one designation matches the subject set and none match opposite key subjects
        const hasOwnSubject = designations.some((designation) => subjectSet.includes(designation));
        const hasOppositeKeySubject = designations.some((designation) => oppositeKeySubjects.includes(designation));
        return hasOwnSubject && !hasOppositeKeySubject;
      });

      setMentorData(updatedMentors);
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching ${userType} mentor data:`, error);
      setMentorData(defaultMentorData);
      setLoading(false);
    }
  };

  // Fetch data from API when userType is set
  useEffect(() => {
    if (userType) {
      fetchMentorData();
    }
  }, [userType]);

  // Filtered data based on location
  const getFilteredData = (data) =>
    locationFilter ? data.filter((item) => item.location === locationFilter) : data;

  const filteredMentors = getFilteredData(mentorData);

  return (
    <div className="container mx-auto px-6 py-10 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-inter font-bold text-center mb-8 border-b-2 border-blue-600 pb-2 text-gray-800">
        {userType ? `${userType} Mentors Dashboard (${filteredMentors.length})` : "Mentors Dashboard"}
      </h2>
      

      {loading ? (
        <p className="text-gray-600 text-center text-lg font-inter">Loading data...</p>
      ) : !userType ? (
        <p className="text-red-600 text-center text-lg font-inter">Invalid or missing user type. Please log in again.</p>
      ) : (
        <>
          <div className="mb-8">
            <label className="block text-xl font-inter font-semibold mb-3 text-gray-700">
              <FaMapMarkerAlt className="inline-block mr-2 text-blue-600" />
              Filter by Location:
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full max-w-md p-3 border border-gray-200 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
            >
              <option value="" className="font-inter">-- All Locations --</option>
              {[...new Set(mentorData.map((item) => item.location))].map((location, index) => (
                <option key={index} value={location} className="font-inter">
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6"
                >
                  <div className="flex items-center mb-4">
                    <FaBuilding className="text-blue-600 mr-2" />
                    <h3 className="text-lg font-inter font-semibold text-blue-600">
                      {userType} Mentor Details
                    </h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <strong className="w-20 font-inter">Name:</strong> {mentor.name}
                    </li>
                    <li className="flex items-center">
                      <FaEnvelope className="text-blue-500 mr-2" />
                      <strong className="w-20 font-inter">Email:</strong> {mentor.email}
                    </li>
                    <li className="flex items-center">
                      <FaPhone className="text-blue-500 mr-2" />
                      <strong className="w-20 font-inter">Phone:</strong> {mentor.PhNumber}
                    </li>
                    <li className="flex items-center">
                      <FaMapMarkerAlt className="text-blue-500 mr-2" />
                      <strong className="w-20 font-inter">Location:</strong> {mentor.location}
                    </li>
                    {mentor.Designation && (
                      <li className="flex items-center">
                        <strong className="w-20 text-green-700 font-inter mr-2 ml-1">Designation:</strong>
                        <span className="text-green-700 font-inter font-medium">
                          {Array.isArray(mentor.Designation)
                            ? mentor.Designation.join(', ')
                            : mentor.Designation}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center text-lg font-inter">No mentors found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportsDashboard;