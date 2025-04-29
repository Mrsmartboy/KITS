import React, { useState, useEffect, useContext } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import { ExamContext } from "./ExamModule/ExamContext";

const OnlineCompiler = () => {
  // Get context values
  const {
    onlineCompilerQuestion,
    existingData,
    setExistingData,
    updateCodingAnswer,
  } = useContext(ExamContext);

  // Ensure question exists to avoid errors
  const question = onlineCompilerQuestion || { question_id: null };
  const questionId = question.question_id;

  // State initialization (ensures Hooks run in the same order)
  const [language, setLanguage] = useState(
    existingData[questionId]?.language || "JavaScript"
  );
  const [code, setCode] = useState(existingData[questionId]?.sourceCode || "");
  const [customInputEnabled, setCustomInputEnabled] = useState(
    existingData[questionId]?.customInputEnabled || false
  );
  const [customInput, setCustomInput] = useState(
    existingData[questionId]?.customInput || ""
  );
  const [output, setOutput] = useState(existingData[questionId]?.output || "");
  const [testCaseSummary, setTestCaseSummary] = useState(
    existingData[questionId]?.testCaseSummary || { passed: 0, failed: 0 }
  );
  const [loading, setLoading] = useState(false);

  const languageExtensions = {
    JavaScript: javascript(),
    Python: python(),
    Java: java(),
  };

  // Effect to update local state when switching questions
  useEffect(() => {
    if (questionId) {
      setLanguage(existingData[questionId]?.language || "JavaScript");
      setCode(existingData[questionId]?.sourceCode || "");
      setCustomInputEnabled(
        existingData[questionId]?.customInputEnabled || false
      );
      setCustomInput(existingData[questionId]?.customInput || "");
      setOutput(existingData[questionId]?.output || "");
      setTestCaseSummary(
        existingData[questionId]?.testCaseSummary || { passed: 0, failed: 0 }
      );
    }
  }, [questionId, existingData]);

  /**
   * Save the code in context as the user types (auto-save feature)
   */
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

  /**
   * Save selected language per question
   */
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

  /**
   * Submit the code and update the response state
   */
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
      hidden_test_cases: question.hidden_test_cases,
      sample_input: question.sample_input,
      sample_output: question.sample_output,
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

      const computedResults = results.map((result) => ({
        ...result,
        status:
          result.actual_output.trim() === result.expected_output.trim()
            ? "Passed"
            : "Failed",
      }));

      const summary = computedResults.reduce(
        (acc, result) => {
          if (result.status === "Passed") {
            acc.passed++;
          } else {
            acc.failed++;
          }
          return acc;
        },
        { passed: 0, failed: 0 }
      );

      setTestCaseSummary(summary);

      const outputHtml = computedResults
        .map((result, index) =>
          result.type === "hidden"
            ? `<div style="margin-bottom: 10px;"><h4>Hidden Test Case ${
                index + 1
              }: ${result.status}</h4></div>`
            : `<div style="margin-bottom: 10px;">
                <h4>Test Case ${index + 1}: ${result.status}</h4>
                <p><strong>Input:</strong> ${result.input}</p>
                <p><strong>Expected Output:</strong> ${
                  result.expected_output
                }</p>
                <p><strong>Your Output:</strong> ${result.actual_output}</p>
              </div>`
        )
        .join("");

      setOutput(outputHtml);

      // Store the response in context for this specific question
      setExistingData((prev) => ({
        ...prev,
        [questionId]: {
          language,
          sourceCode: code,
          customInputEnabled,
          customInput,
          testCaseSummary: summary,
          output: outputHtml,
          answered: true,
        },
      }));

      // Save to updateCodingAnswer for submission
      updateCodingAnswer({
        questionId,
        sourceCode: code,
        language,
        testCaseSummary: summary,
        output: outputHtml,
        answered: true,
      });
    } catch (error) {
      console.error("Error:", error);
      setOutput("An error occurred while processing your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl my-4 mx-2 p-6 flex flex-col gap-2 shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)]">
      {!questionId ? (
        <div className="text-center text-red-500 font-bold">
          No question available
        </div>
      ) : (
        <>
          {/* Language Select */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Select Language:</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
            </select>
          </div>

          {/* Code Editor */}
          <div className="mb-4">
            <CodeMirror
              value={code}
              height="300px"
              theme={oneDark}
              extensions={[languageExtensions[language]]}
              onChange={handleCodeChange}
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {loading ? "Running..." : "Run"}
          </button>
          {/* Results Display */}
          <div className="mt-4 p-2 border rounded bg-white">
            {/* Custom Input */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={customInputEnabled}
                  onChange={() => setCustomInputEnabled((prev) => !prev)}
                />
                <span className="font-semibold">Enable Custom Input</span>
              </label>
              {customInputEnabled && (
                <textarea
                  rows={4}
                  className="w-full mt-2 p-2 border rounded"
                  placeholder="Enter custom input"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              )}
            </div>
            <p className="font-semibold mb-2">
              Test Summary: {testCaseSummary.passed} Passed /{" "}
              {testCaseSummary.failed} Failed
            </p>
            <div
              dangerouslySetInnerHTML={{ __html: output }}
              style={{ maxHeight: "150px", overflowY: "auto" }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default OnlineCompiler;
