import React, { useState } from "react";

const TestCaseTabsNew = ({ testCases }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!testCases || !testCases.length) {
    return null;
  }

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  // Parse ASCII-style output
  const parseOutput = (text = "") => {
    if (text.includes("\\n") || text.includes("\\s")) {
      return text.replace(/\\s/g, " ").replace(/\\n/g, "\n");
    }
    return text;
  };

  const currentTest = testCases[activeTab];
  const parsedExpectedOutput = parseOutput(currentTest?.expected_output);
  const parsedActualOutput = parseOutput(currentTest?.actual_output);

  return (
    <div className="flex flex-col gap-4 overflow-hidden h-full">
      {/* Static Top Bar for Case Tabs */}
      <div className="flex gap-3 flex-wrap">
        {testCases.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleTabClick(idx)}
            className={`px-5 py-2 rounded-lg font-medium text-sm ${
              activeTab === idx
                ? "bg-[#656565] text-white"
                : "bg-[#3A3A3A] text-white"
            }`}
          >
            Case {idx + 1}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="flex-1 flex flex-col bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4 overflow-auto text-white gap-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {currentTest.type === "hidden"
              ? `Hidden Test Case ${activeTab + 1}`
              : `Test Case ${activeTab + 1}`}
          </h2>
          <span
            className={`font-bold ${
              currentTest.status === "Passed"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {currentTest.status}
          </span>
        </div>

        {/* Input (only if not hidden) */}
        {/* Input: only if not hidden */}
        {currentTest.type !== "hidden" && (
          <div className="flex flex-col gap-2">
            <div className="font-medium">Input:</div>
            <pre className="bg-[#292929] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {currentTest.input}
            </pre>
          </div>
        )}

        {/* Always show Expected Output */}
        <div className="flex flex-col gap-2">
          <div className="font-medium">Expected Output:</div>
          <pre className="bg-[#292929] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
            {parsedExpectedOutput}
          </pre>
        </div>

        {/* Always show Your Output */}
        <div className="flex flex-col gap-2">
          <div className="font-medium">Your Output:</div>
          <pre className="bg-[#292929] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
            {parsedActualOutput}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestCaseTabsNew;
