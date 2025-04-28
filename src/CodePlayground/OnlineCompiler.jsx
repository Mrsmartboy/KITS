import React, { useState, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { decryptData } from "../../cryptoUtils";
import axios from "axios";
import TestCaseTabs from "../Student/Exams_module/students/ExamModule/TestCaseTabs";

function CPOnlineCompiler() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state || {};
  const {
    question: initialQuestion = {},
    index: initialIndex = 0,
    questions: initialQuestionsList = [],
    codeMap: initialCodeMap = {},
    subjectname,
    topicname,
    subtopic,
    tag,
  } = locationState;
  const questionId = initialQuestion?.questionId;
  const subject = initialQuestion?.Subject?.toLowerCase() || "python";
  const tags = tag || initialQuestion?.Tags?.toLowerCase() || "day-1:1";
  const questionType = initialQuestion?.Question_Type || "code_test";
  const testerId =
    decryptData(sessionStorage.getItem("student_login_details") || "") || "";

  const [question, setQuestion] = useState(initialQuestion);
  const [codeMap, setCodeMap] = useState(initialCodeMap);
  const [code, setCode] = useState(initialCodeMap[initialIndex] || "");
  const [language, setLanguage] = useState("Python");
  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [testCaseSummary, setTestCaseSummary] = useState({
    passed: 0,
    failed: 0,
  });
  const [hiddenTestCaseResults, setHiddenTestCaseResults] = useState([]);
  const [hiddenTestCaseSummary, setHiddenTestCaseSummary] = useState({
    passed: 0,
    failed: 0,
  });
  const [testCaseResultsMap, setTestCaseResultsMap] = useState({});
  const [hiddenCaseResultsMap, setHiddenCaseResultsMap] = useState({});
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [sampleTestCaseResults, setSampleTestCaseResults] = useState([]);

  const languageExtensions = {
    Python: python(),
    Java: java(),
    C: cpp(),
    "C++": cpp(),
    JavaScript: javascript(),
  };

  useEffect(() => {
    console.log("location.state updated:", locationState);
    const {
      question: newQuestion = {},
      index: newIndex = 0,
      questions: newQuestionsList = [],
      codeMap: newCodeMap = {},
    } = locationState;

    if (
      !newQuestionsList ||
      !Array.isArray(newQuestionsList) ||
      newQuestionsList.length === 0
    ) {
      console.warn("Questions list is empty or invalid:", newQuestionsList);
      toast.error("No questions available to display.");
      return;
    }

    setQuestion(newQuestion);
    setCodeMap(newCodeMap);
    setCode(newCodeMap[newIndex] || "");
  }, [locationState]);

  const processedHiddenTestCases = (hiddenTestCases) => {
    return hiddenTestCases
      ? hiddenTestCases.map((tc) => ({
          ...tc,
          Input:
            typeof tc.Input === "string"
              ? tc.Input.replace(/\r/g, "")
                  .split("\n")
                  .map((line) => line.trim())
                  .join("\n")
              : String(tc.Input ?? ""),
          Output:
            typeof tc.Output === "string"
              ? tc.Output.replace(/\r/g, "")
                  .split("\n")
                  .map((line) => line.trimEnd())
                  .join("\n")
              : String(tc.Output ?? ""),
        }))
      : [];
  };

  const cleanedSampleInput =
    typeof question?.Sample_Input === "string"
      ? question.Sample_Input.replace(/\r/g, "")
          .split("\n")
          .map((line) => line.trim())
          .join("\n")
      : String(question?.Sample_Input ?? "");

  const cleanedSampleOutput =
    typeof question?.Sample_Output === "string"
      ? question.Sample_Output.replace(/\r/g, "")
          .split("\n")
          .map((line) => line.trimEnd())
          .join("\n")
      : String(question?.Sample_Output ?? "");

  const fetchQuestionData = useCallback(async () => {
    if (!questionId || question.Question) return;
    setIsLoadingQuestion(true);
    try {
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/question-crud?subject=${subject}&questionId=${questionId}&questionType=${questionType}`;
      const response = await axios.get(url);
      const data = response.data;
      if (data?.codeQuestions?.length > 0) {
        const fetchedQuestion = data.codeQuestions[0];
        console.log("Fetched question data:", fetchedQuestion);
        setQuestion(fetchedQuestion);
      } else {
        toast.error("Question not found in database.");
      }
    } catch (error) {
      console.error("Error fetching question data:", error);
      toast.error("Failed to load question data.");
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [questionId, subject, questionType]);

  useEffect(() => {
    fetchQuestionData();
  }, [fetchQuestionData]);

  useEffect(() => {
    setCode(codeMap[initialIndex] || "");
  }, [initialIndex, codeMap]);

  useEffect(() => {
    const savedNormal = testCaseResultsMap[initialIndex];
    if (savedNormal) {
      setTestCases(savedNormal.results);
      setTestCaseSummary(savedNormal.summary);
    } else {
      setTestCases([]);
      setTestCaseSummary({ passed: 0, failed: 0 });
    }
    const savedHidden = hiddenCaseResultsMap[initialIndex];
    if (savedHidden) {
      setHiddenTestCaseResults(savedHidden.results);
      setHiddenTestCaseSummary(savedHidden.summary);
    } else {
      setHiddenTestCaseResults([]);
      setHiddenTestCaseSummary({ passed: 0, failed: 0 });
    }
  }, [initialIndex, testCaseResultsMap, hiddenCaseResultsMap]);

  const handleCodeChange = (val) => {
    setCode(val);
    setCodeMap((prev) => ({ ...prev, [initialIndex]: val }));
  };

  const handleRun = async () => {
    if (!questionId) {
      toast.error("No question ID found!");
      return;
    }
    setLoading(true);
    const hiddenTestCasesWithSample = [
      ...processedHiddenTestCases(question.Hidden_Test_Cases),
      {
        Input: cleanedSampleInput,
        Output: cleanedSampleOutput,
        type: "sample",
      },
    ];
    const bodyData = {
      student_id: testerId,
      question_id: questionId,
      source_code: code,
      language,
      custom_input_enabled: customInputEnabled,
      custom_input: customInput,
      description: question.Question,
      constraints: question.Constraints,
      difficulty: question.Difficulty,
      hidden_test_cases: hiddenTestCasesWithSample,
      sample_input: question.Sample_Input,
      sample_output: question.Sample_Output,
      Score: question.Score,
      type: question.Question_Type,
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-cpsubmissions`,
        bodyData
      );
      const { results } = response.data;

      const normalResults = customInputEnabled
        ? results.filter((r) => r.type === "normal")
        : [];
      const computedNormalResults = normalResults.map((res) => {
        const passed =
          res.expected_output?.trim() === res.actual_output?.trim();
        return { ...res, status: passed ? "Passed" : "Failed" };
      });
      const normalSummary = computedNormalResults.reduce(
        (acc, cur) => {
          if (cur.status === "Passed") acc.passed++;
          else acc.failed++;
          return acc;
        },
        { passed: 0, failed: 0 }
      );

      const sampleResults = results.filter((r) => r.type === "sample");
      setSampleTestCaseResults(sampleResults);

      const hiddenResults = results.filter(
        (r) => r.type === "hidden" || r.type === "sample"
      );
      const computedHiddenResults = hiddenResults.map((res) => {
        const passed =
          res.expected_output?.trim() === res.actual_output?.trim();
        return { ...res, status: passed ? "Passed" : "Failed" };
      });
      const hiddenSummary = computedHiddenResults.reduce(
        (acc, cur) => {
          if (cur.status === "Passed") acc.passed++;
          else acc.failed++;
          return acc;
        },
        { passed: 0, failed: 0 }
      );

      setTestCaseResultsMap((prev) => ({
        ...prev,
        [initialIndex]: {
          results: computedNormalResults,
          summary: normalSummary,
        },
      }));
      setHiddenCaseResultsMap((prev) => ({
        ...prev,
        [initialIndex]: {
          results: computedHiddenResults,
          summary: hiddenSummary,
        },
      }));
      setTestCaseSummary(normalSummary);
      setTestCases(computedNormalResults);
      setHiddenTestCaseResults(computedHiddenResults);
      setHiddenTestCaseSummary(hiddenSummary);

      if (hiddenSummary.passed === computedHiddenResults.length) {
        toast.success("All test cases passed! Question solved successfully.");
      } else if (hiddenSummary.failed > 0) {
        toast.warn("Some test cases failed. Please check your code.");
      }
    } catch (error) {
      console.error("Error in handleRun:", error);
      setTestCases([]);
      setHiddenTestCaseResults([]);
      setSampleTestCaseResults([]);
      toast.error(error.response?.data?.message || "Failed to run code.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (subjectname && topicname && subtopic && tags) {
      navigate(`/code-playground/${subjectname}/${topicname}/${subtopic}`, {
        state: { tag: tags },
      });
    } else {
      console.warn(
        "Navigation details missing, navigating to default coding page"
      );
      toast.warn(
        "Unable to determine navigation details, returning to coding page."
      );
      navigate("/code-playground");
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gray-900 text-white mt-2 p-4 m-4">
      <div className="md:w-1/2 w-full p-4 md:border-r border-gray-700 overflow-y-auto">
        {isLoadingQuestion ? (
          <p className="text-gray-300">Loading question data...</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Question {question.Question_No || initialIndex + 1}
            </h1>
            {question?.Question ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold">Question:</h2>
                  <p className="text-gray-300">{question.Question}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Constraints:</h3>
                  <p className="text-gray-300">
                    {question.Constraints || "No constraints provided."}
                  </p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Difficulty:</h3>
                  <p className="text-gray-300">
                    {question.Difficulty || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Sample Input:</h3>
                  <div className="bg-gray-800 p-2 rounded text-gray-300">
                    {question.Sample_Input !== undefined &&
                    String(question.Sample_Input).trim() ? (
                      <pre className="whitespace-pre-wrap break-words">
                        Input:{"\n"}
                        {cleanedSampleInput}
                      </pre>
                    ) : (
                      <p className="text-gray-300">
                        No sample input available.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Sample Output:</h3>
                  <div className="bg-gray-800 p-2 rounded text-gray-300">
                    {question.Sample_Output !== undefined &&
                    String(question.Sample_Output).trim() ? (
                      <pre className="whitespace-pre-wrap break-words">
                        Output:{"\n"}
                        {cleanedSampleOutput}
                      </pre>
                    ) : (
                      <p className="text-gray-300">
                        No sample output available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                No question data available. Ensure you have the correct question
                object.
              </p>
            )}
          </>
        )}
      </div>
      <div className="md:w-1/2 w-full p-4 flex flex-col overflow-y-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div className="mb-2 md:mb-0">
            <label className="block font-semibold mb-1">Select Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white border border-gray-500 rounded px-2 py-1"
            >
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C">C</option>
              <option value="C++">C++</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-500"
            >
              Back
            </button>
            <button
              onClick={handleRun}
              disabled={loading || !questionId}
              className={`px-4 py-2 text-white rounded ${
                loading || !questionId
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {loading ? "Running..." : "Run"}
            </button>
            <button
              // onClick={handleRun}
              disabled={loading || !questionId}
              className={`px-4 py-2 text-white rounded ${
                loading || !questionId
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
        <div className="border border-gray-600 rounded mb-4 flex-grow bg-[#1E1E1E] min-h-[400px] max-h-[500px] overflow-auto">
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={[EditorView.lineWrapping, languageExtensions[language]]}
            onChange={handleCodeChange}
          />
        </div>
        <TestCaseTabs testCases={sampleTestCaseResults} />
      </div>
    </div>
  );
}

export default CPOnlineCompiler;
