import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditQuestion = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();

    const [questionDetails, setQuestionDetails] = useState({});
    const [options, setOptions] = useState({});
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchQuestionDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/admin/get-question/${questionId}`);
                if (response.data.success) {
                    const questionData = response.data.question;
                    setQuestionDetails(questionData);
                    if (questionData.type === 'MCQ' && questionData.options) {
                        setOptions(questionData.options);
                    }
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError('Failed to fetch question details');
            }
        };

        fetchQuestionDetails();
    }, [questionId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestionDetails({ ...questionDetails, [name]: value });
    };

    const handleOptionChange = (key, value) => {
        setOptions({ ...options, [key]: value });
    };

    const handleUpdateQuestion = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            let updatedDetails = { ...questionDetails };

            if (questionDetails.type === 'MCQ') {
                updatedDetails.options = options;
            }

            delete updatedDetails._id;

            const response = await axios.put(`http://localhost:5000/api/admin/update-question/${questionId}`, updatedDetails);

            if (response.data.success) {
                setSuccessMessage('Question updated successfully!');
                setTimeout(() => navigate(`/manage-questions/${questionDetails.examId}`), 2000);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to update question');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-6 py-8 font-sans">
            <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
                <h2 className="text-3xl font-bold text-center text-[#363f8f] mb-8">Edit Question</h2>
                {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
                {successMessage && <div className="text-sm text-green-600 mb-4">{successMessage}</div>}
                <form onSubmit={handleUpdateQuestion} className="space-y-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <textarea
                            name="question"
                            value={questionDetails.question || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            rows="3"
                            required
                        />
                    </div>
                    {questionDetails.type === 'MCQ' && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-4">Options (for MCQ)</p>
                            {['A', 'B', 'C', 'D'].map((key) => (
                                <div key={key} className="form-group mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Option {key}
                                    </label>
                                    <input
                                        type="text"
                                        value={options[key] || ''}
                                        onChange={(e) => handleOptionChange(key, e.target.value)}
                                        className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Correct Option</label>
                        <select
                            name="correctOption"
                            value={questionDetails.correctOption || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            required
                        >
                            <option value="">Select Correct Option</option>
                            {['A', 'B', 'C', 'D'].map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Score</label>
                        <input
                            type="number"
                            name="allocatedScore"
                            value={questionDetails.allocatedScore || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#363f8f] focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-[#4f46e5] hover:bg-[#3e37c9] text-white font-bold text-sm py-2 px-6 rounded-lg shadow-md transition duration-200"
                        >
                            Update Question
                        </button>
                        <button
                            type="button"
                            className="bg-[#e41f3a] hover:bg-red-600 text-white font-bold text-sm py-2 px-6 rounded-lg shadow-md transition duration-200"
                            onClick={() => navigate(`/manage-questions/${questionDetails.examId}`)}
                        >
                            Back to Manage Questions
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQuestion;
