import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../../../contexts/StudentProfileContext";
import axios from "axios";

const DailyExam = () => {
  const { studentDetails } = useStudent();
  const [loading, setLoading] = useState(false);
  // const [exams, setExams] = useState([]); // Store all exams
  const [categorizedExams, setCategorizedExams] = useState({
    active: [],
    upcoming: [],
    completed: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  // Fetch exams data
  const fetchExams = useCallback(async () => {
    if (!studentDetails?.BatchNo) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/show-exam-paper`,
        {
          params: { batch: studentDetails.BatchNo },
        }
      );

      const currentTime = new Date();

      const categorized = {
        active: [],
        upcoming: [],
        completed: [],
      };

      response.data.examPapers.forEach((exam) => {
        const examStartTime = new Date(`${exam.startDate}T${exam.startTime}`);
        const examEndTime = new Date(
          examStartTime.getTime() + exam.totalExamTime * 60000
        );

        if (currentTime >= examStartTime && currentTime <= examEndTime) {
          categorized.active.push(exam);
        } else if (currentTime < examStartTime) {
          categorized.upcoming.push(exam);
        } else {
          categorized.completed.push(exam);
        }
      });

      // Sort exams by start time for better organization
      categorized.upcoming.sort(
        (a, b) =>
          new Date(a.startDate + "T" + a.startTime) -
          new Date(b.startDate + "T" + b.startTime)
      );
      categorized.active.sort(
        (a, b) =>
          new Date(a.startDate + "T" + a.startTime) -
          new Date(b.startDate + "T" + b.startTime)
      );
      categorized.completed.sort(
        (a, b) =>
          new Date(b.startDate + "T" + b.startTime) -
          new Date(a.startDate + "T" + a.startTime)
      );

      setCategorizedExams(categorized);
    } catch (err) {
      console.error("Error fetching exams:", err.message);
    } finally {
      setLoading(false);
    }
  }, [studentDetails?.BatchNo]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Handle exam start
  const handleStartExam = () => {
    if (acceptedTerms && selectedExam) {
      navigate("/exam-page", {
        state: { examId: selectedExam.examId, batchNo: studentDetails.BatchNo },
      });
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Loading exams...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Daily Exam Dashboard
      </h1>

      {/* Active Exams Section */}
      {categorizedExams.active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Active Exams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorizedExams.active.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white shadow-md rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold">
                  {Object.keys(exam.subjects).join(", ")}
                </h3>
                <p>
                  <strong>Date:</strong> {exam.startDate}
                </p>
                <p>
                  <strong>Time:</strong> {exam.startTime}
                </p>
                <button
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    setShowModal(true);
                    setSelectedExam(exam);
                  }}
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Exams Section */}
      {categorizedExams.upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            Upcoming Exams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorizedExams.upcoming.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white shadow-md rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold">
                  {Object.keys(exam.subjects).join(", ")}
                </h3>
                <p>
                  <strong>Date:</strong> {exam.startDate}
                </p>
                <p>
                  <strong>Time:</strong> {exam.startTime}
                </p>
                <button
                  className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-600 font-medium rounded-lg cursor-not-allowed"
                  disabled
                >
                  Upcoming
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Exams Section */}
      {categorizedExams.completed.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Completed Exams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorizedExams.completed.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white shadow-md rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold">
                  {Object.keys(exam.subjects).join(", ")}
                </h3>
                <p>
                  <strong>Date:</strong> {exam.startDate}
                </p>
                <p>
                  <strong>Time:</strong> {exam.startTime}
                </p>
                <button
                  className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-600 font-medium rounded-lg cursor-not-allowed"
                  disabled
                >
                  Completed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 max-w-2xl rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              Exam Instructions
            </h2>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="acceptTerms" className="ml-2">
              I agree to the terms and conditions.
            </label>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={handleStartExam}
              disabled={!acceptedTerms}
            >
              Start Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyExam;
