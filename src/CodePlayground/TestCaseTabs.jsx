import React, { useState } from "react";

const TestCaseTabsNew = ({ testCases, theme = "dark" }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!testCases || !testCases.length) {
    return null;
  }

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const parseOutput = (text = "") => {
    if (text.includes("\\n") || text.includes("\\s")) {
      return text.replace(/\\s/g, " ").replace(/\\n/g, "\n");
    }
    return text;
  };

  const currentTest = testCases[activeTab];
  const parsedExpectedOutput = parseOutput(currentTest?.expected_output);
  const parsedActualOutput = parseOutput(currentTest?.actual_output);

  const isDarkTheme = theme === "dark";

  return (
    <div className={`flex flex-col gap-4 overflow-hidden h-full ${isDarkTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div className={`flex gap-3 flex-wrap ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"} p-2 rounded-t-lg`}>
        {testCases.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleTabClick(idx)}
            className={`px-5 py-2 rounded-lg font-medium text-sm ${
              activeTab === idx
                ? isDarkTheme
                  ? "bg-[#656565] text-white"
                  : "bg-blue-200 text-gray-900"
                : isDarkTheme
                ? "bg-[#3A3A3A] text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            Case {idx + 1}
          </button>
        ))}
      </div>

      <div className={`flex-1 flex flex-col ${isDarkTheme ? "bg-[#1E1E1E] border-[#3A3A3A]" : "bg-gray-100 border-gray-300"} border rounded-lg p-4 overflow-auto text-inherit gap-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {currentTest.type === "hidden" ? `Hidden Test Case ${activeTab + 1}` : `Test Case ${activeTab + 1}`}
          </h2>
          <span className={`font-bold ${
            currentTest.status === "Passed"
              ? isDarkTheme
                ? "text-green-400"
                : "text-green-600"
              : isDarkTheme
              ? "text-red-400"
              : "text-red-600"
          }`}>
            {currentTest.status}
          </span>
        </div>

        {currentTest.type !== "hidden" && (
          <>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Input:</div>
              <pre className={`bg-${isDarkTheme ? "#292929" : "#F5F5F5"} rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words text-inherit`}>
                {currentTest.input}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-medium">Expected Output:</div>
              <pre className={`bg-${isDarkTheme ? "#292929" : "#F5F5F5"} rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words text-inherit`}>
                {parsedExpectedOutput}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-medium">Your Output:</div>
              <pre className={`bg-${isDarkTheme ? "#292929" : "#F5F5F5"} rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words text-inherit`}>
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