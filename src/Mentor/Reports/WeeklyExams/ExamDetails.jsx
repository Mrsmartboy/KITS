import React from "react";

const ExamDetails = ({ data }) => {
  return (
    <div className="exam-details">
      <h3>Exam Details</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Score</th>
            <th>Time Taken</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.students.map((student, index) => (
            <tr key={index}>
              <td>{student.name}</td>
              <td>{student.score}%</td>
              <td>{student.timeTaken}</td>
              <td>
                <button className="action-btn">View Performance</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamDetails;
