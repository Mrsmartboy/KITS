import React, { useState, useEffect } from "react";

const TopPerformers = ({ category }) => {
  const [performers, setPerformers] = useState([]);

  useEffect(() => {
    fetch(`/api/top-performers?category=${category}`)
      .then((res) => res.json())
      .then((data) => setPerformers(data));
  }, [category]);

  return (
    <div className="top-performers">
      <h3>Top Performers in Daily Exams{category}</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {performers.map((performer, index) => (
            <tr key={index}>
              <td>{performer.rank}</td>
              <td>{performer.name}</td>
              <td>{performer.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopPerformers;
