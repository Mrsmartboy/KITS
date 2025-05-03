import React, { useState, useEffect } from "react";
import { FiLock } from "react-icons/fi";

const TestCaseTabsNew = ({ testCases }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Reset activeTab if testCases changes and activeTab is out of bounds
  useEffect(() => {
    if (testCases && activeTab >= testCases.length) {
      setActiveTab(0);
    }
  }, [testCases, activeTab]);

  if (!testCases || !testCases.length) {
    return null;
  }

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  // Parse ASCII-like output (replace \s with space and \n with newline)
  const parseOutput = (text = "") => {
    if (typeof text !== "string") {
      return "";
    }
    if (text.includes("\\n") || text.includes("\\s")) {
      return text.replace(/\\s/g, " ").replace(/\\n/g, "\n");
    }
    return text;
  };

  const currentTest = testCases[activeTab];
  if (!currentTest) {
    return null;
  }

  const parsedExpectedOutput = parseOutput(currentTest.expected_output ?? "");
  const parsedActualOutput =
    parseOutput(currentTest.actual_output ?? "") === ""
      ? "No output"
      : parseOutput(currentTest.actual_output ?? "");

  return (
    <div className="flex flex-col gap-4 overflow-hidden h-full">
      {/* Static Top Bar for Case Tabs */}
      <div className="flex gap-3 flex-wrap">
        {testCases.map((testCase, idx) => {
          const isActive = idx === activeTab;
          const isPassed = testCase.status === "Passed";

          return (
            <button
              key={idx}
              onClick={() => handleTabClick(idx)}
              className={`
        px-5 py-2 rounded-lg font-medium text-sm
        ${isActive ? "bg-[#656565]" : "bg-[#3A3A3A]"}
        ${isPassed ? "text-green-400" : "text-red-400"}
      `}
            >
              Case {idx + 1}
            </button>
          );
        })}

        <button className="px-5 py-2 rounded-lg font-medium text-sm bg-[#3A3A3A] text-white">
          +
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="flex-1 flex flex-col bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4 overflow-auto text-white gap-4">
        {currentTest.type === "custom" ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">
              Custom Input: {currentTest.input}
            </h2>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Your Output:</div>
              <pre className="bg-[#292929] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
                {parsedActualOutput}
              </pre>
            </div>
          </div>
        ) : (
          <>
            {/* Status */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                {currentTest.type === "hidden" ? (
                  <>
                    <FiLock className="mr-2" />
                    Hidden Test Case {activeTab + 1}
                  </>
                ) : (
                  `Test Case ${activeTab + 1}`
                )}
              </h2>
              <span
                className={`font-bold ${
                  currentTest.status === "Passed"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {currentTest.status === "Passed"
                  ? currentTest.status
                  : "Failed"}
              </span>
            </div>

            {/* Input (only if not hidden) */}
            {currentTest.type !== "hidden" && currentTest.type !== "custom" && (
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
          </>
        )}
      </div>
    </div>
  );
};

export default TestCaseTabsNew;
