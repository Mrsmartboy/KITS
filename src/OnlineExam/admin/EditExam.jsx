import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [examDetails, setExamDetails] = useState({
        examName: '',
        examDate: '',
        startTime: '',
        endTime: '',
        totalScore: 0,
    });
    const [allocatedScore, setAllocatedScore] = useState(0);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Fetch exam details by ID
        const fetchExamDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/admin/get-exam/${examId}`);
                if (response.data.success) {
                    setExamDetails(response.data.exam);
                    setAllocatedScore(response.data.exam.totalAllocatedScore || 0);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError('Failed to fetch exam details');
            }
        };

        fetchExamDetails();
    }, [examId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExamDetails({ ...examDetails, [name]: value });
    };

    const handleUpdateExam = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (parseFloat(examDetails.totalScore) < allocatedScore) {
            setError(`Total score cannot be less than the already allocated score (${allocatedScore}).`);
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/admin/update-exam/${examId}`, examDetails);
            if (response.data.success) {
                setSuccessMessage('Exam updated successfully!');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to update exam');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-6 py-8 font-sans">
            <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
                <h2 className="text-3xl font-bold text-center text-[#363f8f] mb-8">Edit Exam: {examId}</h2>
                {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                {successMessage && <div className="text-sm text-green-600 mb-4">{successMessage}</div>}
                <form onSubmit={handleUpdateExam} className="space-y-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                        <input
                            type="text"
                            name="examName"
                            value={examDetails.examName}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                        <input
                            type="date"
                            name="examDate"
                            value={examDetails.examDate}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="time"
                            name="startTime"
                            value={examDetails.startTime}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                            type="time"
                            name="endTime"
                            value={examDetails.endTime}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Total Score</label>
                        <input
                            type="number"
                            name="totalScore"
                            value={examDetails.totalScore}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                        Allocated Score: <span className="text-gray-800">{allocatedScore}</span>
                    </p>
                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-[#4f46e5] hover:bg-[#3e37c9] text-white font-bold text-sm py-2 px-6 rounded-lg shadow-md transition duration-200"
                        >
                            Update Exam
                        </button>
                        <button
                            type="button"
                            className="bg-[#e41f3a] hover:bg-red-600 text-white font-bold text-sm py-2 px-6 rounded-lg shadow-md transition duration-200"
                            onClick={() => navigate('/manage-exams')}
                        >
                            Back to Manage Exams
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditExam;
