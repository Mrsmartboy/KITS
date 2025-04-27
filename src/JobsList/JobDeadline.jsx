import React, { useState, useEffect } from 'react';

const JobDeadline = ({ deadLine }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const deadlineDate = new Date(deadLine);
      const now = new Date();
      const difference = deadlineDate - now;

      if (difference <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [deadLine]);

  return <p style={{ color: "red" }} ><span className="job-list-key">DeadLine:</span> {timeLeft}</p>;
};

export default JobDeadline;
