import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useStudent } from "../../../contexts/StudentProfileContext";
import OnlineCompiler from "./OnlineCompiler";

// Utility to store how many (easy/medium/hard) MCQs & coding questions exist for each subject
function computeDifficultyCounts(examData) {
  const result = {};
  if (!examData || !examData.subjects) return result;

  for (const sub of examData.subjects) {
    if (!sub.subject) continue;
    const subjectName = sub.subject.toLowerCase();

    if (!result[subjectName]) {
      result[subjectName] = {
        MCQs: { easy: 0, medium: 0, hard: 0 },
        Coding: { easy: 0, medium: 0, hard: 0 },
      };
    }

    // Count MCQs
    for (const mcq of sub.MCQs || []) {
      const diff = (mcq.Difficulty || "").toLowerCase();
      if (["easy", "medium", "hard"].includes(diff)) {
        result[subjectName].MCQs[diff] += 1;
      }
    }

    // Count Coding
    for (const codeQ of sub.Coding || []) {
      const diff = (codeQ.Difficulty || "").toLowerCase();
      if (["easy", "medium", "hard"].includes(diff)) {
        result[subjectName].Coding[diff] += 1;
      }
    }
  }

  return result;
}

function ConductExam() {
  const { studentDetails } = useStudent();
  const location = useLocation();
  const navigate = useNavigate();

  const examData = location.state?.exam || null; // The exam details passed to this route
  const studentName = studentDetails?.name || "Student Name";

  // Basic exam states
  const [currentSection, setCurrentSection] = useState("MCQ"); // "MCQ" or "Coding"
  const [mcqIndex, setMcqIndex] = useState(0);
  const [codingIndex, setCodingIndex] = useState(0);

  // Track question status
  /**
   * questionStatus format:
   * {
   *   [qId]: {
   *     visited: boolean,
   *     answered: boolean,
   *     locked: boolean,
   *     timeLeft: number  // in seconds
   *   }
   * }
   */
  const [questionStatus, setQuestionStatus] = useState({});

  // Student responses that we’ll POST to the server
  /**
   * responses: {
   *   examId?: string,
   *   [questionId]:  string | { ...code data }   // For MCQs: "A","B","C" etc
   * }
   */
  const [responses, setResponses] = useState({
    examId: examData?.examId || "",
    studentExamId: examData?.studentExamId || "",
  });

  // Overall timer for the entire exam
  const [timer, setTimer] = useState(null);

  // We’ll keep a flag to ensure we only submit once (to avoid repeated auto-submits).
  const [submitted, setSubmitted] = useState(false);

  // Reference to the per-question countdown (so we can clear it when switching questions)
  const questionTimerRef = useRef(null);

  // Flatten MCQs and coding arrays
  const mcqQuestions = examData?.subjects?.flatMap((s) => s.MCQs || []) || [];
  const codingQuestions =
    examData?.subjects?.flatMap((s) => s.Coding || []) || [];

  // Decide which list to show
  const questions = currentSection === "MCQ" ? mcqQuestions : codingQuestions;
  const currentQuestionIndex =
    currentSection === "MCQ" ? mcqIndex : codingIndex;
  const currentQuestion = questions[currentQuestionIndex] || null;
  const totalQuestions = questions.length;

  // Precompute difficulty-based question counts
  const difficultyCounts = useMemo(() => {
    return computeDifficultyCounts(examData);
  }, [examData]);

  // totalMarks - sums all MCQ + coding question scores
  const totalMarks = useMemo(() => {
    if (!examData?.subjects) return 0;
    let sum = 0;
    examData.subjects.forEach((sub) => {
      (sub.MCQs || []).forEach((q) => {
        sum += q.Score || 0;
      });
      (sub.Coding || []).forEach((q) => {
        sum += q.Score || 0;
      });
    });
    return sum;
  }, [examData]);

  // 1) Force fullscreen on mount
  useEffect(() => {
    // Request fullscreen
    document.documentElement.requestFullscreen().catch(() => {
      toast.error("Fullscreen request denied or failed.");
    });
  }, []);

  // 2) If user exits fullscreen => close exam
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitted) {
        toast.error("You exited fullscreen. The exam will now close.");
        // Could auto-submit before closing if you prefer:
        setSubmitted(true);
        handleSubmit(); // attempt submit
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [submitted,handleSubmit]);

  // 3) Overall exam timer => if time is up, auto-submit
  useEffect(() => {
    if (!examData || !examData.startTime || !examData.totalExamTime) return;

    // parse the startTime from examData
    const [hours, minutes] = examData.startTime.split(":").map(Number);
    const totalExamTime = examData.totalExamTime;

    // “endTime” in the same day with offset
    const endTime = new Date();
    endTime.setHours(hours, minutes, 0, 0);
    endTime.setMinutes(endTime.getMinutes() + totalExamTime);

    function updateTimer() {
      if (submitted) return; // If already submitted, do nothing
      const now = new Date();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimer("Time Up!");
        setSubmitted(true);
        // Auto-submit if not already done
        handleSubmit();
        return;
      }
      const hr = Math.floor(diff / (1000 * 60 * 60));
      const min = Math.floor((diff / (1000 * 60)) % 60);
      const sec = Math.floor((diff / 1000) % 60);
      setTimer(
        `${String(hr).padStart(2, "0")}:${String(min).padStart(
          2,
          "0"
        )}:${String(sec).padStart(2, "0")}`
      );
    }

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [examData, submitted]);

  // getCurrentQId helper
  const getCurrentQId =useCallback(() => {
    if (!currentQuestion) return null;
    return (
      currentQuestion.questionId ||
      currentQuestion.Question_No ||
      `${currentSection}-${currentQuestionIndex}`
    );
  },[]);

  // figure out question time from examData & difficulty
  const getTimeForQuestion=useCallback((question)=>{
    if (!examData || !question) return 0;
    const subj = question.Subject?.toLowerCase() || "";
    const diff = question.Difficulty?.toLowerCase() || "";
    const qType = question.Question_Type?.toLowerCase() || "mcq";

    const subObj = examData.subjects?.find(
      (s) => s.subject?.toLowerCase() === subj
    );
    if (!subObj || !subObj.timeConstraints) return 0;

    const isMCQ = qType === "mcq";
    const sectionType = isMCQ ? "MCQs" : "Coding";
    const timeForDiff = subObj.timeConstraints[sectionType]?.[diff];
    if (!timeForDiff) return 0;

    // how many questions of this difficulty?
    const count = difficultyCounts[subj]?.[sectionType]?.[diff] || 1;
    // Return (time allocated for that difficulty) / (count of questions with that difficulty)
    return timeForDiff / count; // in minutes
  },[])

    // lock question and move on
    const lockAndNext=useCallback((qId)=> {
      setQuestionStatus((prev) => ({
        ...prev,
        [qId]: {
          ...(prev[qId] || {}),
          locked: true,
        },
      }));
      handleNext();
    },[handleNext])

    const handleNext =useCallback(() => {
      if (currentSection === "MCQ") {
        let nextIdx = mcqIndex + 1;
        while (nextIdx < mcqQuestions.length) {
          const qId = mcqQuestions[nextIdx].questionId ?? nextIdx;
          if (!questionStatus[qId]?.locked) {
            setMcqIndex(nextIdx);
            return;
          }
          nextIdx++;
        }
        // no more MCQ => switch to coding
        setCurrentSection("Coding");
        let idx = 0;
        while (
          idx < codingQuestions.length &&
          questionStatus[codingQuestions[idx].questionId ?? idx]?.locked
        ) {
          idx++;
        }
        if (idx < codingQuestions.length) {
          setCodingIndex(idx);
        }
      } else {
        // coding
        let nextIdx = codingIndex + 1;
        while (nextIdx < codingQuestions.length) {
          const qId = codingQuestions[nextIdx].questionId ?? nextIdx;
          if (!questionStatus[qId]?.locked) {
            setCodingIndex(nextIdx);
            return;
          }
          nextIdx++;
        }
        // no more coding => switch back to MCQ if any remain
        setCurrentSection("MCQ");
        let idx = 0;
        while (
          idx < mcqQuestions.length &&
          questionStatus[mcqQuestions[idx].questionId ?? idx]?.locked
        ) {
          idx++;
        }
        if (idx < mcqQuestions.length) {
          setMcqIndex(idx);
        }
      }
    },[codingIndex,codingQuestions,currentSection,mcqIndex,mcqQuestions,questionStatus]);
  

  // 4) Per-question timer => each question locks after its allocated time
  useEffect(() => {
    // Clear previous question timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    if (!currentQuestion || submitted) return;

    const qId = getCurrentQId();
    if (!qId) return;

    // if question is locked => skip
    if (questionStatus[qId]?.locked) return;

    // if no timeLeft set => initialize
    setQuestionStatus((prev) => {
      const old = prev[qId] || {};
      if (old.timeLeft == null) {
        const mins = getTimeForQuestion(currentQuestion);
        const initialSec = Math.floor(mins * 60);
        return {
          ...prev,
          [qId]: {
            ...old,
            timeLeft: initialSec,
          },
        };
      }
      return prev;
    });

    // start the countdown
    questionTimerRef.current = setInterval(() => {
      setQuestionStatus((prev) => {
        const old = prev[qId] || {};
        if (!old.timeLeft || old.timeLeft <= 0 || old.locked) {
          return prev;
        }
        const newTimeLeft = old.timeLeft - 1;
        if (newTimeLeft === 0) {
          // lock question
          setTimeout(() => lockAndNext(qId), 0);
        }
        return {
          ...prev,
          [qId]: {
            ...old,
            timeLeft: newTimeLeft,
          },
        };
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }
    };
  }, [
    currentQuestionIndex,
    currentSection,
    currentQuestion,
    examData,
    submitted,
    getCurrentQId,
    getTimeForQuestion,
    lockAndNext,
    questionStatus

  ]);


  // format seconds => mm:ss
  const formatSeconds = (sec) => {
    if (!sec || sec <= 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // next question


  // prev question
  const handlePrev = () => {
    if (currentSection === "MCQ") {
      let prevIdx = mcqIndex - 1;
      while (prevIdx >= 0) {
        const qId = mcqQuestions[prevIdx].questionId ?? prevIdx;
        if (!questionStatus[qId]?.locked) {
          setMcqIndex(prevIdx);
          return;
        }
        prevIdx--;
      }
      // none => check coding from the end
      setCurrentSection("Coding");
      let idx = codingQuestions.length - 1;
      while (
        idx >= 0 &&
        questionStatus[codingQuestions[idx].questionId ?? idx]?.locked
      ) {
        idx--;
      }
      if (idx >= 0) {
        setCodingIndex(idx);
      }
    } else {
      // coding
      let prevIdx = codingIndex - 1;
      while (prevIdx >= 0) {
        const qId = codingQuestions[prevIdx].questionId ?? prevIdx;
        if (!questionStatus[qId]?.locked) {
          setCodingIndex(prevIdx);
          return;
        }
        prevIdx--;
      }
      // none => check MCQ from the end
      setCurrentSection("MCQ");
      let idx = mcqQuestions.length - 1;
      while (
        idx >= 0 &&
        questionStatus[mcqQuestions[idx].questionId ?? idx]?.locked
      ) {
        idx--;
      }
      if (idx >= 0) {
        setMcqIndex(idx);
      }
    }
  };

  // store MCQ answer
  const handleMCQOptionSelect = (qId, optionKey) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
    setQuestionStatus((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        visited: true,
        answered: true,
      },
    }));
  };

  // store coding answer
  const handleCompileRun = (dataFromCompiler) => {
    const qId = getCurrentQId();
    if (!qId) return;
    // Merge old data + new data
    setResponses((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        ...dataFromCompiler,
      },
    }));
    setQuestionStatus((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        visited: true,
        answered: true,
      },
    }));
  };

  const timeLeftForCurrent = (() => {
    const qId = getCurrentQId();
    if (!qId) return 0;
    return questionStatus[qId]?.timeLeft || 0;
  })();

  // final submit
  const handleSubmit =useCallback(async () => {
    // If we've already submitted, skip
    if (submitted) return;

    try {
      setSubmitted(true); // Ensure we only submit once
      toast.info("Submitting your exam, please wait...");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/submit-exam`,
        responses,
        { headers: { "Content-Type": "application/json" } }
      );

      const { success, message, analysis } = response.data;
      if (success) {
        toast.success(message || "Exam Submitted Successfully!");
        // Navigate to exam-analysis route
        navigate("/exam-analysis", {
          state: {
            analysis,
            examID: examData.examId,
            studentExamId: examData.studentExamId,
          },
        });
      } else {
        toast.error(message || "Submission error!");
        // If you want to do some fallback (like keep them here), you can
        // but typically you'd still end the exam.
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "An error occurred during submission!"
      );
    } finally {
      // You could optionally close the window or revert out
      // window.close();
    }
  },[examData.examId,examData.studentExamId,navigate,responses,submitted]);

  // Is the current question locked?
  const currentQuestionLocked = currentQuestion
    ? !!questionStatus[getCurrentQId()]?.locked
    : false;

  return (
    <div className="flex flex-col h-screen">
      {/* TOP BAR */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{studentName}</h2>
          {examData ? (
            <p className="text-sm text-gray-600">
              Exam ID: {examData.examId} | StudentExamId:{" "}
              {examData.studentExamId}
            </p>
          ) : (
            <p className="text-sm text-gray-600">Loading exam info...</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">
            Timer: {timer || "N/A"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Submit
          </button>
        </div>
      </div>

      {/* SECOND ROW: summary */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex space-x-4">
          <span>
            Answered:{" "}
            {Object.values(questionStatus).filter((s) => s.answered).length}/
            {mcqQuestions.length + codingQuestions.length}
          </span>
          <span>
            Visited:{" "}
            {Object.values(questionStatus).filter((s) => s.visited).length}/
            {mcqQuestions.length + codingQuestions.length}
          </span>
        </div>
        <div className="font-medium">Total Marks: {totalMarks}</div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - question list for the current section only */}
        <div className="w-20 border-r border-gray-300 overflow-y-auto p-2">
          {questions.map((q, idx) => {
            const qId = q?.questionId ?? q?.Question_No ?? idx;
            const qStat = questionStatus[qId] || {};
            let bgColor = "bg-gray-200";

            if (idx === currentQuestionIndex) {
              bgColor = "bg-yellow-400";
            } else if (qStat.locked) {
              bgColor = "bg-red-500 text-white"; // locked => can't click
            } else if (qStat.answered) {
              bgColor = "bg-green-500 text-white";
            } else if (qStat.visited) {
              bgColor = "bg-gray-300";
            }

            // if locked => skip pointer events
            const handleClick = () => {
              if (submitted) return; // can't navigate if exam ended
              if (qStat.locked) return; // can't select locked question
              if (currentSection === "MCQ") setMcqIndex(idx);
              else setCodingIndex(idx);
              setQuestionStatus((prev) => ({
                ...prev,
                [qId]: {
                  ...(prev[qId] || {}),
                  visited: true,
                },
              }));
            };

            return (
              <div
                key={qId}
                onClick={handleClick}
                className={`w-10 h-10 mb-2 flex items-center justify-center rounded cursor-pointer ${bgColor}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        {/* CENTER */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {/* Section toggles */}
          {examData && (
            <div className="mb-4">
              <button
                onClick={() => setCurrentSection("MCQ")}
                disabled={submitted}
                className={`px-4 py-2 mr-2 rounded text-white ${
                  currentSection === "MCQ" ? "bg-green-600" : "bg-gray-400"
                } disabled:bg-gray-300`}
              >
                MCQ Section
              </button>
              <button
                onClick={() => setCurrentSection("Coding")}
                disabled={submitted}
                className={`px-4 py-2 rounded text-white ${
                  currentSection === "Coding" ? "bg-green-600" : "bg-gray-400"
                } disabled:bg-gray-300`}
              >
                Coding Section
              </button>
            </div>
          )}

          {!examData && (
            <div className="text-gray-600">Loading exam details...</div>
          )}

          {examData && questions.length > 0 && currentQuestion ? (
            <>
              <div className="mb-2 font-semibold">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              {currentSection === "MCQ" ? (
                // MCQ
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Subject: {currentQuestion.Subject || "N/A"}
                  </p>
                  <div className="mb-4 p-3 border border-gray-300 rounded bg-gray-50">
                    {currentQuestion.Question}
                  </div>

                  {currentQuestionLocked ? (
                    <div className="text-red-600 font-bold mb-4">
                      This question is locked (time over).
                    </div>
                  ) : submitted ? (
                    <div className="text-blue-500 font-bold mb-4">
                      The exam has been submitted.
                    </div>
                  ) : (
                    <div className="mb-6">
                      {Object.entries(currentQuestion.Options || {}).map(
                        ([optionKey, optionValue]) => {
                          const qId = getCurrentQId();
                          const isSelected = responses[qId] === optionKey;
                          return (
                            <label
                              key={optionKey}
                              className="flex items-center mb-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`question-${qId}`}
                                checked={isSelected}
                                onChange={() =>
                                  handleMCQOptionSelect(qId, optionKey)
                                }
                                className="mr-2"
                                disabled={currentQuestionLocked || submitted}
                              />
                              <span>{`${optionKey}. ${optionValue}`}</span>
                            </label>
                          );
                        }
                      )}
                    </div>
                  )}
                  {/* Timer */}
                  <p className="text-red-600 font-semibold mb-4">
                    Time Left (this question):{" "}
                    {formatSeconds(timeLeftForCurrent)}
                  </p>
                </div>
              ) : (
                // coding => 2 columns
                <div className="flex gap-6">
                  {/* left: details */}
                  <div className="flex-1 border border-gray-300 p-3 rounded bg-white">
                    <h3 className="text-base font-semibold mb-2">
                      Coding Question (Difficulty:{" "}
                      {currentQuestion.Difficulty || "N/A"})
                    </h3>
                    <p className="mb-2">
                      <span className="font-medium">Subject:</span>{" "}
                      {currentQuestion.Subject || "N/A"}
                    </p>
                    {currentQuestionLocked && (
                      <div className="text-red-600 font-bold mb-2">
                        This question is locked (time over).
                      </div>
                    )}
                    {submitted && (
                      <div className="text-blue-500 font-bold mb-2">
                        The exam has been submitted.
                      </div>
                    )}
                    <p className="mb-2 text-red-600 font-semibold">
                      Time Left (this question):{" "}
                      {formatSeconds(timeLeftForCurrent)}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Question:</span>{" "}
                      {currentQuestion.Question}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Constraints:</span>{" "}
                      {currentQuestion.Constraints || "N/A"}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Sample Input:</span>{" "}
                      {currentQuestion.Sample_Input ?? "N/A"}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Sample Output:</span>{" "}
                      {currentQuestion.Sample_Output ?? "N/A"}
                    </p>
                  </div>
                  {/* right: editor */}
                  <div className="flex-1 border border-gray-300 p-3 rounded bg-white">
                    <OnlineCompiler
                      question={{
                        question_id: getCurrentQId() || "NA",
                        description: currentQuestion.Question || "",
                        constraints: currentQuestion.Constraints || "",
                        sample_input: currentQuestion.Sample_Input || "",
                        sample_output: currentQuestion.Sample_Output || "",
                        hidden_test_cases:
                          currentQuestion.Hidden_Test_Cases || [],
                        difficulty: currentQuestion.Difficulty || "",
                        score: currentQuestion.Score || 1,
                        type: currentQuestion.Question_Type || "code",
                      }}
                      existingData={responses[getCurrentQId()] || {}}
                      onRun={handleCompileRun}
                      locked={currentQuestionLocked || submitted}
                    />
                  </div>
                </div>
              )}

              {/* Prev / Next */}
              <div className="mt-4 pt-4 border-t border-gray-300 flex gap-4">
                <button
                  onClick={handlePrev}
                  disabled={submitted}
                  className="px-3 py-1 border border-gray-300 bg-gray-100 text-sm rounded disabled:bg-gray-200"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={submitted}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </>
          ) : examData && questions.length === 0 ? (
            <p className="mt-4 text-gray-600">No questions available.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ConductExam;
