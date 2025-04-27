import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import { useStudentsMentorData } from "../contexts/MentorStudentsContext";
import './CurriculumTable.css';
import { decryptData } from '../../cryptoUtils.jsx';


const CurriculumTable = ({
  subject,
  batches,
  mentorData,
  classes,
  fetchMentorStudents,
  syllabus,
}) => {
  // const { classes, fetchMentorStudents } = useStudentsMentorData();
  const [curriculumData, setCurriculumData] = useState([]);
  const [checkedSubTopics, setCheckedSubTopics] = useState({});
  const [submittedCurriculumIds, setSubmittedCurriculumIds] = useState(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const location = decryptData(localStorage.getItem("location"));
  const mentorId = mentorData?.id;
  const mentorName = mentorData?.name;

  const fetchSyllabus = async () => {
    try {
      // const syllabusRes = await axios.get(
      //   `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`,
      //   { params: { subject, location, batches } }
      // );
      const syllabusData = syllabus || [];
      const updatedSyllabus = syllabusData.map((item) => {
        const matchedClass = classes.find(
          (cls) => cls.CurriculumId === item.id
        );
        const completedSubTopics = matchedClass?.SubTopics || [];

        // Create an object that tracks subtopic completion status
        const subTopicsStatus = {};
        item.SubTopics.forEach((subTopic) => {
          const completed = completedSubTopics.find(
            (sub) => sub.subTopic === subTopic
          );
          subTopicsStatus[subTopic] = completed?.status || false;
        });

        return {
          ...item,
          videoUrl: matchedClass?.VideoUrl || "",
          locked: matchedClass ? true : false,
          subTopicsStatus,
        };
      });

      setCurriculumData(updatedSyllabus);
      setSubmittedCurriculumIds(
        new Set(classes.map((cls) => cls.CurriculumId))
      );
    } catch (error) {
      console.error("Error fetching syllabus:", error);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, [classes, subject, location, batches]);

  // Handle checkbox change for subtopics
  const handleCheckboxChange = (dayOrder, subTopic) => {
    setCheckedSubTopics((prev) => ({
      ...prev,
      [dayOrder]: {
        ...prev[dayOrder],
        [subTopic]: !prev[dayOrder]?.[subTopic],
      },
    }));
  };

  const isValidVideoUrl = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
    const driveRegex = /^(https?:\/\/)?(drive\.google\.com\/)/;
    return youtubeRegex.test(url) || driveRegex.test(url);
  };

  // Utility function to wait for a given ms
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let idCounter = 1;

      // This object tracks the highest subtopic IDs per CurriculumId.
      const idCounters = {};

      // Helper to get the next incremental ID for a given CurriculumId
      const getNextId = (curriculumId) => {
        if (!idCounters[curriculumId]) {
          const matchedClass = classes.find(
            (cls) => cls.CurriculumId === curriculumId
          );

          if (
            !matchedClass ||
            !matchedClass.SubTopics ||
            matchedClass.SubTopics.length === 0
          ) {
            idCounters[curriculumId] = 1; // Start from 1 if no subtopics exist
          } else {
            // Extract numerical parts only to avoid NaN issues
            const validIds = matchedClass.SubTopics.map((sub) =>
              parseInt(sub.Id.split(":")[1])
            ) // Extract number part
              .filter((num) => !isNaN(num)); // Remove NaN values

            const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;

            idCounters[curriculumId] = maxId + 1;
          }
        }

        return idCounters[curriculumId]++;
      };

      // Validate all video URLs before submission
      for (const item of curriculumData) {
        // Convert to string if necessary or check if it's a string
        const videoUrl = typeof item.videoUrl === 'string' ? item.videoUrl : '';
      
        if (videoUrl.trim() && !isValidVideoUrl(videoUrl.trim())) {
          Swal.fire({
            title: "Invalid Video URL",
            text: "Please enter a valid YouTube or Google Drive link.",
            icon: "error",
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }
      }
      

      // Build final payload for all new (unsubmitted) DayOrders
      const payloads = curriculumData
        .filter((item) => !submittedCurriculumIds.has(item.id))
        .map((item) => {
          // Gather newly ticked subtopics for the current day
          const selectedSubTopics = Object.entries(
            checkedSubTopics[item.DayOrder] || {}
          )
            .filter(([_, status]) => status)
            .map(([subTopic]) => ({
              subTopic,
              status: true,
              Id: `${item.DayOrder}:${idCounter++}`, // Auto-increment for today’s subtopics
            }));

          // Gather newly ticked subtopics from previous days
          const previousSubTopics = curriculumData
            .filter((prevItem) => {
              return prevItem.DayOrder < item.DayOrder;
            }) // Only previous days
            .flatMap((prevItem) => {
              return Object.entries(checkedSubTopics[prevItem.DayOrder] || {})
                .filter(([subTopic, status]) => {
                  return status && !prevItem.subTopicsStatus[subTopic]; // Exclude already submitted ones
                })
                .map(([subTopic]) => {
                  return {
                    subTopic,
                    status: true,
                    Id: `${prevItem.DayOrder}:${getNextId(prevItem.id)}`, // Get next available Id from classes
                    dayOrder: prevItem.DayOrder, // Store reference to correct DayOrder
                    curriculumId: prevItem.id, // Store Curriculum ID for updating
                  };
                });
            });

          if (selectedSubTopics.length === 0 || item.videoUrl.trim() === "")
            return null;

          return {
            subject,
            batches,
            dayOrder: item.DayOrder,
            topic: item.Topics,
            subTopics: selectedSubTopics,
            previousSubTopics,
            videoUrl: item.videoUrl.trim(),
            location,
            mentorId,
            mentorName,
            curriculumId: item.id,
          };
        })
        .filter((item) => item !== null);

      // Check if there's anything to submit
      if (payloads.length === 0) {
        Swal.fire({
          title: "No Changes",
          text: "Please check subtopics and enter a valid video URL before submitting.",
          icon: "info",
          confirmButtonText: "OK",
        });
        setLoading(false);
        return;
      }

      // ------------------------------------------------------------------
      // For each new day in payloads:
      // 1) POST new day
      // 2) PUT for each previousSubTopic
      // 3) Wait 3 seconds
      // 4) POST store-daily-exam-tags
      // ------------------------------------------------------------------
      for (const payload of payloads) {
        // 1) Submit today's new day
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`,
          payload
        );

        // 2) Update subtopics for previous days
        for (const prevSub of payload.previousSubTopics) {
          const updateData = {
            location,
            DayOrder: prevSub.dayOrder,
            CurriculumId: prevSub.curriculumId,
            batch: batches,
            SubTopics: [
              {
                subTopic: prevSub.subTopic,
                status: true,
                Id: prevSub.Id,
              },
            ],
          };

          await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`,
            updateData
          );
        }

        // 3) Delay 3 seconds before the daily exam tags
        await delay(3000);

        // 4) Store daily exam tags only after the POST + PUTs succeed
        const dailyExamPayload = {
          dayOrder: payload.dayOrder,
          mentorId,
          subject,
          batch: batches,
        };

        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/store-daily-exam-tags`,
          dailyExamPayload
        );
      }

      // Re-fetch data after all requests are successful
      await fetchMentorStudents(batches);

      Swal.fire({
        title: "Success",
        text: "Curriculum submitted and Selected Topics are going for Daily Exam!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error submitting curriculum:", error);
      // Determine the error message based on the error object structure
      const errorMessage = error.response && error.response.data && error.response.data.error
        ? error.response.data.error
        : "An unexpected error occurred. Please try again.";
    
      Swal.fire({
        title: "Warning",
        text: errorMessage,
        icon: "warning",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for Video URL
  const handleUpdate = (index, field, value) => {
    setCurriculumData((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  return (
    <div className="bg-white w-full max-w-[1200px] h-auto  p-6 pt-0 flex flex-col justify-center">
      {/* Table Section with Drop Shadow on Wrapper */}
      {curriculumData.length > 0 ? (
      <div className="max-h-[500px] overflow-y-auto scrollbar-custom">
          {/* Scrollable Table with Custom Scrollbar */}
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#0C1BAA] scrollbar-track-[#F5F5F5]">
          <table className="w-full border-collapse">
  <thead className="sticky top-0 bg-[#0C1BAA] text-white text-left text-[16px] font-medium">
    <tr>
      <th className="px-6 py-4 w-[10%] text-center">Day Order</th>
      <th className="px-6 py-4 w-[15%] text-center">Topic</th>
      <th className="px-6 py-4 w-[35%] text-center">Topics to Cover</th>
      <th className="px-6 py-4 w-[40%] text-center">Video URL</th>
    </tr>
  </thead>
  <tbody>
    {curriculumData.map((item, index) => (
      <tr key={index} className={`${index % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"} text-black`}>
        <td className="px-6 py-4 w-[10%]">{item.DayOrder}</td>
        <td className="px-6 py-4 w-[15%]">{item.Topics}</td>
        <td className="px-6 py-4 w-[35%]">
          <ul className="list-none space-y-1">
            {item.SubTopics.map((subTopic, subIndex) => (
              <li key={subIndex} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={item.subTopicsStatus[subTopic] || checkedSubTopics[item.DayOrder]?.[subTopic] || false}
                  onChange={() => handleCheckboxChange(item.DayOrder, subTopic)}
                  disabled={item.subTopicsStatus[subTopic]}
                />
                {subTopic}
              </li>
            ))}
          </ul>
        </td>
        <td className="px-6 py-4 w-[40%] break-words">
          {item.locked ? (
            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
              {item.videoUrl}
            </a>
          ) : (
            <input
              type="text"
              value={item.videoUrl}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter URL..."
              onChange={(e) => handleUpdate(index, "videoUrl", e.target.value)}
            />
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

          </div>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-500 mt-6">
          No syllabus data available.
        </p>
      )}

      {/* Submit Button Section */}
      {curriculumData.length > 0 && (
        <div className="flex justify-end mt-8">
          <button
            className={`w-[196px] h-[40px] text-white text-lg font-semibold rounded-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0C1BAA] hover:bg-blue-900"
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CurriculumTable;
