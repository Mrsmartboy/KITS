import React, { useState, useEffect } from "react";
import CreateExamModal from "./CreateExamModal";
import TopPerformers from "./TopPerformers";
import ExamDetails from "./ExamDetails";
import "./styles.css";

const SurpriseExams = () => {
  const [exams, setExams] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/surprise-exams")
      .then((res) => res.json())
      .then((data) => setExams(data));
  }, []);

  const handleViewDetails = (examId) => {
    fetch(`/api/surprise-exams/${examId}`)
      .then((res) => res.json())
      .then((data) => setExamDetails(data));
  };

  const handleCreateExamClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="exams-container">
      <div className="header">
        <h2>Surprise Exams</h2>
        <button className="create-exam-btn" onClick={handleCreateExamClick}>
          Create Surprise Exam
        </button>
      </div>
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
      <TopPerformers category="Surprise Exams" />
      {examDetails && <ExamDetails data={examDetails} />}
      {showModal && <CreateExamModal closeModal={closeModal} />}
    </div>
  );
};

export default SurpriseExams;
