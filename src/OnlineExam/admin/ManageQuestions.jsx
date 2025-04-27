import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ManageQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `http://192.168.29.65:5000/api/admin/get-questions/${examId}`
        );
        if (response.data.success) {
          setQuestions(response.data.questions);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to fetch questions.");
      }
    };

    fetchQuestions();
  }, [examId]);

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await axios.delete(
        `http://192.168.29.65:5000/api/admin/delete-question/${questionId}`
      );
      if (response.data.success) {
        setSuccessMessage("Question deleted successfully!");
        setQuestions(questions.filter((q) => q._id !== questionId));
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to delete question.");
    }
  };

  const handleEditQuestion = (questionId) => {
    navigate(`/edit-question/${questionId}`);
  };

  const handleAddQuestion = () => {
    navigate(`/add-questions/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center py-10 px-4">
      <h2 className="text-3xl font-bold text-indigo-800 mb-6">
        Manage Questions for Exam:{" "}
        <span className="text-indigo-600">{examId}</span>
      </h2>
      {error && (
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="text-green-600 bg-green-100 px-4 py-2 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      <button
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition mb-6"
        onClick={handleAddQuestion}
      >
        Add New Question
      </button>
      <div className="overflow-x-auto w-full max-w-6xl bg-white shadow-lg rounded-lg">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border-b border-gray-300">
                Type
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300">
                Question/Statement
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300">
                Options/Test Cases
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300">
                Correct Option
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300">
                Score
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.length > 0 ? (
              questions.map((question) => (
                <tr
                  key={question._id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <td className="px-4 py-3 border-b border-gray-300">
                    {question.type}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-300">
                    {question.type === "MCQ"
                      ? question.question
                      : question.statement}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-300">
                    {question.type === "MCQ"
                      ? Object.entries(question.options || {})
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")
                      : question.testCases}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-300">
                    {question.correctOption || "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-300">
                    {question.score}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-300 flex gap-3">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                      onClick={() => handleEditQuestion(question._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                      onClick={() => handleDeleteQuestion(question._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-gray-500 py-6 border-b border-gray-300"
                >
                  No questions available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        className="mt-6 bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-600 transition"
        onClick={() => navigate("/manage-exam")}
      >
        Back to Manage Exams
      </button>
    </div>
  );
};

export default ManageQuestions;
