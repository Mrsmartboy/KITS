import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await axios.get(`http://192.168.29.65:5000/api/admin/get-exams`);
                if (response.data.success) {
                    setExams(response.data.exams);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError("Failed to fetch exams");
            }
        };

        fetchExams();
    }, []);

    const handleDeleteExam = async (examId) => {
        try {
            const response = await axios.delete(`http://192.168.29.65:5000/api/admin/delete-exam/${examId}`);
            if (response.data.success) {
                setSuccessMessage("Exam deleted successfully!");
                setExams(exams.filter((exam) => exam.examId !== examId));
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("Failed to delete exam");
        }
    };

    const handlePreview = async (examId) => {
        setLoadingQuestions(true);
        try {
            const response = await axios.get(`http://192.168.29.65:5000/api/admin/get-questions/${examId}`);
            if (response.data.success) {
                setPreviewQuestions(response.data.questions);
                setIsPreviewOpen(true);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("Failed to load questions");
        } finally {
            setLoadingQuestions(false);
        }
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewQuestions([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-6 py-8 font-sans mt-0">
            <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#363f8f]">Manage Exams</h2>
                    <button
                        className="bg-[#4f46e5] hover:bg-[#3e37c9] text-white font-bold text-sm py-2 px-6 rounded-lg shadow-md transition duration-200"
                        onClick={() => navigate("/admin-dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
                {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                {successMessage && <div className="text-sm text-green-600 mb-4">{successMessage}</div>}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#363f8f] text-white">
                                <th className="px-4 py-3 text-left text-sm font-semibold">Exam ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Exam Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell">Start Time</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell">End Time</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold hidden md:table-cell">Total Score</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold hidden md:table-cell">Allocated Score</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map((exam, index) => (
                                <tr
                                    key={exam.examId}
                                    className={`${
                                        index % 2 === 0 ? "bg-blue-50" : "bg-white"
                                    } hover:bg-blue-100 transition duration-200`}
                                >
                                    <td className="px-4 py-3 text-sm truncate">{exam.examId}</td>
                                    <td className="px-4 py-3 text-sm truncate">{exam.examName}</td>
                                    <td className="px-4 py-3 text-sm truncate hidden sm:table-cell">{exam.examDate}</td>
                                    <td className="px-4 py-3 text-sm truncate hidden sm:table-cell">{exam.startTime}</td>
                                    <td className="px-4 py-3 text-sm truncate hidden sm:table-cell">{exam.endTime}</td>
                                    <td className="px-4 py-3 text-sm truncate hidden md:table-cell">{exam.totalScore}</td>
                                    <td className="px-4 py-3 text-sm truncate hidden md:table-cell">
                                        {exam.allocatedScore || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row sm:justify-center">
                                        <button
                                            className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-bold text-sm py-2 px-4 rounded-lg transition duration-200"
                                            onClick={() => handlePreview(exam.examId)}
                                        >
                                            Preview
                                        </button>
                                        <button
                                            className="bg-[#4f46e5] hover:bg-[#3e37c9] text-white font-bold text-sm py-2 px-4 rounded-lg transition duration-200"
                                            onClick={() => navigate(`/edit-exam/${exam.examId}`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-[#e41f3a] hover:bg-red-600 text-white font-bold text-sm py-2 px-4 rounded-lg transition duration-200"
                                            onClick={() => handleDeleteExam(exam.examId)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="bg-[#363f8f] hover:bg-[#2e3279] text-white font-bold text-sm py-2 px-4 rounded-lg transition duration-200"
                                            onClick={() => navigate(`/manage-questions/${exam.examId}`)}
                                        >
                                            Manage Questions
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPreviewOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-3/4 lg:w-2/3 h-4/5 flex flex-col">
            {/* Fixed Background Watermark Logo */}
            <div
                className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-10"
                style={{
                    backgroundImage: `url('https://github.com/sandeep-bandikatla/exam/blob/main/codegnan%20icon.png?raw=true')`, // Raw image URL from GitHub
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.02, // Adjust opacity for watermark effect
                }}
            ></div>
            
            {/* Close Button - Positioned Top Right with Margin */}
            <div className="flex justify-end mb-4 z-20"> {/* Flex container for button alignment */}
                <button
                    onClick={closePreview}
                    className="bg-[#4f46e5] hover:bg-[#3e37c9] text-white font-bold text-sm py-2 px-4 rounded-lg transition duration-200 z-20"
                >
                    Close
                </button>
            </div>

            {/* Modal Content - Scrollable Area */}
            <div className="relative z-10 flex-grow overflow-y-auto max-h-[70vh]"> {/* Set max height for scrolling */}
                <h3 className="text-lg font-bold text-[#363f8f] mb-4">Exam Questions Preview</h3>
                {loadingQuestions ? (
                    <p className="text-center text-sm text-gray-600">Loading questions...</p>
                ) : (
                    previewQuestions.map((q, index) => (
                        <div key={q._id} className="border-b py-4">
                            <p className="text-sm font-bold">{`${index + 1}. ${q.question}`}</p>
                            {q.type === "MCQ" && (
                                <ul className="list-disc ml-5 mt-2 text-sm">
                                    {Object.entries(q.options).map(([key, value]) => (
                                        <li
                                            key={key}
                                            className={`${
                                                key === q.correctOption ? "text-green-600 font-bold" : ""
                                            }`}
                                        >
                                            {key}: {value}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
)}


        </div>
    );
};

export default ManageExams;
