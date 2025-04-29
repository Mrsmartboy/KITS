import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudent } from '../contexts/StudentProfileContext';
import axios from 'axios';

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
        navigate(-1);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`, {
          params: {
            location: studentDetails.location,
            batchNo: studentDetails.BatchNo,
            subject: subjectname,
          },
        });
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

  // Map subTopics to the format expected by the new UI
  const rows = subTopics.map((subTopic, index) => ({
    sno: String(index + 1).padStart(3, '0'), // e.g., "001"
    question: subTopic.title,
    difficulty: subTopic.tag || 'Medium', // Use tag as difficulty or default to 'Medium'
    testPassed: subTopic.status === 'true' ? 4 : 2, // Mock data: completed = 4/4, else 2/4
    testTotal: 4,
    scorePassed: subTopic.status === 'true' ? 10 : 6, // Mock data: completed = 10/10, else 6/10
    scoreTotal: 10,
    status: subTopic.status === 'true' ? 'Solved' : 'In progress',
  }));

  const colStyle = { gridTemplateColumns: '5% 30% 10% 20% 20% 10%' };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8 font-[Inter]">
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
        <div className="w-full max-w-4xl">
          {/* Table on md+ */}
          <div
            className="hidden md:block w-full bg-white rounded-sm"
            style={{ boxShadow: '0px 5px 21px rgba(0,73,198,0.2)' }}
          >
            {/* Header */}
            <div
              className="grid text-white font-semibold text-[15px] leading-[19px] rounded-t-md bg-[#19216F]"
              style={colStyle}
            >
              <div className="py-3 px-4">S/No</div>
              <div className="py-3 px-4">Question</div>
              <div className="py-3 px-4">Difficulty</div>
              <div className="py-3 px-4">Test Cases</div>
              <div className="py-3 px-4">Score</div>
              <div className="py-3 px-4">Status</div>
            </div>

            {/* Rows */}
            {rows.map((row, idx) => {
              const encodedSubTopic = encodeURIComponent(
                row.question.toLowerCase().replace(/\s+/g, '-')
              );
              return (
                <div
                  key={row.sno}
                  className={`grid text-[15px] leading-[19px] cursor-pointer ${
                    idx % 2 === 0 ? 'bg-[#EEEFFF]' : 'bg-white'
                  }`}
                  style={colStyle}
                  onClick={() =>
                    navigate(`/code-playground/${subjectname}/${topicname}/${encodedSubTopic}`, {
                      state: { tag: subTopics[idx].tag },
                    })
                  }
                >
                  <div className="py-3 px-4 font-medium">{row.sno}</div>
                  <div className="py-3 px-4">{row.question}</div>
                  <div className="py-3 px-4">{row.difficulty}</div>
                  <div className="py-3 px-4">
                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#2333CB]"
                        style={{
                          width: `${(row.testPassed / row.testTotal) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 font-semibold text-[12px] leading-[15px] text-[#19216F]">
                      {row.testPassed}/{row.testTotal}
                    </div>
                  </div>
                  <div className="py-3 px-4">
                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#2333CB]"
                        style={{
                          width: `${(row.scorePassed / row.scoreTotal) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 font-semibold text-[10px] leading-[12px] text-[#19216F]">
                      {row.scorePassed}/{row.scoreTotal}
                    </div>
                  </div>
                  <div className="py-3 px-4">{row.status}</div>
                </div>
              );
            })}
          </div>

          {/* Cards on <md */}
          <div className="md:hidden flex flex-col space-y-4">
            {rows.map((row) => {
              const encodedSubTopic = encodeURIComponent(
                row.question.toLowerCase().replace(/\s+/g, '-')
              );
              return (
                <div
                  key={row.sno}
                  className="bg-white rounded-sm p-4 cursor-pointer"
                  style={{ boxShadow: '0px 5px 21px rgba(0,73,198,0.2)' }}
                  onClick={() =>
                    navigate(`/code-playground/${subjectname}/${topicname}/${encodedSubTopic}`, {
                      state: { tag: subTopics[rows.indexOf(row)].tag },
                    })
                  }
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-[15px]">#{row.sno}</span>
                    <span className="text-[12px] font-semibold text-[#19216F]">
                      {row.status}
                    </span>
                  </div>
                  <div className="mb-2 text-[15px]">{row.question}</div>
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <span className="bg-[#EEEFFF] px-2 py-1 rounded text-[12px]">
                      {row.difficulty}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="text-[12px] font-semibold mb-1">
                      Test Cases Passed
                    </div>
                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#2333CB]"
                        style={{
                          width: `${(row.testPassed / row.testTotal) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-[10px]">{row.testPassed}/{row.testTotal}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold mb-1">Score</div>
                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#2333CB]"
                        style={{
                          width: `${(row.scorePassed / row.scoreTotal) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-[10px]">{row.scorePassed}/{row.scoreTotal}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        !loading && !error && <p className="text-gray-600">No subtopics available.</p>
      )}
    </div>
  );
};

export default SubTopics;