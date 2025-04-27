import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const AddQuestions = () => {
    const { examId } = useParams();
    const [questionType, setQuestionType] = useState("MCQ");
    const [mcqQuestion, setMcqQuestion] = useState("");
    const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
    const [correctOption, setCorrectOption] = useState("");
    const [score, setScore] = useState("");
    const [codeStatement, setCodeStatement] = useState("");
    const [testCases, setTestCases] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [totalScore, setTotalScore] = useState(0);
    const [allocatedScore, setAllocatedScore] = useState(0);
    const [questionsAdded, setQuestionsAdded] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/v1/getexam/${examId}`);
                if (response.data.success) {
                    setTotalScore(response.data.exam.totalScore);
                    setAllocatedScore(response.data.exam.totalAllocatedScore || 0);
                }
            } catch {
                setError("Failed to fetch exam details.");
            }
        };

        fetchExamDetails();
    }, [examId]);

    const resetFormFields = () => {
        if (questionType === "MCQ") {
            setMcqQuestion("");
            setOptions({ A: "", B: "", C: "", D: "" });
            setCorrectOption("");
        } else {
            setCodeStatement("");
            setTestCases("");
        }
        setScore("");
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (parseFloat(score) > totalScore - allocatedScore) {
            setError(`Score exceeds the remaining score (${totalScore - allocatedScore}).`);
            return;
        }

        try {
            const payload =
                questionType === "MCQ"
                    ? {
                          type: "MCQ",
                          question: mcqQuestion,
                          options,
                          correctOption,
                          score,
                          examId,
                      }
                    : {
                          type: "CODE",
                          statement: codeStatement,
                          testCases,
                          score,
                          examId,
                      };

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/add-question`, payload);

            if (response.data.success) {
                setSuccessMessage("Question added successfully!");
                resetFormFields();
                setQuestionsAdded((prev) => prev + 1);
                setAllocatedScore((prev) => prev + parseFloat(score));
            } else {
                setError(response.data.message);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        }
    };

    const handleFinishExam = () => {
        if (questionsAdded === 0) {
            setError("Please add at least one question before finishing the exam.");
            return;
        }
        navigate("/manage-exams");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center px-8 font-sans justify-center">
            <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-center text-[#363f8f] mb-6">
                    Add Questions for Exam: {examId}
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-800 font-bold mb-2">Total Score: {totalScore}</p>
                        <p className="text-sm text-gray-800 font-bold mb-2">Allocated Score: {allocatedScore}</p>
                        <p className="text-sm text-gray-800 font-bold mb-4">
                            Remaining Score: {totalScore - allocatedScore}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question Type</label>
                        <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                        >
                            <option value="MCQ">MCQ</option>
                            <option value="CODE">Code</option>
                        </select>
                    </div>
                </div>

                {questionType === "MCQ" ? (
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">MCQ Question</label>
                        <input
                            type="text"
                            placeholder="Enter MCQ Question"
                            value={mcqQuestion}
                            onChange={(e) => setMcqQuestion(e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {["A", "B", "C", "D"].map((opt) => (
                                <div key={opt}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Option {opt}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={`Enter Option ${opt}`}
                                        value={options[opt]}
                                        onChange={(e) =>
                                            setOptions({ ...options, [opt]: e.target.value })
                                        }
                                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Correct Option</label>
                            <select
                                value={correctOption}
                                onChange={(e) => setCorrectOption(e.target.value)}
                                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                                required
                            >
                                <option value="">Select Correct Option</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Code Statement</label>
                        <textarea
                            placeholder="Enter Code Problem Statement"
                            value={codeStatement}
                            onChange={(e) => setCodeStatement(e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        ></textarea>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Test Cases</label>
                            <textarea
                                placeholder="Enter Test Cases"
                                value={testCases}
                                onChange={(e) => setTestCases(e.target.value)}
                                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                                required
                            ></textarea>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Score</label>
                    <input
                        type="number"
                        placeholder="Enter Score"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                        required
                    />
                </div>

                {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
                {successMessage && <div className="text-sm text-green-600 mt-4">{successMessage}</div>}

                <div className="flex justify-between items-center mt-8">
                    <button
                        className="bg-[#363f8f] hover:bg-[#2e3279] text-white font-bold text-sm py-2 px-4 rounded-lg shadow-md transition duration-200"
                        onClick={handleFinishExam}
                    >
                        Finish Exam
                    </button>
                    <button
                        className="bg-[#e41f3a] hover:bg-red-600 text-white font-bold text-sm py-2 px-4 rounded-lg shadow-md transition duration-200"
                        onClick={handleAddQuestion}
                    >
                        Add Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddQuestions;
