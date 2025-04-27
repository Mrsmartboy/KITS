import React from "react";

const MCQComponent = ({ question, selectedAnswer, onAnswerChange }) => {
  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{question.description}</h3>
      <div className="mt-2 space-y-2">
        {Object.entries(question.options).map(([key, value]) => (
          <label key={key} className="block">
            <input
              type="radio"
              name={`question_${question.question_id}`}
               value={value}
              checked={selectedAnswer === value}
              onChange={() => onAnswerChange(value)}
              className="mr-2"
            />
            {value}
          </label>
        ))}
      </div>
    </div>
  );
};

export default MCQComponent;