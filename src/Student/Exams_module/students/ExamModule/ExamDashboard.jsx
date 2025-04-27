import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Loader } from "lucide-react";
import { useStudent } from "../../../../contexts/StudentProfileContext.jsx";
import { useNavigate } from "react-router-dom";
import { ExamContext } from "./ExamContext.jsx";
import ExamCountdownTimer from "./ExamCountDownTimer.jsx";
import InstructionsModal from "./InstructionsModal.jsx";
import { decryptData } from "../../../../../cryptoUtils.jsx";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { toast } from "react-toastify"; // Added for error notifications
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FaBook } from "react-icons/fa";

const ExamDashboard = () => {
  const { setExamData, examData } = useContext(ExamContext); // Added examData
  const { studentDetails, loading: studentLoading } = useStudent();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startLoading, setStartLoading] = useState(false); // Added for start button

  const [selectedExam, setSelectedExam] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Pagination state for each category
  const [activePage, setActivePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [finishedPage, setFinishedPage] = useState(1);
  const examsPerPage = 8;

  const location = decryptData(sessionStorage.getItem("location"));
  const studentId = decryptData(sessionStorage.getItem("student_id"));
  const Id = decryptData(sessionStorage.getItem("id"));
  const batch = studentDetails?.BatchNo;
  const navigate = useNavigate();

  // 1. Fetch all available exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/get-available-exams?studentId=${Id}`
        );
        if (
          response.data.success &&
          response.data.exams &&
          response.data.exams["Daily-Exam"]
        ) {
          setExams(response.data.exams["Daily-Exam"]);
        } else {
          setError(response.data.message || "No exams found.");
        }
      } catch (err) {
        setError("No exams found");
      } finally {
        setLoading(false);
      }
    };

    if (batch && location && Id) {
      // Added Id to condition
      fetchExams();
    }
  }, [batch, location, Id]);

  // 2. Categorize exams into active, upcoming and finished.
  const categorizeExams = () => {
    const now = new Date();
    const active = [];
    const upcoming = [];
    const finished = [];

    exams.forEach((exam) => {
      const examStart = new Date(`${exam.startDate}T${exam.startTime}`);
      const examEnd = new Date(
        examStart.getTime() + exam.totalExamTime * 60000
      );

      if (now >= examStart && now <= examEnd) {
        active.push(exam);
      } else if (now < examStart) {
        upcoming.push(exam);
      } else {
        finished.push(exam);
      }
    });

    return { active, upcoming, finished };
  };

  const { active, upcoming, finished } = categorizeExams();

  // Calculate total pages for each category
  const activeTotalPages = Math.ceil(active.length / examsPerPage);
  const upcomingTotalPages = Math.ceil(upcoming.length / examsPerPage);
  const finishedTotalPages = Math.ceil(finished.length / examsPerPage);

  // Get paginated items for each category
  // Get paginated items for each category
  const activeExamsToShow = active.slice(
    (activePage - 1) * examsPerPage,
    activePage * examsPerPage
  );
  const upcomingExamsToShow = upcoming.slice(
    (upcomingPage - 1) * examsPerPage,
    upcomingPage * examsPerPage
  );

  // Sort and paginate finished exams (DESCENDING)
  const finishedSorted = [...finished].sort((a, b) => {
    const dateA = new Date(`${a.startDate}T${a.startTime}`);
    const dateB = new Date(`${b.startDate}T${b.startTime}`);
    return dateB - dateA;
  });
  const finishedExamsToShow = finishedSorted.slice(
    (finishedPage - 1) * examsPerPage,
    finishedPage * examsPerPage
  );

  // 3. Show instructions modal for an exam.
  const handleShowInstructions = (exam) => {
    setSelectedExam(exam);
    setShowInstructions(true);
  };

  // 4. Start the exam after agreeing to instructions.
  const handleStartExam = async () => {
    if (!selectedExam) return;

    // Check if an exam is already in progress
    if (examData) {
      console.warn("An exam is already in progress:", examData);
      toast.error(
        "Finish or submit the current exam before starting a new one."
      );
      return;
    }

    const examId = selectedExam.examId;
    const collectionName = selectedExam.examName
      .split("-")
      .slice(0, -1)
      .join("-");

    try {
      setStartLoading(true); // Indicate loading
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request failed:", err);
          toast.warn("Fullscreen mode unavailable. Proceeding anyway.");
        });
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/startexam`,
        { examId, collectionName }
      );

      if (response.data.success) {
        setExamData(response.data); // Updates shared context
      } else {
        toast.error("Failed to start exam: " + response.data.message);
      }
    } catch (error) {
      toast.error("Error starting exam: " + error.message);
    } finally {
      setStartLoading(false); // Reset loading
    }
  };

  useEffect(() => {
    if (examData) {
      navigate("/conduct-exam");
    }
  }, [examData, navigate]);

  // Inline alert styling for error or "No exams found"
  const alertStyle = "p-3 rounded bg-red-100 text-red-700";

  // Loading & error states
  if (loading || studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-3xl text-center">
        <div className={alertStyle}>{error}</div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center text-3xl">
        <div className={alertStyle}>No exams found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-4 md:px-8 lg:px-12 font-[inter]">
      {/* ==================== ACTIVE EXAMS ==================== */}
      {active.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#19216F] mb-3 flex items-center gap-2 text-xl">
            <img className="w-8" src="/ExamModule/book.svg" alt="Exam Icon" />
            Active Exams
          </h3>
          <div className="flex flex-col md:flex-row">
            {/* Left side: Card Container */}
            {activeExamsToShow.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white shadow-md rounded-lg 
                     sm:w-[48%] 
                     md:w-[48%] 
                     lg:w-[48%]      
                     xl:w-[31%]      
                     2xl:w-[23%] hover:shadow-lg w-[290px]"
              >
                <div className="border-b p-3 bg-[#19216F] text-[#FFFFFF] rounded-t-md">
                  <h2 className="text-lg font-bold">{exam.examName}</h2>
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-3">
                    <div className="flex flex-row justify-evenly">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <img
                            src="/ExamModule/calendar.svg"
                            alt="Date"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Date</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src="/ExamModule/clock.svg"
                            alt="Clock"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Time</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src="/ExamModule/duration.svg"
                            alt="Duration"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">
                            Total Duration
                          </strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaBook className="w-5 h-5 text-gray-700" />{" "}
                          {/* React Icon for Subject */}
                          <strong className="text-gray-700">Subjects</strong>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className="text-gray-600">
                          : {exam.startDate}
                        </span>
                        <span className="text-gray-600">
                          : {exam.startTime}
                        </span>
                        <span className="text-gray-600">
                          : {exam.totalExamTime} mins
                        </span>
                        <span className="text-gray-600">
                          :{" "}
                          {(exam.subjects && exam.subjects.length > 0
                            ? exam.subjects
                            : ["N/A"]
                          ).join(", ")}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShowInstructions(exam)}
                      disabled={exam["attempt-status"] || startLoading} // Disable during loading
                      className={`focus:outline-none text-white font-semibold text-base md:text-lg rounded-lg px-5 py-2.5 ${
                        exam["attempt-status"] || startLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#19216F] hover:bg-[#0f22b4]"
                      }`}
                    >
                      {startLoading
                        ? "Starting..."
                        : exam["attempt-status"]
                        ? "Already Attempted"
                        : "Start Exam"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <img
            src="/ExamModule/student-exam.svg"
            alt="Active Exams"
            className="fixed top-[10%] right-0 xl:w-[25%] lg:w-[35%]  m-4 hidden lg:block"
          />

          {activeTotalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Stack spacing={2}>
                <Pagination
                  count={activeTotalPages}
                  page={activePage}
                  onChange={(e, page) => setActivePage(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </Stack>
            </div>
          )}
        </div>
      )}

      {/* ==================== UPCOMING EXAMS ==================== */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#19216F] mb-3 flex items-center gap-2 text-xl">
            <img className="w-8" src="/ExamModule/book.svg" alt="Exam Icon" />
            Upcoming Exams
          </h3>

          <div className="flex-1 flex flex-wrap gap-6">
            {upcomingExamsToShow.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white shadow-md rounded-lg 
                     w-full 
                     sm:w-[48%] 
                     md:w-[48%] 
                     lg:w-[48%]      
                     xl:w-[31%]      
                     2xl:w-[23%]"
              >
                <div className="border-b p-3 bg-[#19216F] text-[#FFFFFF] rounded-t-md">
                  <h2 className="text-lg font-bold">{exam.examName}</h2>
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-3">
                    <div className="flex flex-row justify-evenly">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                          <img
                            src="/ExamModule/calendar.svg"
                            alt="Date"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Date</strong>
                        </div>
                        <div className="flex gap-2">
                          <img
                            src="/ExamModule/clock.svg"
                            alt="Clock"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Time</strong>
                        </div>
                        <div className="flex gap-2">
                          <img
                            src="/ExamModule/duration.svg"
                            alt="Duration"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">
                            Total Duration
                          </strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaBook className="w-5 h-5 text-gray-700" />{" "}
                          {/* React Icon for Subject */}
                          <strong className="text-gray-700">Subjects</strong>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className="text-gray-600">
                          : {exam.startDate}
                        </span>
                        <span className="text-gray-600">
                          : {exam.startTime}
                        </span>
                        <span className="text-gray-600">
                          : {exam.totalExamTime} mins
                        </span>
                        <span className="text-gray-600">
                          :{" "}
                          {(exam.subjects && exam.subjects.length > 0
                            ? exam.subjects
                            : ["N?A"]
                          ).join(", ")}
                        </span>
                      </div>
                    </div>
                    <ExamCountdownTimer
                      startDate={exam.startDate}
                      startTime={exam.startTime}
                      totalExamTime={exam.totalExamTime}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {upcomingTotalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Stack spacing={2}>
                <Pagination
                  count={upcomingTotalPages}
                  page={upcomingPage}
                  onChange={(e, page) => setUpcomingPage(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </Stack>
            </div>
          )}
        </div>
      )}

      {/* ==================== FINISHED EXAMS ==================== */}
      {finished.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[#19216F] mb-3 flex items-center gap-2 text-xl">
            <img className="w-8" src="/ExamModule/book.svg" alt="Exam Icon" />
            Finished Exams
          </h3>
          <div className="flex flex-wrap gap-6">
            {finishedExamsToShow.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white shadow-md rounded-lg 
                     w-full 
                     sm:w-[48%] 
                     md:w-[48%] 
                     lg:w-[48%]      
                     xl:w-[31%]      
                     2xl:w-[23%]"
              >
                <div className="border-b p-3 bg-[#19216F] text-[#FFFFFF] rounded-t-md">
                  <h2 className="text-lg font-bold">{exam.examName}</h2>
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-3">
                    <div className="flex flex-row justify-evenly">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <img
                            src="/ExamModule/calendar.svg"
                            alt="Date"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Date</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src="/ExamModule/clock.svg"
                            alt="Clock"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">Start Time</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src="/ExamModule/duration.svg"
                            alt="Duration"
                            className="w-5 h-5"
                          />
                          <strong className="text-gray-700">
                            Total Duration
                          </strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaBook className="w-5 h-5 text-gray-700" />{" "}
                          {/* React Icon for Subject */}
                          <strong className="text-gray-700">Subjects</strong>
                        </div>
                        <p className="text-[#ED1334] font-semibold text-center  text-base md:text-xl ">
                          {exam["attempt-status"] ? "Attempted" : "Unattempted"}
                        </p>
                      </div>
                      <div className="flex flex-col justify-center gap-4">
                        <span className="text-gray-600">
                          : {exam.startDate}
                        </span>
                        <span className="text-gray-600">
                          : {exam.startTime}
                        </span>
                        <span className="text-gray-600">
                          : {exam.totalExamTime} mins
                        </span>
                        <span className="text-gray-600 ">
                          :{" "}
                          {(exam.subjects && exam.subjects.length > 0
                            ? exam.subjects
                            : ["N?A"]
                          ).join(", ")}
                        </span>

                        {exam["attempt-status"] ? (
                          <img
                            src="/ExamModule/tick-mark.svg"
                            alt="Completed"
                            className="w-10 h-6 ml-2"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faXmark}
                            style={{ color: "#ef0b0b" }}
                            className="h-8 m-0 p-0"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {finishedTotalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Stack spacing={2}>
                <Pagination
                  count={finishedTotalPages}
                  page={finishedPage}
                  onChange={(e, page) => setFinishedPage(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </Stack>
            </div>
          )}
        </div>
      )}

      {/* ==================== INSTRUCTIONS MODAL ==================== */}
      {showInstructions && (
        <InstructionsModal
          onClose={() => setShowInstructions(false)}
          onAgree={handleStartExam}
        />
      )}
    </div>
  );
};

export default ExamDashboard;
