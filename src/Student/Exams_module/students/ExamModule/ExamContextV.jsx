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

    // Add a guard to prevent multiple submits
    const [isSubmitting, setIsSubmitting] = useState(false);

    const studentName = studentDetails?.name || "Student Name";
    // Updated: use examId in place of studentExamId if not available
    const studentExamId = examData?.exam.studentExamId || examData?.exam.examId;
    const totalExamTime = examData?.exam.totalExamTime;

    // Calculate totalScore using examData.exam.paper
    const totalScore = examData?.exam.paper.reduce((acc, subject) => {
      const mcqScore = subject.MCQs
        ? subject.MCQs.reduce((sum, q) => sum + q.Score, 0)
        : 0;
      const codingScore = subject.Coding
        ? subject.Coding.reduce((sum, q) => sum + q.Score, 0)
        : 0;
      return acc + mcqScore + codingScore;
    }, 0);

    // Load examData from localStorage once
    useEffect(() => {
      const storedData = localStorage.getItem("examData");
      if (storedData) {
        setExamData(JSON.parse(storedData));
      }
    }, []);
  
    // Extract MCQs and Coding questions for all subjects from examData.exam.paper
    useEffect(() => {
      if (!examData) return;

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
      // Updated: use examName as exam type
      setExamType(examData.exam.examName);
      setMcqQuestions(extractedMCQs);
      setCodingQuestions(extractedCoding);
    }, [examData]);

    // Update MCQ answer
    const updateMcqAnswer = (index, answer) => {
      setMcqQuestions((prevQuestions) => {
        const updated = [...prevQuestions];
        updated[index] = { ...updated[index], answer, answered: true };
        return updated;
      });
    };

    // Update coding answer
    const updateCodingAnswer = (data) => {
      setCodingQuestions((prev) => {
        const updated = [...prev];
        updated[codingIndex] = {
          ...updated[codingIndex],
          ...data,
          answered: true,
        };
        return updated;
      });
    };

    // Go to the previous question, possibly switching sections
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

    // Go to the next question, possibly switching sections
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

    // Mark question for review
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
          updated[codingIndex] = {
            ...updated[codingIndex],
            markedForReview: true,
          };
          return updated;
        });
      }
    };

    // Submit exam data
    const handleSubmit = async () => {
      // GUARD: If already submitting, do nothing
      if (isSubmitting) {
        return;
      }
      setIsSubmitting(true);

      if (!examData) {
        console.error("No exam data available");
        toast.error("No exam data available");
        setIsSubmitting(false);
        return;
      }

      const exam = examData.exam.examName.split("-").slice(0, -1).join("-");
      // Adjust payload keys as necessary.
      const payload = {
        examId: examData.exam.examId,
        exam: exam,
      };

      // Collect MCQ answers
      mcqQuestions.forEach((q) => {
        if (q.answered) {
          payload[q.questionId] = {
            selectedOption: q.answer,
          };
        }
      });

      // Collect coding answers
      codingQuestions.forEach((q) => {
        if (q.answered) {
          payload[q.questionId] = {
            testCaseSummary: q.testCaseSummary || {},
          };
        }
      });

      console.log(payload)
      localStorage.setItem("payload",JSON.stringify(payload))

      try {  
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/submit-exam`,
          payload
        );

        // Exit fullscreen on submission
        if (document.fullscreenElement) {
          document.exitFullscreen().catch((err) => {
            console.error("Error exiting fullscreen:", err);
          });
        }

        if (response.data.success) {
          toast.success("Exam submitted successfully!");
          localStorage.setItem("Analysis", JSON.stringify(response.data));
          navigate("/exam-analysis");

          localStorage.setItem("warnCount", 0);
          localStorage.setItem("examData", "");
        } else {
          toast.error("Submission failed: " + response.data.message);
        }
      } catch (error) {
        toast.error("Error during exam submission: " + error.message);
        console.error("Error during exam submission:", error);
        navigate("/exam-analysis", { state: { error: error.message } });
        localStorage.setItem("warnCount", 0);
      } finally {
        // Optionally allow multiple submissions if needed:
        // setIsSubmitting(false);
      }
    };

    // Current coding question for the online compiler
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
          // State
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
          // Derived
          studentName,
          studentExamId,
          totalExamTime,
          totalScore,

          // Methods
          handlePrevious,
          handleNext,
          handleMarkReview,
          updateMcqAnswer,
          updateCodingAnswer,
          handleSubmit,

          // Online compiler
          onlineCompilerQuestion,  
        }}
      >
        {children}
      </ExamContext.Provider>
    );
  };
