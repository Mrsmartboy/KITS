import React from "react";

export const Attempted = ({ attemptedMCQ, attemptedCode }) => {
  const totalQuestions = attemptedMCQ + attemptedCode;

  return (
    <div className="bg-white rounded-xl shadow-md w-full mb-2  font-[inter] ">
      {/* Header */}
      <h2 className="bg-[#19216f] text-white text-center font-semibold text-xl py-3 rounded-t-lg  mb-6">
        Attempted
      </h2>
      <div className="p-2">

      {/* MCQ Attempted */}
      <div className="flex justify-between items-center border-b py-3 px-3">
        <span className="text-black text-base font-medium">MCQ’s Attempted</span>
        <span className="text-black font-bold text-lg">{attemptedMCQ}</span>
      </div>

      {/* Coding Attempted */}
      <div className="flex justify-between items-center border-b py-3 px-3">
        <span className="text-black text-base font-medium">Coding Questions Attempted</span>
        <span className="text-black font-bold text-lg">{attemptedCode}</span>
      </div>

      {/* Total Attempted Box */}
      <div className="mt-6 bg-[#F1F3FF]  flex items-center justify-center gap-3 flex-wrap md:flex-nowrap ">
        <div className="text-xl md:text-[23px] font-medium text-black leading-[48px] ">
          Total Attempted
        </div>
        <div className="text-[24px] md:text-[24px] font-semibold text-black leading-[20px]">
          {totalQuestions}
        </div>
      </div>
      </div>
    </div>
  );
};
