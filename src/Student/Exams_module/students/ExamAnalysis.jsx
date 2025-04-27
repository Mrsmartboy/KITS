import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ExamAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  // The server's analysis, plus examIDs, etc.
  const { analysis, examID, studentExamId } = location.state || {};

  if (!analysis) {
    return (
      <div className="p-4">
        <p className="mb-2 text-gray-700">No analysis data provided.</p>
        <button
          onClick={() => navigate("/")} // or wherever you want to redirect
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Go Home
        </button>
      </div>
    );
  }
 
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Exam Results
      </h2>
      <div className="mb-4">
        <p className="mb-2">
          <strong>Exam ID:</strong> {examID}
        </p>
        <p className="mb-2">
          <strong>Student Exam ID:</strong> {studentExamId}
        </p>
      </div>

      {/* Overall Analysis */}
      <div className="border border-gray-300 rounded p-4 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          Analysis Details
        </h3>

        {analysis.details && analysis.details.length > 0 ? (
          analysis.details.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded p-3 my-2 bg-gray-50"
            >
              <p>
                <strong>Question ID:</strong> {item.questionId}
              </p>
              <p>
                <strong>Type:</strong> {item.type}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    item.status === "Correct" || item.status === "Passed"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {item.status}
                </span>
              </p>
              <p>
                <strong>Score Awarded:</strong> {item.scoreAwarded}
              </p>

              {item.type === "objective" ? (
                <>
                  <p>
                    <strong>Submitted Answer:</strong> {item.submitted}
                  </p>
                  <p>
                    <strong>Correct Answer:</strong> {item.correctAnswer}
                  </p>
                </>
              ) : (
                // For coding
                <div className="mt-2">
                  <p className="mb-1">
                    <strong>Language:</strong>{" "}
                    {item.submitted?.language || "N/A"}
                  </p>
                  <p className="mb-1">
                    <strong>Source Code:</strong>
                  </p>
                  <textarea
                    className="w-full h-32 border border-gray-300 rounded p-2 text-sm"
                    readOnly
                    value={item.submitted?.sourceCode || ""}
                  />

                  <p className="mt-2 mb-1 font-medium">
                    Output / Test Case Results:
                  </p>
                  <div
                    className="pl-3 text-sm bg-gray-100 rounded p-2"
                    dangerouslySetInnerHTML={{
                      __html: item.submitted?.output || "No Output",
                    }}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No details available.</p>
        )}

        <div className="text-green-700 font-semibold mt-4">
          <p>
            <strong>Total Score:</strong> {analysis.totalScore}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => navigate("/")} // redirect to home or another page
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
