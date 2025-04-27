import React, { useEffect } from "react";
import { QuestionBreakDown } from "./QuestionBreakDown";
import DoughnutChart from "./DoughnutChart";
import { Attempted } from "./Attempted";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import Confetti from "react-confetti";
import SubjectBreakdown from "./SubjectBreakdown";

export const ExamAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract exam data from location.state (from daily reports or from new submission)
  const exam = location.state?.exam || null; // from DailyReports
  const submissionResult = location.state?.analysis || null; // from a fresh submission
  const isReports = location.state?.isReports || false;

  // Determine which data source to use
  const analysisData = exam || submissionResult;

  // Redirect if no data or invalid analysis
  useEffect(() => {
    if (!analysisData || !analysisData.analysis) {
      toast.error("No exam analysis data available. Redirecting to dashboard...");
      navigate("/exam-dashboard");
    }
  }, [analysisData, navigate]);

  // Handle manual back-button navigation
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (isReports) {
        navigate("/daily-exam-reports", { replace: true });
      } else {
        navigate("/exam-dashboard", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, isReports]);

  // If no valid data, stop rendering
  if (!analysisData || !analysisData.analysis) {
    return null;
  }

  // Extract the actual analysis + exam name
  const analysis = analysisData.analysis;
  const examName = exam ? exam.examName : "Exam Submission";

  // Compute incorrect answers if not provided
  const incorrectAnswers =
    analysis.incorrectCount ??
    analysis.totalQuestions - analysis.correctCount - analysis.notAttemptedCount;

  // Calculate the user's percentage score
  const percentageScore = Math.round(
    (analysis.correctCount / analysis.totalQuestions) * 100
  );

  // Extract subject-wise breakdown
  const subjectBreakdown = analysis.subjectBreakdown || {};

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5 mt-0 font-[Inter]">
      {/* Show confetti only if 80%+ AND not from 'Reports' */}
      {percentageScore >= 80 && !isReports && (
        <Confetti numberOfPieces={3500} recycle={false} />
      )}

      {/* Back button */}
      <div className="mt-6 flex gap-4">
        <button
          className="bg-[#19216F] text-white px-4 py-2 rounded hover:bg-[#0f153f] flex items-center gap-2"
          onClick={() =>
            navigate(isReports ? "/daily-exam-reports" : "/exam-dashboard")
          }
        >
          <FaArrowLeft size={24} />
          Back to {isReports ? "Reports" : "Dashboard"}
        </button>
      </div>

      <div className="text-[#19216F] text-center font-semibold text-2xl md:text-3xl mt-5 mb-3 pt-2">
        {examName} Analysis
      </div>
      <hr />

      <div className="p-2 md:p-4">
      <div className="grid md:grid-cols-10 gap-x-6 ">
    <div className="md:col-span-7 ">
      <DoughnutChart
        totalQuestions={analysis.totalQuestions}
        correctAnswers={analysis.correctCount}
        incorrectAnswers={incorrectAnswers}
        totalScore={analysis.totalScore}
      />
    </div>
    <div className="md:col-span-3">
      <Attempted
        attemptedMCQ={analysis.attemptedMCQCount}
        attemptedCode={analysis.attemptedCodeCount}
      />
    </div>
  </div>


        {subjectBreakdown && Object.keys(subjectBreakdown).length > 0 && (
          <div>
            <SubjectBreakdown subjectBreakdown={subjectBreakdown} />
          </div>
        )}

        {/* Attempted Questions */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2 text-[#19216F]">
            Attempted Questions
          </h2>
          <QuestionBreakDown details={analysis.details} />
        </div>

        {/* Not Attempted Questions */}
        {analysis.notAttemptedDetails?.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2 text-[#19216F]">
              Not Attempted Questions
            </h2>
            <QuestionBreakDown details={analysis.notAttemptedDetails} />
          </div>
        )}

        {/* Another Back button near the bottom */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            className="bg-[#19216F] text-white px-4 py-2 rounded hover:bg-[#0f153f] flex items-center gap-2"
            onClick={() =>
              navigate(isReports ? "/daily-exam-reports" : "/exam-dashboard")
            }
          >
            <FaArrowLeft size={24} />
            Back to {isReports ? "Reports" : "Dashboard"}
          </button>
        </div>
      </div>

      {/* Optionally show any message from submissionResult */}
      {submissionResult?.message && (
        <div className="text-center text-xl font-semibold mt-4">
          {submissionResult.message}
        </div>
      )}
    </div>
  );
};

export default ExamAnalysis;