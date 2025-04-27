import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  totalScore,
}) => {
  const data = {
    labels: ["Total Questions", "Correct Answers", "Incorrect Answers"],
    datasets: [
      {
        data: [totalQuestions, correctAnswers, incorrectAnswers],
        backgroundColor: ["#19216f", "#13A725", "#ED1334"],
        hoverBackgroundColor: ["#19216f", "##13A725", "##ED1334"],
        borderWidth: 0,
        cutout: "70%", // Creates the donut effect
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center bg-white rounded-xl shadow-lg  w-full p-2  mb-2">
      {/* Chart */}
      <div className="relative w-48 h-64 mr-5">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-black font-semibold text-lg">Total Score</p>
          <p className="text-black font-bold text-3xl">{totalScore}</p>
        </div>
      </div>

      {/* Legend & Scores */}
      <div className="ml-6">
  <div className="flex items-center mb-2 pb-2 border-b border-[#DBCCCC]">
    <div className="w-4 h-4 bg-[#19216f] mr-2"></div>
    <p className="text-black font-semibold w-full justify-between flex">
      Total Questions <span className="font-bold ml-4 text-xl">{totalQuestions}</span>
    </p>
  </div>

  <div className="flex items-center mb-2 pb-2 border-b border-[#DBCCCC]">
    <div className="w-4 h-4 bg-green-500 mr-2"></div>
    <p className="text-black font-semibold w-full justify-between flex">
      Correct Answers <span className="font-bold ml-4 text-xl">{correctAnswers}</span>
    </p>
  </div>

  <div className="flex items-center pb-2">
    <div className="w-4 h-4 bg-red-500 mr-2"></div>
    <p className="text-black font-semibold w-full justify-between flex">
      Incorrect Answers <span className="font-bold ml-4 text-xl">{incorrectAnswers}</span>
    </p>
  </div>
</div>

    </div>
  );
};

export default DoughnutChart;
