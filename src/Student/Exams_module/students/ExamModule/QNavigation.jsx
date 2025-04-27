import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

const QNavigation = () => {
  const {
    handlePrevious,
    handleNext,
    handleMarkReview,
    mcqIndex,
    codingIndex,
    selectedMCQ,
    mcqQuestions,
    codingQuestions,
  } = useContext(ExamContext);

  return (
    <div className="flex flex-row justify-between legend w-full rounded-lg bg-white m-2 px-2  shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      <div className="flex flex-row gap-4 justify-evenly items-center current">
        <button
          type="button"
          onClick={handleMarkReview}
          className="text-white bg-[#FF6000] w-full px-2 py-1 rounded-lg font-normal text-xl flex flex-row items-center justify-evenly "
        >
          <span className="py-1 px-2">
            <img src="/ExamModule/mark-for-review.svg" alt="" />
          </span>
          Review
        </button>
      </div>
      <div className="text-xl rounded-full border border-[#183B56] px-2 m-4">
        {selectedMCQ ? (
          <div>Question {`${mcqIndex + 1} of ${mcqQuestions.length}`}</div>
        ) : (
          <div>
            Question {`${codingIndex + 1} of ${codingQuestions.length}`}
          </div>
        )}
      </div>

      <div className="flex flex-row gap-4 justify-evenly items-center marked-for-review">
        <button
          type="button"
          onClick={handlePrevious}
          className="text-white bg-[#132EE0] w-36 px-2 py-1 rounded-lg font-normal text-xl flex flex-row items-center justify-center"
        >
          <span> &lt; &nbsp;</span> Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="text-white bg-[#132EE0] w-36 px-2 py-1 rounded-lg font-normal text-xl flex flex-row items-center justify-center"
        >
          Next <span>&nbsp; &gt;</span>
        </button>
      </div>
    </div>
  );
};

export default QNavigation;
