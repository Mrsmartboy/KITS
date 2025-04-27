import React from "react";
import { useNavigate } from "react-router-dom";

export const ReportsDashboard = () => {
  const navigate = useNavigate();

  // Define each card’s data here
  const cardsData = [
    {
      icon: "/ExamModule/book.svg",
      title: "Daily Exam",
      description: "View Your Daily Exam Reports",
      route: "/daily-exam-reports",
      disabled: false,
    },
    {
      icon: "/ExamModule/book.svg",
      title: "Weekly Exam",
      description: "View Your Weekly Exam Reports",
      route: "/weekly-exam-reports",
      disabled: true, // “Coming Soon”
    },
    {
      icon: "/ExamModule/book.svg",
      title: "Monthly Exam",
      description: "View Your Monthly Exam Reports",
      route: "/monthly-exam-reports",
      disabled: true, // “Coming Soon”
    },
    {
      icon: "/ExamModule/book.svg",
      title: "Grand Test",
      description: "View Your Grand Test Reports",
      route: "/grad-test-reports",
      disabled: true, // “Coming Soon”
    },
  ];

  return (
    <div className="bg-gray-100 py-10  px-4 flex flex-col items-center mt-0 font-[inter]">
      {/* A responsive grid for 4 cards, 1 column on mobile, 2 on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
        {cardsData.map((card, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg rounded-xl p-5 pb-8 px-8 flex flex-col justify-center 
                       items-center border-[1.5px] border-[#19216F]"
          >
            {/* h3 with bigger font size */}
            {/* Icon + Title row */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <img
                src={card.icon}
                alt={`${card.title} icon`}
                className="w-10 h-10"
              />
              <h3 className="text-3xl font-semibold text-[#19216F]">
                {card.title}
              </h3>
            </div>

            {/* Underline image */}
            <img
              src="/ExamModule/underline.svg"
              alt="Underline"
              className="w-3/4 mx-auto mb-6"
            />

            {/* Paragraph with bigger font size and more margin below */}
            <p className="text-2xl text-gray-700 mb-6 text-center py-8">
              {card.description}
            </p>

            {/* Button with bigger font size and larger padding */}
            <button
              onClick={() => !card.disabled && navigate(card.route)}
              disabled={card.disabled}
              className={`px-6 py-2 w-3/4 rounded-xl text-white transition-colors 
                          duration-300 text-2xl 
                          ${
                            card.disabled
                              ? "cursor-not-allowed bg-gray-400"
                              : "bg-[#19216F] hover:bg-blue-800"
                          }`}
            >
              {card.disabled ? "Coming Soon..." : "Go"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
