import React, { useState, useEffect } from "react";
import TopPerformers from "./TopPerformers";
import ExamDetails from "./ExamDetails";
import "./styles.css";

const GrandExams = () => {
  const [exams, setExams] = useState([]);
  const [examDetails, setExamDetails] = useState(null);

  useEffect(() => {
    fetch("/api/grand-exams")
      .then((res) => res.json())
      .then((data) => setExams(data));
  }, []);

  const handleViewDetails = (examId) => {
    fetch(`/api/grand-exams/${examId}`)
      .then((res) => res.json())
      .then((data) => setExamDetails(data));
  };

  return (
    <div className="exams-container">
      <h2>Grand Exams</h2>
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
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.date}</td>
              <td>{exam.questions}</td>
              <td>{exam.studentsAttempted}</td>
              <td>{exam.averageScore}%</td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => handleViewDetails(exam.id)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TopPerformers category="Grand Exams" />
      {examDetails && <ExamDetails data={examDetails} />}
    </div>
  );
};

export default GrandExams;
