import React, { useContext } from "react";
import { ExamContext } from "./ExamContext";

export const CodingPanel = () => {
  const { codingQuestions, codingIndex } = useContext(ExamContext);
  const currentQuestion = codingQuestions[codingIndex];

  if (!currentQuestion) return null;

  const sampleOutputString = String(currentQuestion.Sample_Output ?? "");

  const parsedSampleOutput = sampleOutputString
  .replace(/\\s/g, " ") 
  .replace(/\\n/g, "\n");

  const sampleInputString = String(currentQuestion.Sample_Input ?? "");
const parsedSampleInput = sampleInputString
  .replace(/\\s/g, " ")
  .replace(/\\n/g, "\n");


  return (
    <div className="max-w-[453px] overflow-auto min-h-[485px] bg-white rounded-[16px] shadow-[0_4px_12px_0_rgba(3,104,255,0.25)] p-6   my-5">
      {/* Display question number + text */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#E1EFFF] w-20 h-16 rounded-[8px] flex items-center justify-center text-xl font-semibold text-blue-800">
          {codingIndex + 1}.
        </div>
        <p className="text-xl md:text-xl font-semibold ">
          {currentQuestion.Question}
        </p>
      </div>
      <hr className="my-3" />

{/* Constraints */}
<div className="text-base md:text-lg text-gray-700 space-y-4 px-4 ">
  <div>
    <strong>Constraints:</strong>
    <br />
    {currentQuestion.Constraints}
  </div>

  {/* Sample Input */}
  <div className="w-[380px] break-words">
    <strong>Sample Input:</strong>
    <br />
    <pre className="text-base p-1 m-1 whitespace-pre-wrap break-words">{parsedSampleInput}</pre>
  </div>

  <div>
    <strong>Sample Output:</strong>
    <br />
    <pre className="text-base p-1 m-1 whitespace-pre-wrap break-words">{parsedSampleOutput}</pre>
  </div>
</div>

    </div>
  );
};
