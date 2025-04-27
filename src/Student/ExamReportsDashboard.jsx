import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import HalfDoughnutChart from "./HalfDoughnutChart";
import { StudentReportsContext } from "../contexts/StudentReportsContext.jsx";

export const ExamReportsDashboard = () => {
  const { dailyExam, weeklyExam, monthlyExam, loading } = useContext(
    StudentReportsContext
  );
  const navigate = useNavigate();

  // Calculate maximum marks from the exam's paper
  const calculateMaximumMarks = (paper) => {
    let maximumScore = 0;
    if (!paper || paper.length === 0) return 0;

    paper.forEach((subjectPaper) => {
      if (subjectPaper.MCQs && subjectPaper.MCQs.length > 0) {
        maximumScore += subjectPaper.MCQs.reduce(
          (sum, mcq) => sum + Number(mcq.Score),
          0
        );
      }
      if (subjectPaper.Coding && subjectPaper.Coding.length > 0) {
        maximumScore += subjectPaper.Coding.reduce(
          (sum, code) => sum + Number(code.Score),
          0
        );
      }
    });

    return maximumScore;
  };

  // Render exam group cards in a responsive grid
  const renderExamGroup = (groupName, examGroup) => {
    if (!examGroup || examGroup.length === 0) return null;
    return (
      <div key={groupName} className="mb-10">
        <h3 className="text-2xl font-bold text-[#19216F] mb-4">{groupName}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-center">
          {examGroup.map((exam) => {
            const totalScore = exam.analysis?.totalScore || 0;
            const maxScore = calculateMaximumMarks(exam.paper);
            const correctCount = exam.analysis?.correctCount || 0;
            const incorrectCount = exam.analysis?.incorrectCount || 0;
            const attempted = exam["attempt-status"];

            return (
              <div
                key={exam._id}
                className="bg-white rounded-xl shadow-lg flex flex-col items-center transition my-4 w-[300px]"
              >
                <div className="w-full rounded-t-lg px-4 py-2 text-2xl text-white font-bold bg-[#19216f]">
                  {exam.examName}
                </div>
                {attempted ? (
                  <>
                    <div className="flex flex-col px-4 py-4 items-center">
                      <HalfDoughnutChart
                        totalScore={totalScore}
                        maximumScore={maxScore}
                      />
                      <div className="flex flex-row gap-4 mt-4">
                        <p className="text-green-600 font-semibold text-xl">
                          Correct: {correctCount}
                        </p>
                        <p className="text-red-600 font-semibold text-xl">
                          Incorrect: {incorrectCount}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem("Analysis", JSON.stringify(exam));
                        navigate("/exam-analysis", {
                          state: { isReports: true },
                        });
                      }}
                      type="button"
                      className="mb-4 px-5 py-2 bg-[#19216f] text-white font-medium rounded-lg text-lg hover:bg-[#141a52] transition-colors"
                    >
                      View Detailed Analysis
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col justify-center items-center h-full w-full px-4 pb-4 text-3xl text-center text-red-500">
                    <h1>Did Not</h1>
                    <h1>Attempt Exam</h1>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-12 bg-gray-100 min-h-screen">
      {/* Back Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          &larr; Back
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <>
          {renderExamGroup("Daily-Exam", dailyExam)}
          {renderExamGroup("Weekly-Exam", weeklyExam)}
          {renderExamGroup("Monthly-Exam", monthlyExam)}
        </>
      )}
    </div>
  );
};

export default ExamReportsDashboard;
