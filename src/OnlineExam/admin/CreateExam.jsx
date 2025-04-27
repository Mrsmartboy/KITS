import React, { useState } from "react";
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import { decryptData } from '../../cryptoUtils.jsx';

const CreateExam = () => {
    const [examId, setExamId] = useState("");
    const [examName, setExamName] = useState("");
    const [examDate, setExamDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [totalScore, setTotalScore] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const location = decryptData(sessionStorage.getItem('location'))
  

    const handleCreateExam = async (e) => {
        e.preventDefault();

   
            
            const payload = {
                examId,
                examName,
                examDate,
                startTime,
                endTime,
                location,
                totalScore: parseFloat(totalScore),
            }
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/createxam`,payload );
            if (response.data.success) {
                navigate(`/add-questions/${examId}`, {replace:true});
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center px-4 font-sans mt-0">
            <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-center text-[#363f8f] mb-4">
                    Create a New Exam
                </h2>
                <form onSubmit={handleCreateExam} className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Exam ID</label>
                        <input
                            type="text"
                            placeholder="Enter Exam ID"
                            value={examId}
                            onChange={(e) => setExamId(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                        <input
                            type="text"
                            placeholder="Enter Exam Name"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                        <input
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Total Score</label>
                        <input
                            type="number"
                            placeholder="Enter Total Score"
                            value={totalScore}
                            onChange={(e) => setTotalScore(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-600 font-medium text-center">{error}</div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-[#363f8f] hover:bg-[#2e3279] text-white font-bold text-sm py-2 px-4 rounded-lg shadow-md transition duration-200"
                    >
                        Create Exam
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateExam;
