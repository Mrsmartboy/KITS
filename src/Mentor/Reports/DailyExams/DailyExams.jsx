import React, { useEffect, useState } from "react";
import "./styles.css";

const DailyExams = () => {
  const [examData, setExamData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    // Fetch dynamic exam data
    const fetchExamData = async () => {
      try {
        const response = await fetch("/api/daily-exams"); // Replace with your API endpoint
        const data = await response.json();
        setExamData(data.exams);
        setTopPerformers(data.topPerformers);
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    fetchExamData();
  }, []);

  return (
    <div className="exams-container">
      <h2>Daily Exams</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Questions</th>
            <th>Students Attempted</th>
            <th>Average Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examData.length > 0 ? (
            examData.map((exam, index) => (
              <tr key={index}>
                <td>{exam.date}</td>
                <td>{exam.questions}</td>
                <td>{exam.studentsAttempted}</td>
                <td>{exam.averageScore}%</td>
                <td>
                  <button className="action-btn">View Details</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No exams available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Top Performers in Daily Exams</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {topPerformers.length > 0 ? (
            topPerformers.map((performer, index) => (
              <tr key={index}>
                <td>{performer.rank}</td>
                <td>{performer.name}</td>
                <td>{performer.score}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No top performers available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DailyExams;
