import React, { useState, useEffect, useContext } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";

import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { ExamContext } from "./ExamContext";
import TestCaseTabs from "./TestCaseTabs";

const OnlineCompiler = () => {
  const {
    onlineCompilerQuestion,
    existingData,
    setExistingData,
    updateCodingAnswer,
  } = useContext(ExamContext);

  const question = onlineCompilerQuestion || { question_id: null };
  const questionId = question.question_id;

  const [language, setLanguage] = useState(
    existingData[questionId]?.language || "Python"
  );
  const [code, setCode] = useState(existingData[questionId]?.sourceCode || "");
  const [customInputEnabled, setCustomInputEnabled] = useState(
    existingData[questionId]?.customInputEnabled || false
  );
  const [customInput, setCustomInput] = useState(
    existingData[questionId]?.customInput || ""
  );
  const [loading, setLoading] = useState(false);

  const languageExtensions = {
    Python: python(),
    Java: java(),
    C: cpp(),
    "C++": cpp(),
    JavaScript: javascript(),
  };

  useEffect(() => {
    if (questionId) {
      setLanguage(existingData[questionId]?.language || "Python");
      setCode(existingData[questionId]?.sourceCode || "");
      setCustomInputEnabled(
        existingData[questionId]?.customInputEnabled || false
      );
      setCustomInput(existingData[questionId]?.customInput || "");
    }
  }, [questionId, existingData]);

  const handleCodeChange = (val) => {
    setCode(val);
    setExistingData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        sourceCode: val,
      },
    }));
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setExistingData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        language: lang,
      },
    }));
  };

  const processedHiddenTestCases = question.hidden_test_cases
    ? question.hidden_test_cases.map((tc) => ({
        ...tc,
        Input:
          typeof tc.Input === "string"
            ? tc.Input.replace(/\r/g, "")
                .split("\n")
                .map((line) => line.trim())
                .join("\n")
            : String(tc.Input),
        Output:
          typeof tc.Output === "string"
            ? tc.Output.replace(/\r/g, "")
                .split("\n")
                .map((line) => line.trimEnd())
                .join("\n")
            : String(tc.Output),
      }))
    : [];

  const handleRun = async () => {
    setLoading(true);
    const bodyData = {
      question_id: questionId,
      source_code: code,
      language,
      custom_input_enabled: customInputEnabled,
      custom_input: customInput,
      constraints: question.constraints,
      description: question.description,
      difficulty: question.difficulty,
      hidden_test_cases: processedHiddenTestCases,
      sample_input:
        typeof question.sample_input === "string"
          ? question.sample_input
              .replace(/\r/g, "")
              .split("\n")
              .map((line) => line.trim())
              .join("\n")
          : String(question.sample_input),

      sample_output:
        typeof question.sample_output === "string"
          ? question.sample_output
              .replace(/\r/g, "")
              .split("\n")
              .map((line) => line.trimEnd())
              .join("\n")
          : String(question.sample_output),

      score: Number(question.score),
      type: question.type,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { results } = await response.json();

      const normalResults = results.filter((r) => r.type !== "custom");
      const customResults = results.filter((r) => r.type === "custom");

      const computedResults = normalResults.map((res) => {
        const passed =
          res.expected_output?.trim() === res.actual_output?.trim();
        return { ...res, status: passed ? "Passed" : "Failed" };
      });

      const summary = computedResults.reduce(
        (acc, cur) => {
          if (cur.status === "Passed") acc.passed++;
          else acc.failed++;
          return acc;
        },
        { passed: 0, failed: 0 }
      );

      setExistingData((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          language,
          sourceCode: code,
          customInputEnabled,
          customInput,
          testCaseSummary: summary,
          testCases: computedResults,
          customTestCases: customResults,
          answered: true,
        },
      }));

      updateCodingAnswer({
        questionId,
        sourceCode: code,
        language,
        testCaseSummary: summary,
        testCases: computedResults,
        customTestCases: customResults,
        answered: true,
      });
    } catch (error) {
      setExistingData((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          testCases: [],
          customTestCases: [],
          testCaseSummary: { passed: 0, failed: 0 },
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testCases = existingData[questionId]?.testCases || [];
  const customTestCases = existingData[questionId]?.customTestCases || [];
  const testCaseSummary = existingData[questionId]?.testCaseSummary || {
    passed: 0,
    failed: 0,
  };

  return (
    <div
      className="
    w-full        /* Ensures it takes full width by default */
    max-w-[90%]   /* Limits maximum width to 90% of the viewport */
    md:max-w-[70%] /* Medium screens: 70% width */
    lg:max-w-[60%] /* Large screens: 50% width */
    rounded-[10px]
    bg-[#2C2C2C]
    text-white
    flex
    flex-col
    gap-4
    p-4  
    my-5
    mx-auto   /* Centers the component */
  "
    >
      {/* Language Selector + Run Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="block font-semibold text-white">
            Select Language:
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white border border-gray-500 rounded px-2 py-1"
          >
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C">C</option>
            <option value="C++">C++</option>
            <option value="JavaScript">JavaScript</option>
          </select>
        </div>
        {/* <p className="text-[18px] text-yellow-400">Use class name as Main with a main method (Java)</p> */}
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-4 py-2 text-white text-lg bg-green-600 rounded hover:bg-green-500 self-end sm:self-auto"
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {/* Code Editor */}
      <div className="border border-gray-600 rounded overflow-hidden w-full bg-[#1E1E1E]">
        <CodeMirror
          value={code}
          height="300px"
          width="100%"
          theme={oneDark}
          extensions={[EditorView.lineWrapping, languageExtensions[language]]}
          onChange={handleCodeChange}
        />
      </div>

      {/* Custom Inputs */}
      <div className="flex flex-col gap-2 text-white">
        <label className="flex items-center space-x-2 font-semibold">
          <input
            type="checkbox"
            className="accent-blue-500"
            checked={customInputEnabled}
            onChange={() => setCustomInputEnabled((prev) => !prev)}
          />
          <span>Enable Custom Input</span>
        </label>
        {customInputEnabled && (
          <textarea
            rows={1}
            className="w-full p-2 border border-gray-600 bg-[#1E1E1E] rounded text-white"
            placeholder="Enter custom input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
        )}
      </div>

      {/* Test Results */}
      <div className="bg-[#1E1E1E] p-3 rounded border border-gray-600">
        {customInputEnabled ? (
          <>
            <p className="font-semibold mb-2 text-white">
              Custom Input Results
            </p>
            {customTestCases.length === 0 ? (
              <p className="text-sm text-gray-300">
                No custom input results yet.
              </p>
            ) : (
              <TestCaseTabs testCases={customTestCases} />
            )}
          </>
        ) : (
          <>
            <p className="font-semibold mb-2 text-white ">
              Test Cases Summary:{" "}
              <span className="text-green-500">
                {testCaseSummary.passed} Passed{" "}
              </span>
              /
              <span className="text-red-500 mx-1">
                {testCaseSummary.failed} Failed
              </span>
            </p>
            {testCases.length === 0 ? (
              <p className="text-sm text-gray-300">
                No normal test cases to display.
              </p>
            ) : (
              <TestCaseTabs testCases={testCases} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OnlineCompiler;
