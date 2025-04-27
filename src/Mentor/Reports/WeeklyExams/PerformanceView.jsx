import React from "react";

const PerformanceView = ({ student }) => {
  return (
    <div className="performance-view">
      <h3>{student.name}'s Performance</h3>
      <div className="performance-container">
        <div className="mini-container">
          <h4>MCQ Score</h4>
          <p>{student.mcqScore}%</p>
        </div>
        <div className="mini-container">
          <h4>Coding Score</h4>
          <p>{student.codingScore}%</p>
        </div>
        <div className="mini-container">
          <h4>Time Taken</h4>
          <p>{student.timeTaken}</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
