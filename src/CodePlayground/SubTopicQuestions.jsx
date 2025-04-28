import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { decryptData } from "../../cryptoUtils";

const SubTopicQuestions = () => {
  const { subjectname, topicname, subtopic } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [progressMap, setProgress] = useState({}); // <-- new
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const studentId = decryptData(sessionStorage.getItem("id"));

  useEffect(() => {
    const fetchQuestionsAndProgress = async () => {
      if (!state?.tag) {
        setError("No tag provided for questions.");
        return;
      }

      setLoading(true);
      try {
        /* ── Both APIs concurrently ─────────────────────────────── */
        const [cpResponse, studentCpResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/get-cpquestions`,
            {
              params: { subject: subjectname, tags: state.tag },
            }
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/cp-progress`, {
            params: { subject: subjectname, tags: state.tag, studentId },
          }),
        ]);

        /* ── Questions list (same as before) ────────────────────── */
        const cpQuestions = cpResponse.data.success
          ? cpResponse.data.codeQuestions || []
          : [];

        /* ── Progress normalisation ─────────────────────────────── */
        const raw = studentCpResponse.data.success
          ? studentCpResponse.data.data
          : null;
        const progressArr = raw
          ? Array.isArray(raw)
            ? raw
            : [raw] // handle single-object or array
          : [];
        const map = Object.fromEntries(
          progressArr.map((p) => [p.questionId, p])
        );
        setProgress(map);

        /* ── If you still want to include unsolved questions
              that aren’t in cp-progress, keep cpQuestions as is ── */
        setQuestions(cpQuestions);

        if (cpQuestions.length === 0) {
          setError(`No questions found for tag ${state.tag}`);
        }
      } catch (err) {
        console.error("Questions API call failed:", err);
        setError("Failed to fetch questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndProgress();
  }, [subjectname, state, studentId]);

  /* ───────────────── Helpers ────────────────────────── */

  /** How many test-cases does this question contain?
   *  (1 sample + N hidden) */
  const getTotalTestCases = (q) =>
    1 + (Array.isArray(q.Hidden_Test_Cases) ? q.Hidden_Test_Cases.length : 0);

  /** Build a progress object for a single question */
  const getProgress = (question) => {
    const totalCases = getTotalTestCases(question);
    const maxScore = question.Score; // “Score” is the full-question max

    /* ========== NO SUBMISSION YET ========== */
    const prog = progressMap[question.questionId];
    if (!prog) {
      return {
        passedStr: `0/${totalCases}`,
        passedPct: 0,
        scoreStr: `0/${maxScore}`,
        scorePct: 0,
        status: "NOT ATTEMPTED",
      };
    }

    /* ========== WE HAVE A SUBMISSION ========== */
    const passedCount = prog.results.filter(
      (r) => r.status === "Passed"
    ).length;
    const awarded = prog.awarded_score ?? 0;

    return {
      passedStr: `${passedCount}/${totalCases}`,
      passedPct: (passedCount / totalCases) * 100,
      scoreStr: `${awarded}/${maxScore}`,
      scorePct: (awarded / maxScore) * 100,
      status: passedCount === totalCases ? "SOLVED" : "IN PROGRESS",
    };
  };

  /* ─────────────────────── UI ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {decodeURIComponent(subtopic).replace(/-/g, " ")} Questions
        </h1>
        <button
          onClick={() => navigate(`/code-playground/${subjectname}`)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Back to Subtopics
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading questions...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {questions.length > 0 && !loading ? (
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
              {questions.map((q, i) => {
                const { passedStr, passedPct, scoreStr, scorePct, status } =
                  getProgress(q);

                return (
                  <tr
                    key={q.questionId}
                    className={`border-b cursor-pointer hover:bg-gray-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                    onClick={() =>
                      navigate(`/code-playground/solve/${q.questionId}`, {
                        state: {
                          subjectname,
                          topicname,
                          subtopic,
                          question: q,
                        },
                      })
                    }
                  >
                    <td className="py-4 px-4 text-gray-800">{q.Question}</td>
                    <td className="py-4 px-4 text-gray-600">{q.Difficulty}</td>

                    {/* Test-cases cell */}
                    <td className="py-4 px-4">
                      <div className="text-gray-600">{passedStr}</div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${passedPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Score cell */}
                    <td className="py-4 px-4">
                      <div className="text-gray-600">{scoreStr}</div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                    </td>

                    {/* Status cell */}
                    <td className="py-4 px-4 flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          status === "SOLVED"
                            ? "text-green-600"
                            : status === "IN PROGRESS"
                            ? "text-yellow-600"
                            : "text-gray-500"
                        }`}
                      >
                        {status}
                      </span>
                      <svg
                        className="w-5 h-5 text-blue-500 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading &&
        !error && <p className="text-gray-600">No questions available.</p>
      )}
    </div>
  );
};

export default SubTopicQuestions;
