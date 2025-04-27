import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { decryptData } from '../../cryptoUtils.jsx';


const DailyContext = createContext();

export const useDaily = () => useContext(DailyContext);

export const DailyProvider = ({ children }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [dailyExam, setDailyExam] = useState(null);
  const studentId = decryptData(sessionStorage.getItem("student_id"));
  const updateStudentDetails = (details) => {
    setStudentDetails(details);
  };

  const fetchDailyExamDetails = useCallback(
    async (batchNo) => {
      if (!batchNo) {
        console.warn("Batch number is missing. Cannot fetch exam details.");
        return setDailyExam(null); // Clear any existing exam details
      }

      const today = new Date().toISOString().split("T")[0];

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/viewexam`, {
          params: { batchNo, studentId, Date: today },
        });


        if (response.data?.exams?.length > 0) {
          const todayExam = response.data.exams.find((exam) => exam.date === today);
          // Only update state if the value has changed
          if (JSON.stringify(todayExam) !== JSON.stringify(dailyExam)) {
            setDailyExam(todayExam || null);
          }
          return todayExam || null;
        }

        console.warn("No exams found for the specified batch and date.");
        setDailyExam(null);
        return null;
      } catch (err) {
        console.error("Error fetching daily exam details:", err.message || "Unknown error");
        setDailyExam(null); // Reset on error
      }
    },
    [studentId, dailyExam] // Include `dailyExam` to compare current state and avoid redundant updates
  );


  const fetchData = useCallback(async () => {
    if (studentDetails?.BatchNo) {
      try {
        await fetchDailyExamDetails(studentDetails.BatchNo);
      } catch (err) {
        console.error("Error during fetchData:", err.message);
      }
    } else {
      console.warn("Student details or batch number missing.");
    }
  }, [fetchDailyExamDetails, studentDetails]);

  useEffect(() => {
    if (studentDetails?.BatchNo) {
      fetchData();
    }
  }, [fetchData, studentDetails]);

  return (
    <DailyContext.Provider
      value={{
        studentDetails,
        updateStudentDetails,
        dailyExam,
        fetchDailyExamDetails,
      }}
    >
      {children}
    </DailyContext.Provider>
  );
};