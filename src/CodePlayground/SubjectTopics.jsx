import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudent } from '../contexts/StudentProfileContext';
import axios from "axios";
import { FaChevronDown, FaCheck } from "react-icons/fa";

const SubjectTopicsWithSubTopics = () => {
  const { subjectname, topicname } = useParams();
  const { studentDetails } = useStudent();
  const navigate = useNavigate();

  const [curriculumData, setCurriculumData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(subjectname || "");
  const [openTopics, setOpenTopics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch curriculum data
  const fetchCurriculum = async () => {
    if (!studentDetails?.location || !studentDetails?.BatchNo) {
      setError('Location or Batch Number not available.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`,
        {
          params: {
            location: studentDetails.location,
            batchNo: studentDetails.BatchNo,
            subject: subjectname,
          },
        }
      );
      const curriculum = response.data.std_curiculum || [];

      // Transform curriculum data into a format suitable for display
      const transformedData = curriculum[0]
        ? Object.values(curriculum[0].curriculumTable).map((item, index) => ({
            subject: subjectname,
            Topics: item.Topics,
            SubTopics: item.SubTopics.map((sub) => ({
              title: sub.title,
              tag: sub.tag,
              status: sub.status,
            })),
          }))
        : [];

      setCurriculumData(transformedData);
    } catch (error) {
      console.error('Curriculum API call failed:', error);
      setError(`Failed to fetch curriculum for ${subjectname}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [subjectname, studentDetails]);

  // Set default selectedSubject
  const subjects = [...new Set(curriculumData.map((item) => item.subject))];
  useEffect(() => {
    if (subjects.length > 0 && !subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Handlers
  const handleSubjectChange = useCallback((event) => {
    setSelectedSubject(event.target.value);
    setOpenTopics({});
  }, []);

  const toggleTopic = useCallback((topic) => {
    setOpenTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));
  }, []);

  const handleSubTopicClick = useCallback((subject, topic, subtopic) => {
    const encodedTopic = encodeURIComponent(
      topic.toLowerCase().replace(/[\s,]+/g, '-')
    );
    const encodedSubTopic = encodeURIComponent(
      subtopic.title.toLowerCase().replace(/\s+/g, '-')
    );
    navigate(`/codepractice/${subject}/${encodedTopic}/${encodedSubTopic}`, {
      state: { tag: subtopic.tag, subjectname: subject, topicname: encodedTopic, subtopic: encodedSubTopic },
    });
  }, [navigate]);

  const handleBackToTopics = () => {
    navigate(`/codepractice/${subjectname}`);
  };

  // Filter curriculum by selected subject
  const filteredCurriculum = curriculumData.filter(
    (item) => item.subject === selectedSubject
  );

  // If topicname is provided, filter to show only subtopics for that topic
  const displayData = topicname
    ? filteredCurriculum.filter((item) => {
        const decodedTopicName = decodeURIComponent(topicname)
          .replace(/-/g, ' ')
          .toLowerCase();
        const normalizedTopic = item.Topics.toLowerCase().replace(/[\s,]+/g, ' ');
        return normalizedTopic === decodedTopicName;
      })
    : filteredCurriculum;

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-[53px] bg-gray-200 rounded" />
      ))}
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen flex flex-col">
      <div className="w-11/12 py-10 px-4 mx-auto pt-5 font-[inter] flex flex-col flex-grow">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {subjects.length > 1 ? (
            <div className="flex flex-row items-center gap-4">
              <label
                htmlFor="subject-filter"
                className="mb-1 font-medium text-[16px] text-[#000000]"
              >
                Filter by Subject
              </label>
              <div className="relative w-[229px] h-[46px]">
                <select
                  id="subject-filter"
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  className="border-[2px] border-[#EDEFFF] rounded-[8px] text-[16px] text-[#000000] px-4 pr-10 w-full h-full shadow-[0px_4px_17px_rgba(19,_46,_224,_0.2)] bg-white appearance-none focus:ring-2 focus:ring-[#19216F]"
                  aria-label="Select subject"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <FaChevronDown
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black"
                  size={16}
                />
              </div>
            </div>
          ) : (
            <h2 className="text-[18px] font-medium text-[#000000]">
              Subject: {subjects[0] || "Loading..."}
            </h2>
          )}
          {topicname && (
            <button
              onClick={handleBackToTopics}
              className="flex items-center gap-2 bg-[#19216F] text-white h-[46px] px-4 rounded-md hover:bg-[#151b5a] transition-colors"
              aria-label="Back to topics"
            >
              Back to Topics
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
            <button
              onClick={fetchCurriculum}
              className="ml-4 underline text-red-700 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Accordion Section */}
        <div className="w-full mx-auto mt-10 shadow-[0px_4px_20px_#B3BAF7]">
          {loading ? (
            <SkeletonLoader />
          ) : displayData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {subjects.length === 0
                ? "No curriculum data available."
                : `No curriculum data available for ${selectedSubject}.`}
            </div>
          ) : (
            displayData.map((item, index) => (
              <div key={index} className="shadow-2xl mb-1">
                <button
                  onClick={() => toggleTopic(item.Topics)}
                  className="flex items-center justify-between border bg-[#161A85] h-[53px] text-white px-4 w-full text-left"
                  aria-expanded={openTopics[item.Topics]}
                  aria-controls={`topic-content-${item.Topics}`}
                >
                  <span className="text-[16px]">{item.Topics}</span>
                  <FaChevronDown
                    className={`transition-transform duration-300 ${
                      openTopics[item.Topics] ? "rotate-0" : "-rotate-90"
                    }`}
                    size={16}
                  />
                </button>

                <div
                  id={`topic-content-${item.Topics}`}
                  className={`transition-all duration-300 overflow-hidden ${
                    openTopics[item.Topics] ? "max-h-[1000px]" : "max-h-0"
                  }`}
                >
                  <div className="border border-t-0 border-[#EFF0F7]">
                    <table className="table-auto w-full">
                      <thead>
                        <tr className="border border-black bg-[#FFDFDF] h-[53px]">
                          <th className="text-left px-4 py-2 text-[16px] border-r border-b-2 border-[#000]">
                            Subtopics
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border border-black">
                          <td className="px-4 py-4">
                            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#19216F] scrollbar-track-[#EDEFFF]">
                              <ul className="space-y-5">
                                {Array.isArray(item.SubTopics) && item.SubTopics.length > 0 ? (
                                  item.SubTopics.map((subtopic, subIndex) => (
                                    <li
                                      key={subIndex}
                                      className="flex items-center space-x-2"
                                    >
                                      <button
                                        onClick={() =>
                                          handleSubTopicClick(
                                            item.subject,
                                            item.Topics,
                                            subtopic
                                          )
                                        }
                                        className="bg-[#19216F] text-white w-6 h-6 flex items-center justify-center text-sm hover:bg-[#151b5a] transition-colors"
                                        aria-label={`Select subtopic ${subIndex + 1}`}
                                      >
                                        {subIndex + 1}
                                      </button>
                                      <span
                                        className={`text-[16px] flex items-center gap-2 ${
                                          subtopic.status === "true"
                                            ? "text-green-600"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {subtopic.title || "N/A"}
                                        {subtopic.status === "true" && (
                                          <FaCheck
                                            className="text-green-600"
                                            size={14}
                                            title="Completed"
                                          />
                                        )}
                                      </span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-[16px]">N/A</li>
                                )}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectTopicsWithSubTopics;