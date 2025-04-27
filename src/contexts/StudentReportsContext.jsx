import React, { createContext, useState, useEffect } from "react";
import { decryptData } from "../../cryptoUtils.jsx";

export const StudentReportsContext = createContext();

export const StudentReportsProvider = ({ children }) => {
  // State variables to hold the exam data
  const [dailyExam, setDailyExam] = useState([]);
  const [monthlyExam, setMonthlyExam] = useState([]);
  const [weeklyExam, setWeeklyExam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve and decrypt the student id from sessionStorage
    const stdId = decryptData(sessionStorage.getItem("id"));
    // Fetch the student reports using the decrypted student id
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/student-reports?stdId=${stdId}`)
      .then((res) => res.json())
      .then((data) => {
        // Destructure the exam data using bracket notation due to hyphenated keys
        const daily = data.results["Daily-Exam"];
        const monthly = data.results["Monthly-Exam"];
        const weekly = data.results["Weekly-Exam"];

        // Store the fetched data in the corresponding state variables
        setDailyExam(daily);
        setMonthlyExam(monthly);
        setWeeklyExam(weekly);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching student reports:", error);
        setLoading(false);
      });
  }, []);

  // The context value that will be supplied to any descendants of this provider.
  const value = {
    dailyExam,
    monthlyExam,
    weeklyExam,
    loading,
  };

  return (
    <StudentReportsContext.Provider value={value}>
      {children}
    </StudentReportsContext.Provider>
  );
};
