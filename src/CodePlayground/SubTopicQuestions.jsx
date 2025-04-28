import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SubTopicQuestions = () => {
  const { subjectname, topicname, subtopic } = useParams();
  const { state } = useLocation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!state?.tag) {
        setError('No tag provided for questions.');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
           `${import.meta.env.VITE_BACKEND_URL}/api/v1/get-cpquestions`,
          {
            params: {
              subject: subjectname,
              tags: state.tag,
            },
          }
        );
        if (response.data.success) {
          setQuestions(response.data.codeQuestions || []);
        } else {
          setQuestions([]);
          setError(`No questions found for tag ${state.tag}`);
        }
      } catch (error) {
        console.error('Questions API call failed:', error);
        setError('Failed to fetch questions');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subjectname, state]);

  // Mock user progress (since API doesn't provide this)
  const getMockProgress = (question) => {
    const totalTestCases = question.Hidden_Test_Cases?.length || 4;
    const passedTestCases = Math.min(totalTestCases, Math.floor(Math.random() * (totalTestCases + 1)));
    const totalScore = question.Score * totalTestCases;
    const latestScore = passedTestCases * question.Score;
    const status = passedTestCases === totalTestCases ? 'SOLVED' : 'IN PROGRESS';

    return {
      testCasesPassed: `${passedTestCases}/${totalTestCases}`,
      testCasesPercent: (passedTestCases / totalTestCases) * 100,
      score: `${latestScore}/${totalScore}`,
      scorePercent: (latestScore / totalScore) * 100,
      status,
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {decodeURIComponent(subtopic).replace(/-/g, ' ')} Questions
        </h1>
        <button
          onClick={() => navigate(`/codepractice/${subjectname}/${topicname}`)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Back to Subtopics
        </button>
      </div>
      {loading && <p className="text-gray-600">Loading questions...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {questions.length > 0 ? (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-sm uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Question</th>
                <th className="py-3 px-4 text-left">Difficulty</th>
                <th className="py-3 px-4 text-left">Test Cases Passed</th>
                <th className="py-3 px-4 text-left">Score</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => {
                const { testCasesPassed, testCasesPercent, score, scorePercent, status } =
                  getMockProgress(question);
                return (
                  <tr
                    key={question.questionId}
                    className={`border-b cursor-pointer hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                    onClick={() =>
                      navigate(`/codepractice/solve/${question.questionId}`, {
                        state: {
                          question,
                          index,
                          questions: questions,
                          codeMap: { [index]: '' }, // Initialize empty code
                        },
                      })
                    }
                  >
                    <td className="py-4 px-4 text-gray-800">{question.Question}</td>
                    <td className="py-4 px-4 text-gray-600">{question.Difficulty}</td>
                    <td className="py-4 px-4">
                      <div className="text-gray-600">{testCasesPassed}</div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${testCasesPercent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Latest Attempt: {testCasesPassed}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-600">{score}</div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${scorePercent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Latest Score: {score}</div>
                    </td>
                    <td className="py-4 px-4 flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          status === 'SOLVED' ? 'text-green-600' : 'text-yellow-600'
                        }`}
                      >
                        {status}
                      </span>
                      <svg
                        className="w-5 h-5 text-blue-500 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && !error && <p className="text-gray-600">No questions available.</p>
      )}
    </div>
  );
};

export default SubTopicQuestions;