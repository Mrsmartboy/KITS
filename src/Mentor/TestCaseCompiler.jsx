import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";

const languages = {
  Python: {
    id: 71,
    snippet: 'print("Hello World!")',
    extension: python(),
  },
  JavaScript: {
    id: 63,
    snippet: 'console.log("Hello World!");',
    extension: javascript(),
  },
  Java: {
    id: 62,
    snippet: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World!");
  }
}`,
    extension: java(),
  },
};

// Default Metadata (Dummy Data)
const DEFAULT_METADATA = {
  question_id: "Q-123",
  constraints: "Input must be an integer",
  description: "Double the input number",
  difficulty: "Easy",
  score: 10,
  type: "Coding",
  custom_input_enabled: false,
  custom_input:'',
};

const TestCaseCompiler = () => {
  const [languageKey, setLanguageKey] = useState("Python");
  const [code, setCode] = useState(languages["Python"].snippet);
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  // Update screen height dynamically
  useEffect(() => {
    const updateHeight = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const editorHeight = screenHeight * 0.9; // 70% of screen height
  const rightPanelHeight = screenHeight * 0.5; // 30% for right side

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguageKey(newLang);
    setCode(languages[newLang].snippet);
    setResults([]);
  };

  const handleRunCode = async () => {
    setLoading(true);
    setResults([]);

    if (testCases.length === 0) {
      setLoading(false);
      return Swal.fire({
        icon: "warning",
        title: "No Test Cases!",
        text: "Please add at least one test case before running.",
        confirmButtonColor: "#3085d6",
      });
    }

    // Extract first test case as sample_input and sample_output
    const sample_input = testCases[0].Input;
    const sample_output = testCases[0].Output;

    // Remaining test cases as hidden_test_cases using "Input" and "Output"
    const hidden_test_cases = testCases.slice(1).map(({ Input, Output }) => ({
      Input,
      Output,
    }));

    const payload = {
      source_code: code,
      language: languageKey,
      question_id: DEFAULT_METADATA.question_id,
      constraints: DEFAULT_METADATA.constraints,
      description: DEFAULT_METADATA.description,
      difficulty: DEFAULT_METADATA.difficulty,
      score: DEFAULT_METADATA.score,
      type: DEFAULT_METADATA.type,
      custom_input: DEFAULT_METADATA.custom_input,
      custom_input_enabled: DEFAULT_METADATA.custom_input_enabled,
      sample_input,
      sample_output,
      hidden_test_cases,
    };


    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      setResults(result.results || []);
    } catch (error) {
      setResults([{ Input: "", Output: "", actual_output: "Error", status: "❌ Failed" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { id: Date.now(), Input: "", Output: "" }]);
  };

  const handleRemoveTestCase = (id) => {
    setTestCases(testCases.filter((test) => test.id !== id));
  };

  const handleTestCaseChange = (id, field, value) => {
    setTestCases(
      testCases.map((test) =>
        test.id === id ? { ...test, [field]: value } : test
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col mt-0">
      {/* Header & Run Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Test Cases Compiler</h2>
        <button
          onClick={handleRunCode}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white transition duration-200 ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-4 flex-grow">
        {/* Left Side - Code Editor */}
        <div className="w-full lg:w-2/3 border border-gray-700 rounded-md flex flex-col">
          <div className="flex items-center justify-between bg-gray-800 p-2 border-b border-gray-700">
            <label className="text-sm">Language:</label>
            <select
              value={languageKey}
              onChange={handleLanguageChange}
              className="p-1 rounded-md bg-gray-700 text-white border border-gray-600"
            >
              {Object.keys(languages).map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Code Editor with Dynamic Height & Scroll */}
          <div className="overflow-y-auto p-2" style={{ height: editorHeight }}>
            <CodeMirror
              value={code}
              theme={oneDark}
              extensions={[languages[languageKey].extension]}
              onChange={(val) => setCode(val)}
              className="h-full"
            />
          </div>
        </div>

        {/* Right Side - Test Cases & Results */}
        <div className="w-full h-full lg:w-1/3 flex flex-col space-y-4 flex-grow">
          {/* Test Cases (Scrollable) */}
          <div className="h-full bg-gray-800 p-3 rounded-md shadow-md flex-grow overflow-y-auto" style={{ maxHeight: rightPanelHeight }}>
            <h3 className="text-lg mb-2">Test Cases</h3>
            {testCases.map((test) => (
              <div key={test.id} className="flex gap-2 mb-2">
                <textarea
                  placeholder="Input"
                  value={test.Input}
                  onChange={(e) => handleTestCaseChange(test.id, "Input", e.target.value)}
                  className="w-1/2 p-1 bg-gray-700 text-white border border-gray-600 rounded-md text-sm"
                />
                <textarea
                  placeholder="Expected Output"
                  value={test.Output}
                  onChange={(e) => handleTestCaseChange(test.id, "Output", e.target.value)}
                  className="w-1/2 p-1 bg-gray-700 text-white border border-gray-600 rounded-md text-sm"
                />
                <button
                  onClick={() => handleRemoveTestCase(test.id)}
                  className="text-red-500 hover:text-red-400 text-lg"
                >
                  <FaTrash/>
                </button>
              </div>
            ))}
            <button onClick={handleAddTestCase} className="w-full bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md transition duration-200 text-sm">
              ➕ Add Test Case
            </button>
          </div>

          {/* Results Section (Scrollable) */}
          <div className="h-full bg-gray-800 p-3 rounded-md shadow-md flex-grow overflow-y-auto" style={{ maxHeight: rightPanelHeight }}>
            <h3 className="text-lg mb-2">Results</h3>
            {results.length > 0 ? (
              results.map((res, index) => (
                <div key={index} className="p-2 border-b border-gray-600 text-sm">
                  <p><b>Input:</b> {res.input}</p>
                  <p><b>Expected:</b> {res.expected_output}</p>
                  <p><b>Actual:</b> {res.actual_output}</p>
                  <p className={`font-bold ${res.status.includes("Passed") ? "text-green-400" : "text-red-400"}`}>
                  <b>Status:</b>{res.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No results yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseCompiler;
