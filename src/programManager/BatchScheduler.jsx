import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Dropdown from "./Dropdown";
import InputField from "./InputField";
import Table from "./Table";
import Select from "react-select";
import Swal from "sweetalert2";
import { useUniqueBatches } from "../contexts/UniqueBatchesContext";
import { toast } from "react-toastify";
import { decryptData } from '../../cryptoUtils.jsx';

const BatchScheduler = () => {
  const [mentorName, setMentorName] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [selectedTechStack, setSelectedTechStack] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mentors, setMentors] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [loadingAddSchedule, setLoadingAddSchedule] = useState(false);
  const [loadingSaveChanges, setLoadingSaveChanges] = useState(false);
  const { batches, fetchBatches } = useUniqueBatches();

  const location = decryptData(sessionStorage.getItem('location')); // Hardcode to KITS

  const techStackSubjects = {
    KITS: ["C", "Python", "DSA-C"],
  };

  const mockBatches = {
    C: ["C"],
    Python: ["Python"],
    "DSA-C": ["DSA-C"],
  };

  const mockSubjects = {
    C: ["C"],
    Python: ["Python"],
    "DSA-C": ["DSA-C"],
  };

  const handleTechStackChange = (value) => {
    setSelectedTechStack(value);
    setAvailableSubjects(mockSubjects[value] || []);
    setSelectedSubject("");
    setSelectedBatches([]);
  };

  const formatTimeTo24Hour = (time) => {
    if (!time) return "";
    const [timePart, modifier] = time.split(" ");
    if (!timePart || !modifier) return time;

    let [hours, minutes] = timePart.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const formatTo12Hour = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute < 10 ? "0" + minute : minute} ${ampm}`;
  };

  const handleEditRow = (row) => {
    setEditingRowId(row.id || null);
    setMentorName(row.MentorName || "");
    setRoomNo(row.RoomNo || "");
    setStartDate(row.StartDate || "");
    setEndDate(row.EndDate || "");
    
    const detectedTechStack = Object.keys(mockSubjects).find((key) =>
      mockSubjects[key].includes(row.subject)
    );
    setSelectedTechStack(detectedTechStack || "");
    setAvailableSubjects(mockSubjects[detectedTechStack] || []);
    setSelectedSubject(row.subject || "");
    
    const availableRowBatches = Array.isArray(row.batchNo)
      ? row.batchNo.map((batch) => ({ value: batch, label: batch }))
      : [];
    setSelectedBatches(availableRowBatches);
    
    setStartTime(row.StartTime ? formatTimeTo24Hour(row.StartTime) : "");
    setEndTime(row.EndTime ? formatTimeTo24Hour(row.EndTime) : "");
  };

  const handleSaveEdit = async () => {
    if (
      !startDate ||
      !endDate ||
      !selectedTechStack ||
      !selectedSubject ||
      !startTime ||
      !endTime ||
      !roomNo ||
      !mentorName ||
      !selectedBatches.length
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields before updating the schedule!",
      });
      return;
    }

    const updatedRow = {
      id: editingRowId,
      mentorName,
      roomNo,
      techStack: selectedTechStack,
      subject: selectedSubject,
      startDate,
      endDate,
      startTime: formatTo12Hour(startTime),
      endTime: formatTo12Hour(endTime),
      batches: selectedBatches.map((batch) => batch.value),
      location,
    };
    setLoadingSaveChanges(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
        updatedRow
      );
      if (response.status === 200) {
        Swal.fire("Success", "Schedule updated successfully!", "success");
        setEditingRowId(null);
        await fetchData();
      }
      fetchBatchData();
      setShowTable(true);
      setMentorName("");
      setStartTime("");
      setEndTime("");
      setStartDate("");
      setEndDate("");
      setRoomNo("");
      setSelectedTechStack("");
      setSelectedSubject("");
      setSelectedBatches([]);
      fetchMentors();
    } catch (error) {
      console.error("Error updating schedule:", error.response?.data?.error || error.message);
      Swal.fire("Error", "Failed to update schedule. Try again.", "error");
    } finally {
      setLoadingSaveChanges(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setMentorName("");
    setRoomNo("");
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setSelectedTechStack("");
    setSelectedSubject("");
    setSelectedBatches([]);
  };

  const fetchMentors = useCallback(async () => {
    setLoadingMentors(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
        { params: { location } }
      );
      setScheduleData(response.data.schedule_data || []);
      setMentors(response.data.mentor_data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch mentors. Please try again.",
      });
    } finally {
      setLoadingMentors(false);
    }
  }, [location]);

  const fetchBatchData = useCallback(async () => {
    setLoadingBatches(true);
    try {
      await fetchBatches(location);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch batches. Please try again.",
      });
    } finally {
      setLoadingBatches(false);
    }
  }, [fetchBatches, location]);

  const fetchData = useCallback(async () => {
    await Promise.all([fetchMentors(), fetchBatchData()]);
  }, [fetchBatchData, fetchMentors]);

  const handleAddBatch = async () => {
    if (
      !startDate ||
      !endDate ||
      !selectedTechStack ||
      !selectedSubject ||
      !startTime ||
      !endTime ||
      !roomNo ||
      !mentorName ||
      !selectedBatches.length
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields before submitting!",
      });
      return;
    }

    const selectedMentor = mentors.find((mentor) => mentor.name === mentorName);
    const mentorId = selectedMentor?.id;
    if (!mentorId) {
      Swal.fire({
        icon: "error",
        title: "Mentor Not Found",
        text: "Please select a valid mentor.",
      });
      return;
    }

    const newBatch = {
      mentorId,
      mentorName,
      startDate,
      endDate,
      startTime: formatTo12Hour(startTime),
      endTime: formatTo12Hour(endTime),
      roomNo,
      techStack: selectedTechStack,
      subject: selectedSubject,
      location,
      batches: selectedBatches.map((batch) => batch.value),
    };

    setLoadingAddSchedule(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
        newBatch
      );
      toast.success(response.data.message);
      toast.success(response.data.mentor_curriculum?.message || "Curriculum updated.");
      fetchBatchData();
      setShowTable(true);
      setMentorName("");
      setStartTime("");
      setEndTime("");
      setStartDate("");
      setEndDate("");
      setRoomNo("");
      setSelectedTechStack("");
      setSelectedSubject("");
      setSelectedBatches([]);
      fetchMentors();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data.error || "Failed to add batch. Please try again.",
      });
    } finally {
      setLoadingAddSchedule(false);
    }
  };

  const filteredBatches = selectedSubject
    ? batches.filter((batch) => mockBatches[selectedSubject]?.includes(batch.Course))
    : [];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedSubject) {
      fetchMentors();
    }
  }, [selectedSubject, fetchMentors]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 mt-0">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Batch Scheduler - KITS
        </h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Batch Details
          </h2>
          <div className="flex items-end gap-4">
            <Dropdown
              label="Tech Stack"
              options={techStackSubjects.KITS || []}
              value={selectedTechStack}
              onChange={handleTechStackChange}
            />
            <Dropdown
              label="Subject"
              options={availableSubjects}
              value={selectedSubject}
              onChange={(value) => setSelectedSubject(value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Schedule Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="batchSelect"
                className="text-gray-700 font-medium mb-2"
              >
                Select Batches
              </label>
              <Select
                id="batchSelect"
                isMulti
                options={filteredBatches.map((batch) => ({
                  value: batch.Batch,
                  label: batch.Batch,
                }))}
                value={selectedBatches}
                onChange={(selectedOptions) =>
                  setSelectedBatches(selectedOptions || [])
                }
                isLoading={loadingBatches}
                placeholder="Select Batches"
              />
            </div>

            <div className="flex flex-col">
              <Dropdown
                label="Mentor Name"
                options={
                  loadingMentors
                    ? ["Loading..."]
                    : mentors
                        .filter((mentor) =>
                          mentor.Designation.includes(selectedSubject)
                        )
                        .map((mentor) => mentor.name)
                }
                value={mentorName}
                onChange={(value) => setMentorName(value)}
              />
            </div>

            <div className="flex flex-col">
              <InputField
                id="roomNumber"
                type="text"
                label="Room Number"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                placeholder="C_Room-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="startTime"
              className="text-gray-700 font-medium mb-2"
            >
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              className="border rounded-lg px-3 py-2"
              value={startTime}
              onChange={(e) => {
                const inputTime = e.target.value;
                setStartTime(inputTime);
                const [hours, minutes] = inputTime.split(":").map(Number);
                const startDateTime = new Date();
                startDateTime.setHours(hours, minutes);
                const endDateTime = new Date(startDateTime.getTime() + 90 * 60000);
                const endHours = String(endDateTime.getHours()).padStart(2, "0");
                const endMinutes = String(endDateTime.getMinutes()).padStart(2, "0");
                setEndTime(`${endHours}:${endMinutes}`);
              }}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endTime" className="text-gray-700 font-medium mb-2">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              className="border rounded-lg px-3 py-2"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="startDate"
              className="text-gray-700 font-medium mb-2"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              className="border rounded-lg px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-gray-700 font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              className="border rounded-lg px-3 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          {editingRowId ? (
            <>
              <button
                onClick={handleSaveEdit}
                className={`block max-w-xs px-6 py-3 font-bold rounded-lg transition duration-300 ${
                  loadingSaveChanges
                    ? "bg-gray-500 cursor-not-allowed text-gray-300"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                disabled={loadingSaveChanges}
              >
                {loadingSaveChanges ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="block max-w-xs px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddBatch}
              className={`block max-w-3xl px-6 py-3 font-bold rounded-lg transition duration-300 ${
                loadingAddSchedule
                  ? "bg-gray-500 cursor-not-allowed text-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={loadingAddSchedule}
            >
              {loadingAddSchedule ? "Loading..." : "Add Schedule"}
            </button>
          )}
        </div>
      </div>
      {showTable && (
        <Table
          data={scheduleData}
          onEditRow={handleEditRow}
        />
      )}
    </div>
  );
};

export default BatchScheduler;