import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import OnlineCompiler from "./OnlineCompiler";
import MCQComponent from "./MCQComponent";
import { useDaily } from "../../../contexts/DailyContext";
import { decryptData } from '../../cryptoUtils.jsx';


const ExamPage = () => {
  const { state } = useLocation();
  const { batchNo } = state;
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(3600); // 1-hour timer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const studentId = decryptData(localStorage.getItem("student_id"));
  const { dailyExam,fetchDailyExamDetails} = useDaily();

    useEffect(() => {
     fetchDailyExamDetails(batchNo)
    }, [fetchDailyExamDetails,batchNo]);

  // Fetch Questions
  const fetchQuestions = useCallback( async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/questions`, {
        params: { batchNo },
      });

      if (response.data?.exams?.[0]?.exam_questions) {
        const shuffledQuestions = response.data.exams[0].exam_questions.sort(
          () => Math.random() - 0.5
        );
        setQuestions(shuffledQuestions);
      } else {
        throw new Error("No questions found for this exam.");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  },[batchNo]);

  useEffect(() => {
    if (batchNo) fetchQuestions();
  }, [batchNo,fetchQuestions]);

  // Timer Countdown
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Answer Change Handler
  const handleAnswerChange = (questionId, data) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...data,
      },
    }));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev < questions.length - 1 ? prev + 1 : prev));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleSubmitExam = async () => {
    const formattedData = questions.map((question) => {
      const questionId = question.question_id;
      if (question.type === "MCQ") {
        const selectedOption = answers[questionId]?.selectedOption || null;
        const correctOption = question.answer;

        const normalize = (text) =>
          text ? text.replace(/^\([a-zA-Z]\)\s*/, "").trim().toLowerCase() : "";

        const isCorrect = normalize(selectedOption) === normalize(correctOption);
        const score = isCorrect ? question.score : 0;

        const selectedEntry = Object.entries(question.options).find(
          ([, value]) => normalize(value) === normalize(selectedOption)
        );
        const correctEntry = Object.entries(question.options).find(
          ([, value]) => normalize(value) === normalize(correctOption)
        );

        return {
          question_id: questionId,
          type: "MCQ",
          question_text: question.description,
          options: question.options,
          user_answer: selectedEntry ? { [selectedEntry[0]]: selectedEntry[1] } : null,
          correct_answer: correctEntry ? { [correctEntry[0]]: correctEntry[1] } : null,
          is_correct: isCorrect,
          score,
        };
      } else if (question.type === "Coding") {
        const codingAnswer = answers[questionId] || {};
        const { passed = 0, failed = 0 } = codingAnswer.testCaseSummary || {};
        const allPassed = failed === 0 && passed > 0;
        const score = allPassed ? question.score : 0;

        return {
          question_id: questionId,
          type: "Coding",
          question_text: question.description,
          sample_input: question.sample_input,
          sample_output: question.sample_output,
          hidden_test_cases: question.hidden_test_cases,
          user_source_code: codingAnswer.sourceCode || "",
          user_language: codingAnswer.language || "",
          user_output: codingAnswer.output || "",
          custom_input: codingAnswer.customInput || "",
          test_case_summary: codingAnswer.testCaseSummary || {},
          score,
        };
      }
      return null;
    });

    const totalScore = formattedData.reduce((acc, question) => acc + (question?.score || 0), 0);

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/answers`, {
        studentId,
        totalScore,
        batchNo,
        dailyExam,
        answers: formattedData,
        status: "completed",


      });

      Swal.fire({
        title: "Exam Submitted!",
        text: `Your total score is: ${totalScore}`,
        icon: "success",
        confirmButtonText: "Go to Dashboard",
        confirmButtonColor: "#4CAF50",
      }).then(() => {
        navigate("/exam-dashboard");
      });
    } catch (err) {
      console.error("Error submitting exam:", err);
      Swal.fire({
        title: "Submission Failed",
        text: "Failed to submit exam. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    }

    fetchDailyExamDetails(batchNo);

  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="text-center text-gray-600">Loading questions...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Exam Page</h1>
        <div className="text-gray-700 font-medium">
          Time Remaining: <span className="font-bold">{formatTime(timer)}</span>
        </div>
      </header>

      {currentQuestion && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Question {currentQuestionIndex + 1}/{questions.length}
          </h2>

          {currentQuestion.type === "MCQ" ? (
            <MCQComponent
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.question_id]?.selectedOption || ""}
              onAnswerChange={(selectedOption) =>
                handleAnswerChange(currentQuestion.question_id, { selectedOption })
              }
            />
          ) : (
            <OnlineCompiler
              question={currentQuestion}
              existingData={answers[currentQuestion.question_id] || {}}
              onRun={(data) => handleAnswerChange(currentQuestion.question_id, data)}
            />
          )}

          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
            </button>
          </div>

          {currentQuestionIndex === questions.length - 1 && (
            <button
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full"
              onClick={handleSubmitExam}
            >
              Submit Exam
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamPage;
