import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import moment from "moment";
import { FaChalkboardTeacher, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaDoorOpen } from "react-icons/fa";
import { decryptData } from '../../cryptoUtils.jsx';

// Default data array (for fallback)
const defaultLiveClasses = [];

const AdminLiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState(defaultLiveClasses);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);
    const storedLocation = "all";
  

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
          setError("Invalid user type. Please log in again.");
        }
      } catch (error) {
        console.error("Error decrypting userType:", error);
        setUserType(null);
        setError("Failed to decrypt user type. Please log in again.");
      }
    } else {
      console.error("No userType found in sessionStorage");
      setUserType(null);
      setError("No user type found. Please log in again.");
    }
  }, []);

  // Fetch live classes
  const fetchLiveClasses = useCallback(async () => {
    if (!userType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`;
      const response = await axios.get(url, { params: { location: storedLocation } });

      const courseFilter = userType === "Python" ? "Python Full Stack (PFS)" : "Java Full Stack (JFS)";

      const classes = response.data.schedule_data
        .filter((classItem) => {
          // Filter by course (PFS or JFS) only
          const isValid = classItem.course === courseFilter;
          // Log warning for mismatched batch numbers
          if (isValid && classItem.batchNo.some((batch) => !batch.startsWith(courseFilter.split(' ')[0]))) {
            console.warn(`Mixed batch numbers in ${classItem.id}: ${classItem.batchNo}`);
          }
          return isValid;
        })
        .map((classItem) => {
          const classStartDateTime = moment(`${classItem.StartDate} ${classItem.StartTime}`, "YYYY-MM-DD h:mm A");
          const classEndDateTime = moment(`${classItem.EndDate} ${classItem.EndTime}`, "YYYY-MM-DD h:mm A");
          const now = moment();

          let status;
          if (now.isBefore(classStartDateTime)) {
            status = "Upcoming";
          } else if (now.isBetween(classStartDateTime, classEndDateTime, null, "[]")) {
            status = "Ongoing";
          } else {
            status = "Completed";
          }

          return {
            id: classItem.id,
            subject: classItem.subject,
            instructor: classItem.MentorName,
            time: `${classItem.StartTime} - ${classItem.EndTime}`,
            batch: classItem.batchNo.join(", "),
            startDate: classItem.StartDate,
            endDate: classItem.EndDate,
            location: classItem.location,
            roomNo: classItem.RoomNo,
            status,
          };
        });

      setLiveClasses(classes);
    } catch (error) {
      console.error(`Error fetching ${userType} live classes:`, error);
      setError("Failed to fetch live classes. Please try again later.");
      setLiveClasses(defaultLiveClasses);
    } finally {
      setLoading(false);
    }
  }, [userType]);

  // Fetch data when userType is set
  useEffect(() => {
    if (userType) {
      fetchLiveClasses();
    }
  }, [userType, fetchLiveClasses]);

  // Memoized filtering logic
  const filteredClasses = useMemo(() => {
    if (!locationFilter) return liveClasses;
    return liveClasses.filter((liveClass) => liveClass.location === locationFilter);
  }, [liveClasses, locationFilter]);

  console.log("Filtered Classes:", filteredClasses);

  return (
    <div className="container mx-auto px-6 py-10 bg-gray-50 min-h-screen">
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>
      <h2 className="text-3xl font-inter font-bold text-center mb-8 border-b-2 border-blue-600 pb-2 text-gray-800">
        {userType
          ? `${userType === "Python" ? "Python Full Stack (PFS)" : "Java Full Stack (JFS)"} Live Classes Dashboard (${
              filteredClasses.length
            })`
          : "Live Classes Dashboard"}
      </h2>

      {loading ? (
        <p className="text-gray-600 text-center text-lg font-inter">Loading data...</p>
      ) : error ? (
        <p className="text-red-600 text-center text-lg font-inter">{error}</p>
      ) : (
        <>
          <div className="mb-8">
            <label
              htmlFor="location-filter"
              className="block text-xl font-inter font-semibold mb-3 text-gray-700"
            >
              <FaMapMarkerAlt className="inline-block mr-2 text-blue-600" />
              Filter by Location:
            </label>
            <select
              id="location-filter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full max-w-md p-3 border border-gray-200 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
              aria-label="Filter classes by location"
            >
              <option value="" className="font-inter">
                -- All Locations --
              </option>
              {[...new Set(liveClasses.map((item) => item.location))].map((location, index) => (
                <option key={index} value={location} className="font-inter">
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((liveClass) => (
                <div
                  key={liveClass.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 animate-fadeIn"
                  style={{ animationDelay: `${liveClass.id % 10 * 0.1}s` }}
                >
                  <div className="flex items-center mb-4">
                    <FaChalkboardTeacher className="text-blue-600 mr-2" />
                    <h3 className="text-lg font-inter font-semibold text-blue-600">
                      {userType === "Python" ? "PFS" : "JFS"} Class Details
                    </h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <strong className="w-24 font-inter">Subject:</strong> {liveClass.subject}
                    </li>
                    <li className="flex items-center">
                      <FaUsers className="text-blue-500 mr-2" />
                      <strong className="w-24 font-inter">Instructor:</strong> {liveClass.instructor}
                    </li>
                    <li className="flex items-center">
                      <FaClock className="text-blue-500 mr-2" />
                      <strong className="w-24 font-inter">Time:</strong> {liveClass.time}
                    </li>
                    <li className="flex items-center">
                      <FaCalendarAlt className="text-blue-500 mr-2" />
                      <strong className="w-24 font-inter">Start Date:</strong> {liveClass.startDate}
                    </li>
                    <li className="flex items-center">
                      <FaCalendarAlt className="text-blue-500 mr-2" />
                      <strong className="w-24 font-inter">End Date:</strong> {liveClass.endDate}
                    </li>
                    <li className="flex items-center">
                      <FaMapMarkerAlt className="text-blue-500 mr-2" />
                      <strong className="w-24 font-inter">Location:</strong> {liveClass.location}
                    </li>
                    <li className="flex items-center">
                      <FaDoorOpen className="text-blue-500 mr-2" />
                      <strong className="w-24 font-inter">Room No:</strong> {liveClass.roomNo}
                    </li>
                    <li className="flex items-center">
                      <strong className="w-24 font-inter">Status:</strong>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-inter font-semibold ${
                          liveClass.status === "Ongoing"
                            ? "bg-green-200 text-green-700"
                            : liveClass.status === "Upcoming"
                            ? "bg-yellow-200 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {liveClass.status}
                      </span>
                    </li>
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center text-lg font-inter">No live classes found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLiveClasses;