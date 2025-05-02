import React, { useState, useEffect } from "react";
import { FiLock } from "react-icons/fi";

const TestCaseTabs = ({ testCases }) => {
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
    <div className="rounded-md overflow-hidden max-h-72 overflow-y-auto">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-800 px-4 py-2 overflow-x-auto">
        {testCases.map((_, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`text-sm px-4 py-1 mr-2 rounded-t 
              ${
                activeTab === index
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300"
              }
            `}
          >
            Case {index + 1}
          </button>
        ))}
        <button className="bg-gray-900 text-gray-300 text-sm px-4 py-1 rounded-t">
          +
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="bg-gray-700 p-4 text-white">
        {currentTest.type === "custom" ? (
          <div className="flex flex-col gap-2">
            <h4 className="mb-2 font-semibold">
              Custom Input: {currentTest.input}
            </h4>
            <p className="mb-1">
              <strong>Your Output:</strong>
            </p>
            <pre className="bg-gray-800 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
              {parsedActualOutput}
            </pre>
          </div>
        ) : currentTest.type === "hidden" ? (
          <div className="flex flex-col gap-2">
            <h4 className="mb-2 font-semibold flex items-center">
              <FiLock className="mr-2" />
              Hidden Test Case {activeTab + 1}:{" "}
              <span
                className={
                  currentTest.status === "Passed"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {currentTest.status}
              </span>
            </h4>
            <div className="flex flex-col max-w-80">
              {/* Expected Output */}
              <div className="flex-1 min-w-0">
                <strong>Expected Output:</strong>
                <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                  {parsedExpectedOutput}
                </pre>
              </div>

              {/* Your Output */}
              <div className="flex-1 min-w-0">
                <strong>Your Output:</strong>
                <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                  {parsedActualOutput}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h4 className="mb-2 font-semibold text-lg">
              Test Case {activeTab + 1}:{" "}
              <span
                className={
                  currentTest.status === "Passed"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {currentTest.status}
              </span>
            </h4>

            {/* Show Input only if it's not hidden */}
            {currentTest.type !== "hidden" && (
              <>
                <p className="mb-1">
                  <strong>Input:</strong>
                </p>
                <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap break-words max-w-80">
                  {currentTest.input}
                </pre>
              </>
            )}

            <div className="flex flex-col max-w-80">
              {/* Expected Output */}
              <div className="flex-1 min-w-0">
                <strong>Expected Output:</strong>
                <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                  {parsedExpectedOutput}
                </pre>
              </div>

              {/* Your Output */}
              <div className="flex-1 min-w-0">
                <strong>Your Output:</strong>
                <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                  {parsedActualOutput}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseTabs;