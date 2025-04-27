import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const McqPanel = () => {
  const { mcqQuestions, mcqIndex, updateMcqAnswer } = useContext(ExamContext);
  const currentQuestion = mcqQuestions[mcqIndex];

  return (
    <div className="bg-white flex flex-col gap-4 p-4">
      {/* Question Header */}
      <div className="p-4">
        <div className="font-bold text-2xl m-4">
          {currentQuestion && `Subject: ${currentQuestion?.Subject}`}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="bg-[#E1EFFF] p-3 md:p-4 rounded-lg">
            {mcqIndex + 1}.
          </span>
          <span className="bg-[#E1EFFF] flex-1 p-3 md:p-4 rounded-lg break-words">
            <pre className="question-pre text-sm">
              {currentQuestion && currentQuestion?.Question}
            </pre>
          </span>
        </div>
      </div>

      {/* Options Title */}
      <div className="text-xl md:text-2xl p-4">Options</div>

      {/* Options List */}
      <div
        className={`grid ${currentQuestion?.image_url ? "grid-cols-2" : ""}`}
      >
        <div className="options flex flex-col gap-2 p-4">
          {currentQuestion &&
            Object.entries(currentQuestion?.Options).map(
              ([optionKey, optionValue]) => {
                const isSelected = currentQuestion?.answer === optionKey;
                return (
                  <label
                    key={optionKey}
                    className={`flex items-center p-2 rounded cursor-pointer w-2/3 ${
                      isSelected
                        ? "bg-white shadow-[0px_4px_17px_0px_#0368FF26]"
                        : "bg-[#E1EFFF]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion?.questionId}`}
                      value={optionKey}
                      checked={isSelected}
                      onChange={(e) =>
                        updateMcqAnswer(mcqIndex, e.target.value)
                      }
                      className="mr-2"
                    />
                    {String(optionKey)}: {String(optionValue)}
                  </label>
                );
              }
            )}
        </div>
        {currentQuestion?.image_url && (
          <div>
            <img src={currentQuestion?.image_url} alt="Info Image" />
          </div>
        )}
      </div>

      {/* Inline CSS for the pre tag */}
      <style jsx>{`
        .question-pre {
          white-space: pre-wrap; /* Preserve whitespace but allow wrapping */
          overflow-wrap: break-word; /* Break long words to fit container */
          margin: 0; /* Remove default margin */
          font-family: monospace; /* Use monospace font for code-like appearance */
          font-size: 1rem; /* Adjust font size as needed */
          max-width: 100%; /* Ensure it doesn't exceed container width */
          overflow-x: auto; /* Add horizontal scroll for very long lines */
        }
      `}</style>
    </div>
  );
};