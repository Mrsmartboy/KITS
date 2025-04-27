import React, { useState, useEffect, useRef } from "react";

const ExamCountdownTimer = ({ startDate, startTime, totalExamTime }) => {
  // Function to calculate remaining time in milliseconds until exam start
  const calculateTimeLeft = () => {
    const examStart = new Date(`${startDate}T${startTime}`);
    const diff = examStart - new Date();
    return diff > 0 ? diff : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const intervalRef = useRef(null);

  useEffect(() => {
    // Set up the interval only once, and only recalc if startDate or startTime change
    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        window.location.reload();
      }
      setTimeLeft(remaining);
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalRef.current);
  }, [startDate, startTime]);

  // Format the milliseconds into hours, minutes, and seconds
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));

  // Helper to ensure two-digit formatting
  const pad = (num) => num.toString().padStart(2, "0");

  return (
    <div className="bg-[#19216F] text-white font-semibold text-xl rounded-lg px-5 py-2.5 text-center">
      {hours}:{pad(minutes)}:{pad(seconds)}
    </div>
  );
};

export default ExamCountdownTimer;
