import React, { useContext, useEffect, useState } from "react";
import { ExamContext } from "./ExamContext";

const CountdownTimer = ({ safeSubmit }) => {
  const { examData } = useContext(ExamContext);

  // Extract exam details safely
  const totalExamTime = examData?.exam?.totalExamTime || 0;
  const startTime = examData?.exam?.startTime;
  const startDate = examData?.exam?.startDate;

  const [examEndTimestamp, setExamEndTimestamp] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (startDate && startTime && totalExamTime) {
      const examStartTimestamp = new Date(
        `${startDate}T${startTime}`
      ).getTime();
      const endTimestamp = examStartTimestamp + totalExamTime * 60 * 1000;
      setExamEndTimestamp(endTimestamp);

      const calculateRemainingTime = () => {
        const now = Date.now();
        return Math.max(0, Math.floor((endTimestamp - now) / 1000));
      };

      setTimeLeft(calculateRemainingTime());
    }
  }, [startDate, startTime, totalExamTime]);

  // Start the countdown timer
  useEffect(() => {
    if (!examEndTimestamp) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = Math.max(
          0,
          Math.floor((examEndTimestamp - Date.now()) / 1000)
        );
        if (newTimeLeft <= 0) {
          clearInterval(intervalId);
          safeSubmit(); // Auto-submit only when the timer reaches zero
        }
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [examEndTimestamp, safeSubmit]);

  if (examEndTimestamp === null) {
    return (
      <div className="text-center p-4 text-red-500">Loading exam data...</div>
    );
  }

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-2xl w-full19216f bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className="text-center bg-[#19216F] text-white font-bold py-2 rounded-t-lg">
        Time Left
      </div>
      <div className="p-4">
        <div className="flex flex-row items-center justify-center space-x-6 p-2">
          <img src="ExamModule/clock-2.svg" alt="Clock" className="w-12 h-12" />
          <div className="flex flex-col items-center">
            <span className="font-bold">{String(hours).padStart(2, "0")}</span>
            <span className="text-sm text-gray-600">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-600">Minutes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">
              {String(seconds).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-600">Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
