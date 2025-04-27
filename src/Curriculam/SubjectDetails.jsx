/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useStudent } from "../contexts/StudentProfileContext";
import {
  FaCheckCircle,
  FaBookOpen,
  FaLock,

  FaArrowLeft,
} from "react-icons/fa";

import "sweetalert2/dist/sweetalert2.min.css";
import "./SubjectDetails.css";
import { decryptData } from "../../cryptoUtils.jsx";

const SubjectDetails = () => {
  const { state } = useLocation();
  const { studentDetails } = useStudent();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (state?.subject?.name) {
      fetchCurriculum(state.subject.name);
    }
  }, [state]);

  const fetchCurriculum = async (subject) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`,
        {
          params: {
            location: decryptData(sessionStorage.getItem("location")),
            batchNo: studentDetails.BatchNo,
            subject,
          },
        }
      );
      const curriculumData = response.data.std_curiculum || [];
      const curriculumTable = curriculumData
        .map((item) => {
          const topics = Object.values(item.curriculumTable);
          return topics.map((topic) => {
            topic.SubTopics = topic.SubTopics.map((sub) => ({
              ...sub,
              locked: sub.status === "false",
            }));
            topic.locked = topic.SubTopics.some((sub) => sub.locked);
            topic.videoUrl = topic.videoUrl || "";
            return topic;
          });
        })
        .flat();
      setCurriculum(curriculumTable);

      if (!selectedTopic) {
        const firstCompletedTopic = curriculumTable.find(
          (topic) => !topic.locked && topic.videoUrl
        );
        if (firstCompletedTopic) {
          setSelectedTopic(firstCompletedTopic);
        }
      }
    } catch (err) {
      console.error("Failed to fetch curriculum:", err);
    }
  };

  const getEmbedUrl = (videoUrl) => {
    try {
      const url = new URL(videoUrl);
      if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${url.searchParams.get(
          "v"
        )}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
      }
      if (url.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${url.pathname.slice(
          1
        )}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
      }
      if (url.hostname.includes("drive.google.com")) {
        const fileId = url.pathname.split("/d/")[1]?.split("/")[0];
        return fileId
          ? `https://drive.google.com/file/d/${fileId}/preview?modestbranding=1&rel=0&showinfo=0&fs=0`
          : videoUrl;
      }
      return videoUrl;
    } catch (error) {
      console.error("Invalid video URL:", videoUrl);
      return "";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleKeyDown = (event, item) => {
    if (event.key === "Enter" && !item.locked) {
      setSelectedTopic(item);
    }
  };

  const videoUrls = Array.isArray(selectedTopic?.videoUrl)
    ? selectedTopic.videoUrl
    : [selectedTopic?.videoUrl];

  return (
    <>
      <div className="flex items-center mt-2 gap-4 p-4  ">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center justify-center gap-2 px-3 py-2 text-white bg-[#0C1BAA] rounded-md shadow-md "
        >
          <FaArrowLeft className="text-md" />
        </button>
        <h2 className="text-[#0C1BAA] font-[inter] text-md font-semibold">
          {state?.subject?.name} Curriculum
        </h2>
      </div>
      <hr className="border-b-0 ml-10 mr-5 border mt-5 mb-3 border-black " />

      <div className="flex bg-gray-100 relative transition-all duration-500 ease-in-out mt-14">
        {!sidebarOpen && (
          <button
            className="absolute -top-12  left-4 mr-10 text-white bg-[#19216F] p-3  rounded-md text-2xl focus:outline-none hover:bg-gray-800 transition-all duration-500 ease-in-out z-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <img src="/icon.svg" alt="Menu Icon" />
          </button>
        )}

        <div
          ref={sidebarRef}
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
          className={`scrollable-sidebar ml-10 mt-1 mb-1 fixed lg:relative bg-[#E1EFFF] text-white max-h-[520px] flex flex-col transition-all duration-500 ease-in-out rounded-r-2xl 
            ${
              sidebarOpen
                ? "w-80 h-[520px] overflow-y-auto p-4"
                : "w-20 h-[520px] opacity-0 overflow-hidden"
            }`}
        >
          <ul className="space-y-3 ">
            {curriculum.map((item, index) => (
              <React.Fragment key={index}>
                <li
                  key={index}
                  onClick={() => !item.locked && setSelectedTopic(item)}
                  onKeyDown={(event) => handleKeyDown(event, item)}
                  tabIndex={0}
                  aria-disabled={item.locked}
                  className={`flex items-center gap-3 p-3 rounded-lg transition group
                ${
                  item.locked
                    ? "bg-gray-300 hover:bg-[#0C1BAA] text-black cursor-not-allowed opacity-50 "
                    : "bg-[#E1EFFF] hover:bg-[#0C1BAA] text-black hover:text-white cursor-pointer"
                }`}
                >
                  {item.locked ? (
                    <FaLock className="text-red-400" />
                  ) : (
                    <FaCheckCircle className="text-green-400" />
                  )}
                  {item.type === "video" && (
                    <FaBookOpen className="text-blue-400" />
                  )}
                  {item.type === "practice" && (
                    <FaEdit className="text-yellow-400" />
                  )}

                  <div>
                    <p className="text-md font-[inter] text-inherit group-hover:text-white ">
                      {item.Topics}
                    </p>
                    {item.duration && (
                      <p className="text-sm text-gray-500 group-hover:text-gray-200">
                        {item.duration}
                      </p>
                    )}
                  </div>
                </li>

                <hr className="size-0 mt-2 ml-0 grow border-[1px] w-[280px] border-[#0C1BAA]" />
              </React.Fragment>
            ))}
          </ul>
        </div>

        <div
          className={`flex-1 max-h-screen overflow-y-auto pl-5  transition-all -mt-16 duration-500 
              ${sidebarOpen ? "lg:ml-[10px]" : "lg:ml-0"}`}
        >
          <h1 className="text-2xl lg:text-2xl font-bold lg:ml-0 ml-10 text-[#19216F] mb-6 text-center md:text-left mt-4">
            {selectedTopic?.Topics || "Select a Topic"}
          </h1>

          <div className="bg-[#F5F5F5]">
            <div className="flex w-[100%]  h-[720px] gap-2 md:gap-10 lg:gap-4 flex-col pr-5 md:flex-col lg:flex-row">
              <div className="w-full md:w-full lg:flex-1  rounded-md overflow-hidden">
                {videoUrls[0] ? (
                  <div className="flex flex-col gap-4">
                    {videoUrls.map((url, idx) => (
                      <iframe
                        key={idx}
                        className="w-full h-[240px] md:h-[380px] lg:h-[420px] xl:h-[520px] aspect-video rounded-md"
                        src={getEmbedUrl(url)}
                        title={`Video ${idx + 1}`}
                        frameBorder="0"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-forms"
                      ></iframe>
                    ))}
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center bg-white/20 rounded-lg animate-fadeIn py-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-16 h-16 text-indigo-500 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m9-9a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h2 className="text-2xl font-bold text-indigo-600 mt-4">
                      Coming Soon!
                    </h2>
                    <p className="text-gray-600 mt-2 text-center max-w-md">
                      We're working hard to bring you this content. Stay tuned!
                    </p>
                  </div>
                )}
              </div>
              <div className="w-full md:w-full lg:w-[381px] lg:h-[520px] rounded-md flex flex-col ">
                <div className="bg-[#0C1BAA] text-white text-center font-[inter] py-4 rounded-t-md text-lg">
                  Subtopics Covered
                </div>
                <div className="p-5 flex-1 overflow-hidden scrollable-sidebar bg-white">
                  <ul className="space-y-3 text-black font-[inter] text-[16px] leading-[19px]">
                    {selectedTopic?.SubTopics?.map((sub, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-700 text-lg mr-2 flex justify-center items-center font-bold">
                          •
                        </span>{" "}
                        {sub.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectDetails;