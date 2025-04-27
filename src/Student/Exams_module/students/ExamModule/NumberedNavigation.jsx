import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const NumberedNavigation = () => {
  const {
    selectedMCQ,
    mcqQuestions,
    codingQuestions,
    mcqIndex,
    setMcqIndex,
    codingIndex,
    setCodingIndex,
  } = useContext(ExamContext);

  const questions = selectedMCQ ? mcqQuestions : codingQuestions;
  const currentIndex = selectedMCQ ? mcqIndex : codingIndex;
  const setIndex = selectedMCQ ? setMcqIndex : setCodingIndex;

  // Group questions into rows of 3 items
  const rows = [];
  for (let i = 0; i < questions.length; i += 3) {
    rows.push(questions.slice(i, i + 3));
  }

  return (
    <div
      className="p-4 w-full mt-4 bg-white rounded-2xl h-full shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)] overflow-y-auto"
      style={{ maxHeight: "535px" }} // roughly 9 rows * 64px per row
    >
      <table className="w-full">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((item, colIndex) => {
                const index = rowIndex * 3 + colIndex;
                let bgColor;
                if (index === currentIndex) {
                  bgColor = "bg-[#3686FF] text-white";
                } else if (item.markedForReview) {
                  bgColor = "bg-[#FF6000] text-white" ;
                } else if (item.answered) {
                  bgColor = "bg-[#129E00] text-white";
                } else {
                  bgColor = "bg-[#E1EFFF] text-[#666666]";
                }
                return (
                  <td key={colIndex} className="p-1">
                    <button
                      onClick={() => setIndex(index)}
                      className={`${bgColor} text-medium rounded-lg w-14 h-14`}
                    >
                      {index + 1}
                    </button>
                  </td>
                );
              })}
              {/* Fill remaining cells if the row has less than 3 items */}
              {row.length < 3 &&
                Array.from({ length: 3 - row.length }).map((_, idx) => (
                  <td key={`empty-${idx}`} className="p-1" />
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default NumberedNavigation;
