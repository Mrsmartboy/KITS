import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useStudent } from "../contexts/StudentProfileContext";
import { FaCheckCircle, FaBookOpen, FaEdit, FaLock, FaBars, FaTimes } from "react-icons/fa";
import "./SubjectDetails.css";
import MainContent from "./MainContent";

const SubjectDetails = () => {
  const { state } = useLocation();
  const { studentDetails } = useStudent();
  const [curriculum, setCurriculum] = useState([]);
  const [mentorSyllabus, setMentorSyllabus] = useState([]);
  const [filteredCurriculum, setFilteredCurriculum] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const sidebarRef = useRef(null);

  
  

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
  //       setSidebarOpen(false);
  //     }
  //   };

  //   if (sidebarOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [sidebarOpen]);

  useEffect(() => {
    if (state?.subject?.name) {
      fetchCurriculum(state.subject.name);
      fetchMentorSyllabus(state.subject.name);
    }
  }, [state]);

  useEffect(() => {
    // Merge only when both curriculum and mentorSyllabus are updated
    if (curriculum.length > 0 || mentorSyllabus.length > 0) {
      mergeCurriculums(curriculum, mentorSyllabus);
    }
  }, [curriculum, mentorSyllabus]); 

  const fetchCurriculum = async (subject) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`,
        { params: { location: localStorage.getItem("location"), batchNo: studentDetails.BatchNo, subject } }
      );
      const curriculumData = response.data.std_curiculum || [];
      setCurriculum(curriculumData);
      mergeCurriculums(curriculumData, mentorSyllabus);
    } catch (err) {
      setError("Failed to fetch curriculum. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorSyllabus = async (subject) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`,
        { params: { subject, location: localStorage.getItem("location"), batches: studentDetails.BatchNo } }
      );
      
      
      setMentorSyllabus(response.data.curriculum || []);
      mergeCurriculums(curriculum, response.data.curriculum || []);
    } catch (error) {
      console.error("Error fetching mentor syllabus:", error);
    }
  };
  
  const mergeCurriculums = (studentCurriculum, mentorCurriculum) => {
    const studentCurriculumIds = new Set(studentCurriculum.map((item) => item.CurriculumId));
    const combinedSyllabus = [...studentCurriculum];
  
    mentorCurriculum.forEach((mentorTopic) => {
      if (!studentCurriculumIds.has(mentorTopic.id)) {
        combinedSyllabus.push({ ...mentorTopic, locked: true });
      }
    });
  
    const filtered = filterDuplicateSubTopics(combinedSyllabus);
    setFilteredCurriculum(filtered);
  
    // ✅ Auto-select the first unlocked topic after merging
    const firstUnlockedTopic = filtered.find((topic) => !topic.locked);
    if (firstUnlockedTopic) {
      setSelectedTopic(firstUnlockedTopic);
    }
  };


  useEffect(() => {
    if (filteredCurriculum.length > 0) {
      // ✅ Find the first unlocked topic
      const firstUnlockedTopic = filteredCurriculum.find((topic) => !topic.locked);
      if (firstUnlockedTopic) {
        setSelectedTopic(firstUnlockedTopic);
      }
    }
  }, [filteredCurriculum]);
  
  
  
  const filterDuplicateSubTopics = (curriculumData) => {
    const futurePrevSubTopics = new Set();
    const filteredCurriculum = [];
  
    for (let i = curriculumData.length - 1; i >= 0; i--) {
      const item = curriculumData[i];
  
      if (item.PreviousSubTopics?.length > 0) {
        item.PreviousSubTopics.forEach((prev) => {
          if (prev.subTopic) {  // ✅ Ensure subTopic exists before calling trim()
            futurePrevSubTopics.add(prev.subTopic.trim().toLowerCase());
          }
        });
      }
  
      const filteredSubTopics = item.SubTopics.filter(
        (sub) => sub.subTopic && !futurePrevSubTopics.has(sub.subTopic.trim().toLowerCase()) // ✅ Check subTopic exists
      );
  
      filteredCurriculum.unshift({ ...item, SubTopics: filteredSubTopics });
    }
  
    return filteredCurriculum;
  };
  

  return (
    <div className="flex min-h-screen bg-gray-100 relative transition-all duration-500 ease-in-out">
      {/* Sidebar Toggle Button */}
      <button
        className="absolute top-4 left-4 text-white bg-gray-900 p-3 rounded-full text-2xl focus:outline-none hover:bg-gray-800 transition-all duration-500 ease-in-out z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {!sidebarOpen && <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`scrollable-sidebar bg-gray-900 text-white p-6 h-screen flex flex-col transition-all duration-500 ease-in-out shadow-lg rounded-r-2xl ${
          sidebarOpen ? "w-80" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold border-b pb-3 flex-grow text-center">
            {state?.subject?.name} Curriculum
          </h2>
          <button className="text-white text-2xl hover:text-gray-400 focus:outline-none ml-2" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        {/* Syllabus List */}
        <ul className="space-y-3">
  {filteredCurriculum.map((item, index) => {

    return (
      <li
        key={index}
        onClick={() => !item.locked && setSelectedTopic(item)}
        aria-disabled={item.locked} // ✅ Improves accessibility
        className={`flex items-center gap-3 p-3 rounded-lg transition shadow-md 
          ${item.locked ? "bg-gray-700 cursor-not-allowed opacity-50" : ""}
          ${selectedTopic?.Topics === item.Topics ? "bg-indigo-700" : "bg-gray-800 hover:bg-gray-700 cursor-pointer"}
        `}
      >
        {/* Icon for Locked/Unlocked */}
        {item.locked ? (
          <FaLock className="text-red-400" />
        ) : (
          <FaCheckCircle className="text-green-400" />
        )}

        {/* Type Icon (if available) */}
        {item.type === "video" && <FaBookOpen className="text-blue-400" />}
        {item.type === "practice" && <FaEdit className="text-yellow-400" />}

        {/* Topic Name and Duration */}
        <div>
          <p className="text-md font-medium text-white">{item.Topics}</p>
          {item.duration && <p className="text-sm text-gray-300">{item.duration}</p>}
        </div>
      </li>

    );
  })}
        </ul>

      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto">
        <MainContent selectedContent={selectedTopic} curriculumData={filteredCurriculum} />
      </div>
    </div>
  );
};

export default SubjectDetails; 
