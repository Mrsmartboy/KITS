import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const HalfDoughnutChart = ({ totalScore, maximumScore }) => {
  // Ensure no division by zero
  const validMax = maximumScore > 0 ? maximumScore : 1;

  // Data for Chart.js
  const data = {
    labels: ["Scored", "Remaining"],
    datasets: [
      {
        data: [totalScore, Math.max(0, validMax - totalScore)],
        backgroundColor: ["#4ade80", "#d4d4d4"], // Green and Gray
        hoverBackgroundColor: ["#22c55e", "#e2e2e2"],
      },
    ],
  };

  // Chart options: Semi-circle effect
  const options = {
    rotation: -90, // Start from bottom
    circumference: 180, // Show only the top half
    cutout: "80%", // Controls thickness of the arc
    plugins: {
      legend: { display: false }, // Hide external legend
      tooltip: { enabled: false }, // Enable tooltips
    },
  };

  return (
    <div
      className="relative flex justify-center items-center"
      style={{ width: "16rem", height: "10rem" }}
    >
      <Doughnut data={data} options={options} />
      {/* Inner Text Display */}
      <div className="absolute mt-4 top-1/2 transform -translate-y-1/2 text-center">
        <p className="text-lg font-semibold text-gray-700">Score</p>
        <p className="text-xl font-bold text-green-600">
          {totalScore} / {maximumScore}
        </p>
      </div>
    </div>
  );
};

export default HalfDoughnutChart;
