import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment";
import { FaChalkboardTeacher, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaDoorOpen, FaList } from "react-icons/fa"; // Added FaList for Batch No
import { decryptData } from '../../cryptoUtils.jsx';

const LiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("all");

  const storedLocation = decryptData(sessionStorage.getItem("location")) || "all";

  // Fetch live classes
  const fetchLiveClasses = useCallback(async () => {
    if (liveClasses.length > 0) return;

    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`;
      const response = await axios.get(url, { params: { location: storedLocation } });

      const classes = response.data.schedule_data.map((classItem) => {
        const classStartDateTime = moment(`${classItem.StartDate} ${classItem.StartTime}`, "YYYY-MM-DD HH:mm");
        const classEndDateTime = moment(`${classItem.EndDate} ${classItem.EndTime}`, "YYYY-MM-DD HH:mm");
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
          course: classItem.course,
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch live classes. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [storedLocation, liveClasses.length]);

  useEffect(() => {
    if (liveClasses.length === 0) fetchLiveClasses();
  }, [fetchLiveClasses, liveClasses.length]);

  // Memoized filtering logic
  const filteredClasses = useMemo(() => {
    if (locationFilter === "all") return liveClasses;
    return liveClasses.filter((liveClass) => liveClass.location === locationFilter);
  }, [liveClasses, locationFilter]);

  const handleLocationFilterChange = (e) => {
    setLocationFilter(e.target.value);
  };

  return (
    <div className="min-h-screen py-10 mt-0">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
          📚 Live Mentor Classes
        </h1>

        {loading ? (
          <div className="text-center text-gray-700 text-lg font-semibold animate-pulse">
            Loading Mentor classes...
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map((liveClass) => (
              <div
                key={liveClass.id}
                className={`p-6 rounded-lg shadow-lg bg-white border transform transition hover:scale-105 hover:shadow-2xl ${
                  liveClass.status === "Ongoing"
                    ? "border-green-300"
                    : liveClass.status === "Upcoming"
                    ? "border-yellow-300"
                    : "border-gray-300"
                }`}
              >
                <h2 className="text-xl font-bold mb-2 flex items-center text-blue-600">
                  <FaChalkboardTeacher className="mr-2" />
                  {liveClass.batch}
                </h2>
                <p className="text-gray-600 text-md flex items-center">
                  <FaUsers className="mr-2" />
                  <span className="font-semibold">Instructor:</span> {liveClass.instructor}
                </p>
                <p className="text-gray-600 text-md flex items-center">
                  <FaClock className="mr-2" />
                  <span className="font-semibold">Time:</span> {liveClass.time}
                </p>
                <p className="text-gray-600 text-md flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span className="font-semibold">Start Date:</span> {liveClass.startDate}
                </p>
                <p className="text-gray-600 text-md flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span className="font-semibold">End Date:</span> {liveClass.endDate}
                </p>
                <p className="text-gray-600 text-md flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  <span className="font-semibold">Location:</span> {liveClass.location}
                </p>
                <p className="text-gray-600 text-md flex items-center">
                  <FaDoorOpen className="mr-2" />
                  <span className="font-semibold">Room No:</span> {liveClass.roomNo}
                </p>
                
                <div className="text-center mt-4">
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow-md ${
                      liveClass.status === "Ongoing"
                        ? "bg-green-200 text-green-700"
                        : liveClass.status === "Upcoming"
                        ? "bg-yellow-200 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {liveClass.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-700 text-lg">
            🚫 No live classes available.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClasses;