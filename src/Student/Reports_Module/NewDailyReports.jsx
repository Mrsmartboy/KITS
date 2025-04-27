import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import DynamicExamCard from './DynamicExamCard';
import { IoArrowBack } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { StudentReportsContext } from "./../../contexts/StudentReportsContext.jsx";

const NewDailyReports = () => {
  const { dailyExam, loading } = useContext(StudentReportsContext);
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef(null);
  const examsPerPage = 16;

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const calculateMaximumMarks = (paper) => { 
    let maximumScore = 0;
    if (!paper || paper.length === 0) return 0;

    paper.forEach((subjectPaper) => {
      if (subjectPaper.MCQs?.length > 0) {
        maximumScore += subjectPaper.MCQs.reduce((sum, mcq) => sum + Number(mcq.Score), 0);
      }
      if (subjectPaper.Coding?.length > 0) {
        maximumScore += subjectPaper.Coding.reduce((sum, code) => sum + Number(code.Score), 0);
      }
    });
    return maximumScore;
  };

  const getScoreDetails = (totalScore, maxScore) => {
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    let color = "#B4B4B4";
    if (percentage >= 80) color = "#129E00";
    else if (percentage >= 30) color = "#FF5900";
    else if (percentage > 0) color = "#FF0000";
    return { percentage: Math.round(percentage), color };
  };

  const prepareExamData = () => {
    if (!dailyExam || dailyExam.length === 0) return [];
    
    let filteredExams = dailyExam.slice();
    
    if (selectedDate) {
      filteredExams = filteredExams.filter(exam => {
        const examDate = new Date(exam.startDate).toLocaleDateString('en-GB');
        return examDate === selectedDate;
      });
    }

    const reversedExams = filteredExams.reverse();
    const startIndex = (currentPage - 1) * examsPerPage;
    const paginatedExams = reversedExams.slice(startIndex, startIndex + examsPerPage);

    return paginatedExams.map(exam => {
      const totalScore = exam.analysis?.totalScore || 0;
      const maxScore = calculateMaximumMarks(exam.paper);
      const { percentage, color } = getScoreDetails(totalScore, maxScore);
      const attempted = exam["attempt-status"];

      return {
        title: exam.examName,
        percentage: attempted ? percentage : 0,
        score: attempted ? `${totalScore}/${maxScore}` : "00/30",
        correct: exam.analysis?.correctCount?.toString() || "0",
        incorrect: exam.analysis?.incorrectCount?.toString() || "0",
        total: exam.analysis?.totalQuestions?.toString() || "0",
        color,
        status: attempted ? null : "Test Not Attempted",
        showStats: attempted,
        showButton: attempted,
        showIcon: !attempted,
        examData: exam
      };
    });
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      // Handle date picker input (yyyy-mm-dd)
      if (inputDate.includes('-')) {
        const [year, month, day] = inputDate.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        setSelectedDate(formattedDate);
      } else {
        // Handle manual text input (dd/mm/yyyy)
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (regex.test(inputDate)) {
          setSelectedDate(inputDate);
        }
      }
      setCurrentPage(1);
    } else {
      setSelectedDate("");
    }
  };

  const openDatePicker = () => {
    dateInputRef.current.showPicker();
  };

  const examData = prepareExamData();
  const totalPages = dailyExam && selectedDate 
    ? Math.ceil(examData.length / examsPerPage) 
    : dailyExam 
      ? Math.ceil(dailyExam.length / examsPerPage) 
      : 0;

  return (
    <div className="w-full font-[inter] mt-8 flex flex-col min-h-screen px-4">
      <div className="w-full max-w-full mx-auto px-4 flex flex-col flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-0 w-full">
          <div 
            onClick={() => navigate("/exam-reports-dashboard")}
            className="w-full sm:w-max flex items-center justify-center sm:justify-start gap-0 px-4 py-2 bg-[#EFF0F7] border-[4px] border-white shadow-[0px_4px_17px_rgba(19,46,224,0.2)] rounded-md"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-sm">
              <span className="text-sm"><IoArrowBack /></span>
            </div>
            <span className="text-[14px] font-medium leading-[17px] text-black">Back</span>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="hidden sm:block text-[14px] font-medium leading-[17px] text-black whitespace-nowrap">
              Select Date
            </label>
            <div className="relative w-full sm:w-[220px] h-[32px]">
              <input
                type="date"
                ref={dateInputRef}
                onChange={handleDateChange}
                className="w-full h-full pl-3 pr-10 text-sm text-black bg-[#EFF0F7] border border-[#19216F] rounded-md outline-none placeholder:text-gray-700 opacity-0 absolute"
              />
              <input
                type="text"
                value={selectedDate}
                onChange={handleDateChange}
                placeholder={isMobile ? "Select a date" : "dd/mm/yyyy"}
                className="w-full h-full pl-3 pr-10 text-sm text-black bg-[#EFF0F7] border border-[#19216F] rounded-md outline-none placeholder:text-gray-700"
              />
              <div 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#19216F] text-[18px] cursor-pointer"
                onClick={openDatePicker}
              >
                <LuCalendarDays />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-start flex-grow items-start mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
            {loading ? (
              <div className="col-span-full text-center">Loading...</div>
            ) : examData.length === 0 && selectedDate ? (
              <div className="col-span-full flex flex-col items-center justify-center h-full text-center">
                <div className="bg-[#EFF0F7] border-2 border-[#19216F] rounded-lg p-6 shadow-[0px_4px_17px_rgba(19,46,224,0.2)]">
                  <p className="text-lg font-medium text-[#19216F] mb-2">
                    No Exams Found
                  </p>
                  <p className="text-sm text-[#353535]">
                    There are no exams available for {selectedDate}.
                  </p>
                  <button
                    onClick={() => setSelectedDate("")}
                    className="mt-4 text-sm text-[#19216F] underline hover:text-[#129E00]"
                  >
                    Clear Date Filter
                  </button>
                </div>
              </div>
            ) : (
              examData.map((exam, index) => (
                <DynamicExamCard 
                  key={index} 
                  {...exam}
                  onViewReport={() => navigate("/exam-analysis", { state: { exam: exam.examData, isReports: true } })}
                />
              ))
            )}
          </div>
        </div>

        {dailyExam && dailyExam.length > examsPerPage && totalPages > 1 && (
          <div className="w-full flex justify-center lg:justify-end mt-1 px-2">
            <div
              className={`h-[64px] flex items-center justify-between px-4 text-[16px] leading-[70px] font-medium text-black font-[inter] ${
                totalPages <= 2 ? 'w-[200px]' : 'w-[270px]'
              }`}
            >
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="hover:underline whitespace-nowrap disabled:opacity-50"
                disabled={currentPage === 1}
              >
                {"< Prev"}
              </button>

              <div className="flex gap-2 items-center">
                {(() => {
                  const pages = [];
                  let start = Math.max(1, currentPage - 1);
                  let end = Math.min(totalPages, start + 2);

                  if (end - start < 2 && start > 1) {
                    start = Math.max(1, end - 2);
                  }

                  if (start > 1) {
                    pages.push(<span key="start-dots">...</span>);
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`hover:underline ${
                          currentPage === i ? "font-bold underline" : ""
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    pages.push(<span key="end-dots">...</span>);
                  }

                  return pages;
                })()}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="hover:underline whitespace-nowrap disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                {"Next >"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewDailyReports;