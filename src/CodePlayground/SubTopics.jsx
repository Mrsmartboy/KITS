import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudent } from '../contexts/StudentProfileContext';
import axios from 'axios';

const SubTopicCard = ({ subTopic, subjectname, topicname }) => {
  const navigate = useNavigate();
  // Normalize subtopic title for URL: lowercase, replace spaces with hyphens
  const encodedSubTopic = encodeURIComponent(
    subTopic.title.toLowerCase().replace(/\s+/g, '-')
  );

  return (
    <div
      className="bg-white rounded-lg p-4 m-2 w-80 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() =>
        navigate(`/code-playground/${subjectname}/${topicname}/${encodedSubTopic}`, {
          state: { tag: subTopic.tag },
        })
      }
    >
      <h3 className="text-md font-medium text-gray-700">{subTopic.title}</h3>
      <div className="flex justify-between mt-2">
        <span
          className={`text-sm ${subTopic.status === 'true' ? 'text-green-600' : 'text-red-600'}`}
        >
          {subTopic.status === 'true' ? 'Completed' : 'Not Completed'}
        </span>
        <span className="text-sm text-gray-500">{subTopic.tag}</span>
      </div>
    </div>
  );
};

const SubTopics = () => {
  const { subjectname, topicname } = useParams();
  const { studentDetails } = useStudent();
  const [subTopics, setSubTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurriculum = async () => {
      if (!studentDetails?.location || !studentDetails?.BatchNo) {
        setError('Location or Batch Number not available.');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`,
          {
            params: {
              location: studentDetails.location,
              batchNo: studentDetails.BatchNo,
              subject: subjectname,
            },
          }
        );
        const curriculum = response.data.std_curiculum || [];
        if (curriculum[0]) {
          const decodedTopicName = decodeURIComponent(topicname)
            .replace(/-/g, ' ')
            .toLowerCase();
          const topic = Object.values(curriculum[0].curriculumTable).find((item) => {
            const normalizedTopic = item.Topics.toLowerCase().replace(/[\s,]+/g, ' ');
            return normalizedTopic === decodedTopicName;
          });

          if (topic) {
            setSubTopics(topic.SubTopics);
          } else {
            setSubTopics([]);
          }
        } else {
          setSubTopics([]);
        }
      } catch (error) {
        console.error('Curriculum API call failed:', error);
        setError(`Failed to fetch subtopics for ${subjectname}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [subjectname, topicname, studentDetails]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {decodeURIComponent(topicname).replace(/-/g, ' ')} Subtopics
        </h1>
        <button
          onClick={() => navigate(`/code-playground/${subjectname}`)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Back to Topics
        </button>
      </div>
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {subTopics.length > 0 ? (
        <div className="w-full max-w-4xl flex flex-wrap justify-center gap-4">
          {subTopics.map((subTopic, index) => (
            <SubTopicCard
              key={index}
              subTopic={subTopic}
              subjectname={subjectname}
              topicname={topicname}
            />
          ))}
        </div>
      ) : (
        !loading && !error && <p className="text-gray-600">No subtopics available.</p>
      )}
    </div>
  );
};

export default SubTopics;