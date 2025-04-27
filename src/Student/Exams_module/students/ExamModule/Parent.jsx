import React, { useEffect, useContext, useRef } from "react";
import { ExamContext } from "./ExamContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QNavigation from "./QNavigation";
import { ExamLegend } from "./ExamLegend";
import { DisplayMCQ } from "./DisplayMCQ";
import { DisplayCoding } from "./DisplayCoding";
import { NavigationMCq } from "./NavigationMCQ";
import { NavigationCoding } from "./NavigationCoding";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import { FaUserCircle } from "react-icons/fa";

const ExamContent = () => {
  const {
    examData,
    selectedMCQ,
    codingQuestions,
    handleSubmit,
    studentName,
    studentExamId,
    totalScore,
    isSubmitting,
    submissionComplete,
    setSubmissionComplete,
    examType,
  } = useContext(ExamContext);

  const { profilePicture } = useStudent();
  const navigate = useNavigate();

  const safeSubmit = async () => {
    if (isSubmitting) return;
    try {
      const response = await handleSubmit();
      toast.success("Exam submitted successfully!");
      navigate("/exam-analysis", {
        state: { analysis: response?.data, examId: examData?.exam?.examId },
      });
    } catch (error) {
      toast.error("Exam submission failed! Returning to dashboard.");
      setSubmissionComplete(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
      }
      navigate("/exam-dashboard", { replace: true });
    }
  };

  useEffect(() => {
    // Only attach event listeners if the exam isn't submitted
    if (!submissionComplete) {
      const handleContextMenu = (e) => {
        e.preventDefault();
        toast.warn("Right-click is disabled!");
      };
      const handleCopy = (e) => {
        e.preventDefault();
        toast.warn("Copy is disabled!");
      };
      const handleCut = (e) => {
        e.preventDefault();
        toast.warn("Cut is disabled!");
      };
      const handlePaste = (e) => {
        e.preventDefault();
        toast.warn("Paste is disabled!");
      };
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          toast.error(
            "Full screen exited or Escape pressed. Auto-submitting exam."
          );
          safeSubmit();
        }
        if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key === "r")) {
          e.preventDefault();
          toast.error("Reload is disabled during the exam!");
        }
        if (
          e.key === "F12" ||
          ((e.ctrlKey || e.metaKey) &&
            e.shiftKey &&
            ["i", "j"].includes(e.key.toLowerCase()))
        ) {
          e.preventDefault();
          toast.error("Opening DevTools is not allowed!");
          safeSubmit();
        }
      };
      const handleVisibilityChange = () => {
        if (document.hidden) {
          toast.error("Tab switch detected. Auto-submitting exam.");
          safeSubmit();
        }
      };
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
        toast.error("Navigating back is disabled!");
      };
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          toast.error("Full screen mode exited. Auto-submitting exam.");
          safeSubmit();
        }
      };

      // Register all the event listeners
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("copy", handleCopy);
      document.addEventListener("cut", handleCut);
      document.addEventListener("paste", handlePaste);
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Prevent Back button navigation
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);

      // Warn user if they try to close/refresh the page
      window.addEventListener("beforeunload", handleBeforeUnload);

      // Listen for exiting fullscreen
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      // Cleanup: remove listeners if exam is submitted or component unmounts
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("cut", handleCut);
        document.removeEventListener("paste", handlePaste);
        window.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    }
  }, [submissionComplete, safeSubmit]);

  // Show loading state if no exam data
  if (!examData && !submissionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <p className="text-2xl font-semibold text-blue-600">
          Loading exam... <span className="animate-spin">⏳</span>
        </p>
      </div>
    );
  }

  // Main exam UI
  return (
    <div className="min-h-screen h-full parent bg-[#F8F8F8] flex flex-col justify-between overflow-hidden relative">
      <div>
        <div className="stuent-n-exam-details">
          <div className="flex flex-row justify-evenly gap-1 px-4">
            <div className="flex flex-row justify-evenly items-center test-details bg-white w-3/4 mt-2 ml-2 mr-0.5 MCQ_Stats rounded-md text-center p-0.5 text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
              <span>
                <img className="w-44" src="/ExamModule/exam-logo.svg" alt="" />
              </span>
              <span className="flex flex-row gap-4 items-center">
                <img src="/ExamModule/book.svg" alt="" />
                <span className="font-bold text-[#132EE0]">{examType}</span>
              </span>
              <span>
                <span className="text-[#132EE0] font-semibold">Marks:</span>
                <span>{totalScore}</span>
              </span>
            </div>

            <div className="p-2 student-details flex flex-row justify-evenly items-center bg-white w-full mt-2 mr-2 ml-0.5 MCQ_Stats rounded-md text-center text-2xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 "
                />
              ) : (
                <FaUserCircle className="w-20 bg-gray-100 rounded-full flex items-center justify-center text-blue-500 text-5xl" />
              )}
              <div className="flex flex-col justify-start items-start">
                <h1 className="text-3xl">{studentName}</h1>
                <div className="text-sm">
                  <b>Exam Id: </b>
                  {studentExamId}
                </div>
              </div>
              <div className="flex flex-row gap-4 justify-evenly items-center answered">
                <button
                  type="button"
                  onClick={safeSubmit}
                  disabled={isSubmitting || submissionComplete}
                  className={`text-white w-48 h-12 rounded-lg font-normal text-xl ${
                    isSubmitting || submissionComplete
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-[#ED1334]"
                  }`}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : submissionComplete
                    ? "Submitted"
                    : "Submit Test"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mcq-n-coding-section flex flex-col h-full mt-2 p-4">
          {!selectedMCQ && codingQuestions.length > 0 ? (
            <div className="flex flex-row gap-2">
              <DisplayCoding />
              <NavigationCoding safeSubmit={safeSubmit} />
            </div>
          ) : (
            <div className="flex flex-row gap-2">
              <DisplayMCQ />
              <NavigationMCq safeSubmit={safeSubmit} />
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="nav-n-legend flex flex-col items-center px-4 ">
          <QNavigation />
          <ExamLegend />
        </div>
      </div>
    </div>
  );
};

export const Parent = () => {
  return <ExamContent />;
};

export default Parent;
