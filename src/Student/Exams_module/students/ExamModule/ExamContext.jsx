import React, { createContext, useState, useEffect } from "react";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const navigate = useNavigate();
  const [examType, setExamType] = useState(null);
  const { studentDetails } = useStudent();
  const [examData, setExamData] = useState(null);
  const [existingData, setExistingData] = useState({});
  const [selectedMCQ, setSelectedMCQ] = useState(true);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [codingIndex, setCodingIndex] = useState(0);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentName = studentDetails?.name || "Student Name";
  const studentExamId = examData?.exam?.studentExamId || examData?.exam?.examId;
  const totalExamTime = examData?.exam?.totalExamTime;
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const totalScore = examData?.exam?.paper?.reduce((acc, subject) => {
    const mcqScore = subject.MCQs ? subject.MCQs.reduce((sum, q) => sum + (q.Score || 0), 0) : 0;
    const codingScore = subject.Coding ? subject.Coding.reduce((sum, q) => sum + (q.Score || 0), 0) : 0;
    return acc + mcqScore + codingScore;
  }, 0);

  useEffect(() => {
    if (!examData) return;
    setExistingData({});
    setMcqIndex(0);
    setCodingIndex(0);
    setSelectedMCQ(true);
    const extractedMCQs = [];
    const extractedCoding = [];

    examData.exam.paper.forEach((subject) => {
      if (subject.MCQs?.length > 0) {
        extractedMCQs.push(
          ...subject.MCQs.map((q) => ({
            ...q,
            answered: false,
            markedForReview: false,
            answer: "",
          }))
        );
      }
      if (subject.Coding?.length > 0) {
        extractedCoding.push(
          ...subject.Coding.map((q) => ({
            ...q,
            answered: false,
            markedForReview: false,
            answer: "",
          }))
        );
      }
    });
    setExamType(examData.exam.examName);
    setMcqQuestions(extractedMCQs);
    setCodingQuestions(extractedCoding);
  }, [examData]);

  useEffect(() => {
    if (!examData && !submissionComplete && window.location.pathname.includes("/conduct-exam")) {
      console.log("No examData in ExamProvider, redirecting...");
      toast.error("No exam in progress. Returning to dashboard.");
      navigate("/exam-dashboard", { replace: true });
    }
  }, [examData, submissionComplete, navigate]);

  const updateMcqAnswer = (index, answer) => {
    setMcqQuestions((prevQuestions) => {
      const updated = [...prevQuestions];
      updated[index] = { ...updated[index], answer, answered: true };
      return updated;
    });
  };

  const updateCodingAnswer = (data) => {
    setCodingQuestions((prev) => {
      const updated = [...prev];
      updated[codingIndex] = {
        ...updated[codingIndex],
        ...data,
        sourceCode: data.sourceCode,
        language: data.language,
        answered: true,
      };
      return updated;
    });
  };

  const handlePrevious = () => {
    if (selectedMCQ) {
      if (mcqIndex > 0) {
        setMcqIndex(mcqIndex - 1);
      } else if (codingQuestions.length > 0) {
        setSelectedMCQ(false);
        setCodingIndex(codingQuestions.length - 1);
      }
    } else {
      if (codingIndex > 0) {
        setCodingIndex(codingIndex - 1);
      } else if (mcqQuestions.length > 0) {
        setSelectedMCQ(true);
        setMcqIndex(mcqQuestions.length - 1);
      }
    }
  };

  const handleNext = () => {
    if (selectedMCQ) {
      if (mcqIndex < mcqQuestions.length - 1) {
        setMcqIndex(mcqIndex + 1);
      } else if (codingQuestions.length > 0) {
        setSelectedMCQ(false);
        setCodingIndex(0);
      }
    } else {
      if (codingIndex < codingQuestions.length - 1) {
        setCodingIndex(codingIndex + 1);
      } else if (mcqQuestions.length > 0) {
        setSelectedMCQ(true);
        setMcqIndex(0);
      }
    }
  };

  const handleMarkReview = () => {
    if (selectedMCQ) {
      setMcqQuestions((prev) => {
        const updated = [...prev];
        updated[mcqIndex] = { ...updated[mcqIndex], markedForReview: true };
        return updated;
      });
    } else {
      setCodingQuestions((prev) => {
        const updated = [...prev];
        updated[codingIndex] = { ...updated[codingIndex], markedForReview: true };
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!examData) {
      console.error("No exam data available");
      toast.error("No exam data available");
      setIsSubmitting(false);
      return;
    }

    const examCollection = examData.exam.examName
      .split("-")
      .slice(0, -1)
      .join("-");

    const validQuestionIds = new Set();
    examData.exam.paper.forEach((subject) => {
      if (subject.MCQs?.length > 0) {
        subject.MCQs.forEach((q) => validQuestionIds.add(q.questionId));
      }
      if (subject.Coding?.length > 0) {
        subject.Coding.forEach((q) => validQuestionIds.add(q.questionId));
      }
    });

    const payload = {
      examId: examData.exam.examId,
      exam: examCollection,
    };

    mcqQuestions.forEach((q) => {
      if (q.answered && validQuestionIds.has(q.questionId)) {
        payload[q.questionId] = {
          selectedOption: q.answer,
        };
      }
    });

    codingQuestions.forEach((q) => {
      if (q.answered && validQuestionIds.has(q.questionId)) {
        // Skip if testCaseSummary exists and both passed and failed are 0
        if (
          q.testCaseSummary &&
          q.testCaseSummary.passed === 0 &&
          q.testCaseSummary.failed === 0
        ) {
          return;
        }
        payload[q.questionId] = {
          testCaseSummary: q.testCaseSummary || {},
          sourceCode: q.sourceCode || "",
          language: q.language || "",
        };
      }
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/submit-exam`,
        payload
      );

      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
      }

      if (response.data.success) {
        toast.success("Exam submitted successfully! And Check your Exam Report");
        setExamData(null);
        setSubmissionComplete(true);
        return response;
      } else {
        toast.error("Submission failed: " + response.data.message);
        setSubmissionComplete(true);
        return response;
      }
    } catch (error) {
      toast.error("Error during exam submission: " + error.message);
      console.error("Error during exam submission:", error);
      setSubmissionComplete(false);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCodingQuestion = codingQuestions[codingIndex];
  const onlineCompilerQuestion = currentCodingQuestion
    ? {
        question_id: currentCodingQuestion.questionId,
        description: currentCodingQuestion.Question,
        constraints: currentCodingQuestion.Constraints,
        hidden_test_cases: currentCodingQuestion.Hidden_Test_Cases,
        sample_input: currentCodingQuestion.Sample_Input,
        sample_output: currentCodingQuestion.Sample_Output,
        score: currentCodingQuestion.Score,
        type: currentCodingQuestion.Question_Type,
        difficulty: currentCodingQuestion.Difficulty,
        language: currentCodingQuestion.Subject,
      }
    : {};

  return (
    <ExamContext.Provider
      value={{
        examData,
        setExamData,
        existingData,
        setExistingData,
        mcqQuestions,
        codingQuestions,
        mcqIndex,
        setMcqIndex,
        codingIndex,
        setCodingIndex,
        selectedMCQ,
        setSelectedMCQ,
        isSubmitting,
        examType,
        studentName,
        studentExamId,
        totalExamTime,
        totalScore,
        handlePrevious,
        handleNext,
        handleMarkReview,
        updateMcqAnswer,
        updateCodingAnswer,
        handleSubmit,
        onlineCompilerQuestion,
        submissionComplete,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};