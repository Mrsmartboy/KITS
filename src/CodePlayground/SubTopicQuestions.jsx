import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { decryptData } from "../../cryptoUtils";

const SubTopicQuestions = () => {
  const { subjectname, topicname, subtopic } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [progressMap, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const studentId = decryptData(sessionStorage.getItem("id"));

  useEffect(() => {
    const fetchQuestionsAndProgress = async () => {
      if (!state?.tag) {
        setError("No tag provided for questions.");
        navigate(-1)
        return;
      }
      setLoading(true);
      try {
        const [cpResponse, studentCpResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/get-cpquestions`,
            {
              params: { subject: subjectname, tags: state.tag },
            }
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/cp-progress`, {
            params: { subject: subjectname, tags: state.tag, studentId },
            validateStatus: (s) => s < 400 || s === 404,
          }),
        ]);

        const cpQuestions = cpResponse.data.success
          ? cpResponse.data.codeQuestions || []
          : [];
        const raw = studentCpResponse.data.success
          ? studentCpResponse.data.data
          : null;
        const progressArr = raw
          ? Array.isArray(raw)
            ? raw
            : [raw]
          : [];
        const map = Object.fromEntries(
          progressArr.map((p) => [p.questionId, p])
        );
        setProgress(map);
        setQuestions(cpQuestions);
        if (cpQuestions.length === 0) {
          setError(`No questions found for tag ${state.tag}`);
        }
      } catch (err) {
        console.error("Questions API call failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionsAndProgress();
  }, [subjectname, state, studentId]);

  const getTotalTestCases = (q) =>
    1 + (Array.isArray(q.Hidden_Test_Cases) ? q.Hidden_Test_Cases.length : 0);

  const getProgress = (question) => {
    const totalCases = getTotalTestCases(question);
    const maxScore = question.Score;
    const prog = progressMap[question.questionId];
    if (!prog) {
      return {
        testPassed: 0,
        testTotal: totalCases,
        scorePassed: 0,
        scoreTotal: maxScore,
        status: "NOT ATTEMPTED",
      };
    }
    const passedCount = prog.results.filter((r) => r.status === "Passed").length;
    const awarded = prog.awarded_score ?? 0;
    return {
      testPassed: passedCount,
      testTotal: totalCases,
      scorePassed: awarded,
      scoreTotal: maxScore,
      status: passedCount === totalCases ? "SOLVED" : "IN PROGRESS",
    };
  };

  const formatStatus = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const gridCols = { gridTemplateColumns: "5% 35% 10% 15% 15% 15%" };
  const rawTitle = decodeURIComponent(subtopic).replace(/-/g, " ");
  const displayTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-[Inter]">
      <div className="w-full flex justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {displayTitle} Questions
        </h1>
        <button
          onClick={() => navigate(`/code-playground/${subjectname}`)}
          className="bg-[#2333cb] text-white py-2 px-4 rounded-lg hover:bg-[#181e5a]"
        >
          Back to Subtopics
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading questions...</p>}
      {error && <p className="text-red-600">Questions will be updated Soon ...</p>}

      {questions.length > 0 && !loading ? (
        <>
          {/* Table on md+ */}
          <div
            className="hidden md:block w-full bg-white rounded-sm"
            style={{ boxShadow: "0px 5px 21px rgba(0,73,198,0.2)" }}
          >
            <div
              className="grid text-white font-semibold text-[15px] leading-[19px] rounded-t-md bg-[#19216F]"
              style={gridCols}
            >
              <div className="py-4 px-6">S/No</div>
              <div className="py-4 px-6">Question</div>
              <div className="py-4 px-6">Difficulty</div>
              <div className="py-4 px-6">Test Cases</div>
              <div className="py-4 px-6">Score</div>
              <div className="py-4 px-6">Status</div>
            </div>
            {questions.map((q, idx) => {
              const { testPassed, testTotal, scorePassed, scoreTotal, status } =
                getProgress(q);
              return (
                <div
                  key={q.questionId}
                  className={`grid text-[15px] leading-[19px] ${
                    idx % 2 === 0 ? "bg-[#EEEFFF]" : "bg-white"
                  } cursor-pointer hover:bg-opacity-90`}
                  style={gridCols}
                  onClick={() => {
                    const prog = progressMap[q.questionId] ?? {};
                    const { sourceCode = null, results = null } = prog;
                    navigate(`/code-playground/solve/${q.questionId}`, {
                      state: {
                        subjectname,
                        topicname,
                        subtopic,
                        question: q,
                        prog_sourceCode: sourceCode,
                        prog_results: results,
                      },
                    });
                  }}
                >
                  <div className="py-4 px-6 font-medium">{idx + 1}</div>
                  <div className="py-4 px-6">{q.Question}</div>
                  <div className="py-4 px-6">{q.Difficulty}</div>
                  <div className="py-4 px-6">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-[#2333CB]"
                        style={{ width: `${(testPassed / testTotal) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 font-semibold text-[12px] leading-[15px] text-[#19216F]">
                      {testPassed}/{testTotal}
                    </div>
                  </div>
                  <div className="py-4 px-6">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-[#2333CB]"
                        style={{ width: `${(scorePassed / scoreTotal) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 font-semibold text-[10px] leading-[12px] text-[#19216F]">
                      {scorePassed}/{scoreTotal}
                    </div>
                  </div>
                  <div className="py-4 px-6">{formatStatus(status)}</div>
                </div>
              );
            })}
          </div>

          {/* Cards on <md */}
          <div className="md:hidden flex flex-col space-y-6">
            {questions.map((q, idx) => {
              const { testPassed, testTotal, scorePassed, scoreTotal, status } =
                getProgress(q);
              return (
                <div
                  key={q.questionId}
                  className="bg-white rounded-sm p-6 cursor-pointer hover:bg-opacity-90"
                  style={{ boxShadow: "0px 5px 21px rgba(0,73,198,0.2)" }}
                  onClick={() => {
                    const prog = progressMap[q.questionId] ?? {};
                    const { sourceCode = null, results = null } = prog;
                    navigate(`/code-playground/solve/${q.questionId}`, {
                      state: {
                        subjectname,
                        topicname,
                        subtopic,
                        question: q,
                        prog_sourceCode: sourceCode,
                        prog_results: results,
                      },
                    });
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-[16px]">#{idx + 1}</span>
                    <span className="text-[14px] font-semibold text-[#19216F]">
                      {formatStatus(status)}
                    </span>
                  </div>
                  <div className="mb-3 text-[16px]">{q.Question}</div>
                  <div className="flex flex-wrap gap-2 mb-4 items-center">
                    <span className="bg-[#EEEFFF] px-3 py-1 rounded text-[12px]">
                      {q.Difficulty}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="text-[13px] font-semibold mb-2">
                      Test Cases Passed
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-[#2333CB]"
                        style={{ width: `${(testPassed / testTotal) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[11px]">
                      {testPassed}/{testTotal}
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold mb-2">Score</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-[#2333CB]"
                        style={{ width: `${(scorePassed / scoreTotal) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[11px]">
                      {scorePassed}/{scoreTotal}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        !loading &&
        !error && <p className="text-gray-600">No questions available.</p>
      )}
    </div>
  );
};

export default SubTopicQuestions;
