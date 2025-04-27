import React from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./DisplayQuestions.css";
import { decryptData } from '../../cryptoUtils.jsx';

const DisplayQuestions = () => {
  const mentorId = decryptData(localStorage.getItem("Mentors"));
  const location = useLocation();
  const { Tags, data, subTopics, previousSubTopics, subject, batch, dayOrder } =
    location.state || {}; // Ensure safe extraction of data

  if (!data || !data.questions) {
    return (
      <h2 className="text-red-600 text-center text-xl">
        No Questions Available
      </h2>
    );
  }

  const { questions } = data;
  const mcqCount = questions.MCQs?.length || 0;
  const codingCount = questions.Coding?.length || 0;

  // Count difficulty levels in coding questions
  const difficultyCount = {
    easy: questions.Coding?.filter((q) => q.Difficulty === "Easy").length || 0,
    medium:
      questions.Coding?.filter((q) => q.Difficulty === "Medium").length || 0,
    hard: questions.Coding?.filter((q) => q.Difficulty === "Hard").length || 0,
  };

  const handleConfirm = async () => {
    const payload = {
      dayOrder,
      subject,
      batch,
      subTopics,
      previousSubTopics,
      mentorId,

      totalMCQs: mcqCount,
      mcqDifficulty: {
        easy:
          questions.MCQs?.filter((q) => q.Difficulty === "Easy").length || 0,
        medium:
          questions.MCQs?.filter((q) => q.Difficulty === "Medium").length || 0,
        hard:
          questions.MCQs?.filter((q) => q.Difficulty === "Hard").length || 0,
      },

      totalCodingQuestions: codingCount,
      codingDifficulty: {
        easy:
          questions.Coding?.filter((q) => q.Difficulty === "Easy").length || 0,
        medium:
          questions.Coding?.filter((q) => q.Difficulty === "Medium").length ||
          0,
        hard:
          questions.Coding?.filter((q) => q.Difficulty === "Hard").length || 0,
      },
      Tags: Tags,
    };


    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/store-daily-exam-questions`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // If the request succeeds (e.g., status code 200 or 201)
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message,
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      // Check if the error response exists
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // If it's a conflict error (409), you might want to display a warning instead
        if (error.response.status === 409) {
          Swal.fire({
            icon: "warning",
            title: "Failed",
            text: error.response.data.message,
            confirmButtonColor: "#f39c12",
          });
        } else {
          // For other errors, display an error message
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response.data.message,
            confirmButtonColor: "#d33",
          });
        }
      } else {
        // Fallback error message if error.response is undefined
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred. Please try again.",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  return (
    <div className="min-h-screen h-full bg-[#F1FAEE] p-4">
      {/* Summary Section */}
      <div className="bg-[#A8DADC] text-black p-8 rounded-xl shadow-lg mb-6">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Summary Overview
        </h2>

        {/* Centering Grid with Bigger Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* MCQ Breakdown Section */}
            <div className="bg-white p-6 w-80 rounded-xl shadow-lg border border-green-400 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">
                MCQ Breakdown
              </h3>
              <p className="text-gray-700 text-lg text-center">
                <strong>Total MCQs:</strong>{" "}
                <span className="text-blue-700">{mcqCount}</span>
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-lg">
                  <p className="text-green-600 font-semibold"> Easy</p>
                  <p className="text-gray-700">
                    {questions.MCQs?.filter((q) => q.Difficulty === "Easy")
                      .length || 0}
                  </p>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <p className="text-yellow-600 font-semibold">Medium</p>
                  <p className="text-gray-700">
                    {questions.MCQs?.filter((q) => q.Difficulty === "Medium")
                      .length || 0}
                  </p>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <p className="text-red-600 font-semibold">Hard</p>
                  <p className="text-gray-700">
                    {questions.MCQs?.filter((q) => q.Difficulty === "Hard")
                      .length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Coding Breakdown Section */}
            <div className="bg-white p-6 w-80 rounded-xl shadow-lg border border-purple-400 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-purple-800 mb-4 text-center">
                Coding Breakdown
              </h3>
              <p className="text-gray-700 text-lg text-center">
                <strong>Total Coding Questions:</strong>{" "}
                <span className="text-blue-700">{codingCount}</span>
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-lg">
                  <p className="text-green-600 font-semibold">Easy</p>
                  <p className="text-gray-700">
                    {questions.Coding?.filter((q) => q.Difficulty === "Easy")
                      .length || 0}
                  </p>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <p className="text-yellow-600 font-semibold">Medium</p>
                  <p className="text-gray-700">
                    {questions.Coding?.filter((q) => q.Difficulty === "Medium")
                      .length || 0}
                  </p>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <p className="text-red-600 font-semibold">Hard</p>
                  <p className="text-gray-700">
                    {questions.Coding?.filter((q) => q.Difficulty === "Hard")
                      .length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="mt-8 text-center">
          <button onClick={handleConfirm} className="animated-button">
            <span>Confirm</span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Container for MCQ Questions */}
      <div className="bg-[#A8DADC] text-black p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          MCQ Questions
        </h2>

        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-sky-300">
                <tr>
                  <th className="px-4 py-3 border-b-2 border-sky-400">No</th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">Tags</th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">
                    Subject
                  </th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">
                    Question
                  </th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">
                    Options
                  </th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">Score</th>
                  <th className="px-4 py-3 border-b-2 border-sky-400">
                    Difficulty
                  </th>
                </tr>
              </thead>
              <tbody>
                {mcqCount > 0 ? (
                  questions.MCQs.map((mcq, index) => (
                    <tr
                      key={index}
                      className="odd:bg-sky-100 even:bg-sky-50 hover:bg-sky-200 transition-colors"
                    >
                      <td className="px-4 py-2 border-b border-sky-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border-b border-sky-400">
                        {mcq.Tags}
                      </td>
                      <td className="px-4 py-2 border-b border-sky-400">
                        {mcq.Subject}
                      </td>
                      <td className="px-4 py-2 border-b border-sky-400">
                        {mcq.Question}
                      </td>
                      <td className="px-4 py-2 border-b border-sky-400">
                        {Object.entries(mcq.Options).map(([key, value]) => (
                          <div
                            key={key}
                            className={
                              mcq.Correct_Option === key
                                ? "text-green-600 font-bold"
                                : ""
                            }
                          >
                            {`${key}) ${value}`}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-2 border-b border-sky-400">
                        {mcq.Score}
                      </td>
                      <td className="px-4 py-2 border-b border-sky-400">
                        {mcq.Difficulty}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center px-4 py-2 border-b border-sky-400 text-gray-500"
                    >
                      No MCQ Questions Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Container for Coding Questions */}
      <div className="bg-[#A8DADC] text-black p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-xl font-semibold mb-4 text-red-900">
          Coding Questions
        </h2>

        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-[#9B1B30]">
                <tr>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">No</th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">Tags</th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">Subject</th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">
                    Question
                  </th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">
                    Constraint
                  </th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">
                    Sample Input
                  </th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">
                    Sample Output
                  </th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">Score</th>
                  <th className="px-4 py-3 border-b-2 bg-[#964855]">
                    Difficulty
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.questions.Coding?.length > 0 ? (
                  data.questions.Coding.map((code, index) => (
                    <tr
                      key={index + 1}
                      className="odd:bg-red-100 even:bg-red-50 hover:bg-red-200 transition-colors"
                    >
                      <td className="px-4 py-2 border-b border-red-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Tags}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Subject}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Question}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Constraints}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Sample_Input}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Sample_Output}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Score}
                      </td>
                      <td className="px-4 py-2 border-b border-red-400">
                        {code.Difficulty}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center px-4 py-2 border-b border-red-400 text-gray-500"
                    >
                      No Coding Questions Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayQuestions;
