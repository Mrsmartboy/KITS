/* CPOnlineCompiler.jsx */
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

const languageExtensions = {
  Python: python(),
  Java: java(),
  C: cpp(),
  "C++": cpp(),
  JavaScript: javascript(),
};

function CPOnlineCompiler() {
  /* ─────────── routing state ─────────── */
  const { state: loc = {} } = useLocation();
  const navigate = useNavigate();

  const {
    question: initQuestion = {},
    index: initIndex = 0,
    questions: initList = [],
    codeMap: initCodeMap = {},
    subjectname,
    topicname,
    subtopic,
    tag,
    prog_sourceCode, // ← passed from list page
    prog_results, // ← passed from list page
  } = loc;

  /* ─────────── derived identifiers ─────────── */
  const questionId = initQuestion?.questionId;
  const subject = initQuestion?.Subject?.toLowerCase() || "python";
  const tags = tag || initQuestion?.Tags?.toLowerCase() || "day-1:1";
  const questionType = initQuestion?.Question_Type || "code_test";
  const testerId =
    decryptData(sessionStorage.getItem("student_login_details") || "") || "";

  /* ─────────── state ─────────── */
  const [question, setQuestion] = useState(initQuestion);
  const [codeMap, setCodeMap] = useState(initCodeMap);

  /* ❶ initial editor content:   codeMap > prog_sourceCode > "" */
  const [code, setCode] = useState(
    initCodeMap[initIndex] ?? prog_sourceCode ?? ""
  );

  const [language, setLanguage] = useState("Python");
  const [customInputEnabled, setCustom] = useState(false);
  const [customInput, setCustInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuest] = useState(false);

  const [testCases, setTestCases] = useState([]);
  const [testCaseSummary, setTestCaseSummary] = useState({
    passed: 0,
    failed: 0,
  });
  const [hiddenTestCaseResults, setHiddenResults] = useState([]);
  const [hiddenTestCaseSummary, setHiddenSummary] = useState({
    passed: 0,
    failed: 0,
  });
  const [testCaseResultsMap, setResultsMap] = useState({});
  const [hiddenCaseResultsMap, setHiddenResultsMap] = useState({});
  const [sampleTestCaseResults, setSampleResults] = useState(
    prog_results || []
  );

  /* ─────────── when location.state changes ─────────── */
  useEffect(() => {
    const {
      question: newQ = {},
      index: newIdx = 0,
      codeMap: newMap = {},
    } = loc;

    if (!Array.isArray(loc.questions) || loc.questions.length === 0) {
      console.warn("Questions list is empty or invalid:", loc.questions);
      return;
    }

    setQuestion(newQ);
    setCodeMap(newMap);
    setCode(newMap[newIdx] ?? loc.prog_sourceCode ?? ""); // ← keep prog_sourceCode
  }, [loc]);

  /* ─────────── keep editor in sync with map/index ─────────── */
  useEffect(() => {
    setCode(codeMap[initIndex] ?? prog_sourceCode ?? "");
  }, [initIndex, codeMap, prog_sourceCode]);

  /* ─────────── fetch question only if needed ─────────── */
  const fetchQuestionData = useCallback(async () => {
    if (!questionId || question.Question) return;
    setIsLoadingQuest(true);
    try {
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/question-crud?subject=${subject}&questionId=${questionId}&questionType=${questionType}`;

      const { data } = await axios.get(url);
      if (data?.codeQuestions?.length) setQuestion(data.codeQuestions[0]);
      else toast.error("Question not found in database.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load question data.");
    } finally {
      setIsLoadingQuest(false);
    }
  }, [questionId, subject, questionType]);

  useEffect(() => {
    fetchQuestionData();
  }, [fetchQuestionData]);

  /* ─────────── processed inputs / outputs ─────────── */
  const clean = (txt, trimEnd = false) =>
    typeof txt === "string"
      ? txt
          .replace(/\r/g, "")
          .split("\n")
          .map((l) => (trimEnd ? l.trimEnd() : l.trim()))
          .join("\n")
      : String(txt ?? "");

  const cleanedSampleInput = clean(question?.Sample_Input);
  const cleanedSampleOutput = clean(question?.Sample_Output, true);

  const processHidden = (arr = []) =>
    arr.map((tc) => ({
      ...tc,
      Input: clean(tc.Input),
      Output: clean(tc.Output, true),
    }));

  /* ─────────── editor change ─────────── */
  const handleCodeChange = (val) => {
    setCode(val);
    setCodeMap((prev) => ({ ...prev, [initIndex]: val }));
  };

  /* ─────────── run / submit ─────────── */
  const handleRun = async () => {
    if (!questionId) {
      toast.error("No question ID found!");
      return;
    }

    setLoading(true);

    const hiddenWithSample = [
      ...processHidden(question.Hidden_Test_Cases),
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
      hidden_test_cases: hiddenWithSample,
      sample_input: question.Sample_Input,
      sample_output: question.Sample_Output,
      Score: question.Score,
      type: question.Question_Type,
    };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-cpsubmissions`,
        bodyData
      );
      const { results } = data;

      /* ---- normal (custom input) ---- */
      const normalRes = customInputEnabled
        ? results.filter((r) => r.type === "normal")
        : [];
      const normComp = normalRes.map((r) => ({
        ...r,
        status:
          r.expected_output?.trim() === r.actual_output?.trim()
            ? "Passed"
            : "Failed",
      }));
      const normSum = normComp.reduce(
        (a, r) => {
          r.status === "Passed" ? a.passed++ : a.failed++;
          return a;
        },
        { passed: 0, failed: 0 }
      );

      /* ---- hidden + sample ---- */
      const hiddenRes = results.filter(
        (r) => r.type === "hidden" || r.type === "sample"
      );
      const hidComp = hiddenRes.map((r) => ({
        ...r,
        status:
          r.expected_output?.trim() === r.actual_output?.trim()
            ? "Passed"
            : "Failed",
      }));
      const hidSum = hidComp.reduce(
        (a, r) => {
          r.status === "Passed" ? a.passed++ : a.failed++;
          return a;
        },
        { passed: 0, failed: 0 }
      );

      /* ---- update state ---- */
      setResultsMap((prev) => ({
        ...prev,
        [initIndex]: { results: normComp, summary: normSum },
      }));
      setHiddenResultsMap((prev) => ({
        ...prev,
        [initIndex]: { results: hidComp, summary: hidSum },
      }));
      setTestCases(normComp);
      setTestCaseSummary(normSum);
      setHiddenResults(hidComp);
      setHiddenSummary(hidSum);
      setSampleResults(results);

      if (hidSum.failed === 0) toast.success("All test cases passed!");
      else toast.warn("Some test cases failed.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to run code.");
      setTestCases([]);
      setHiddenResults([]);
      setSampleResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── back nav ─────────── */
  const handleBack = () => {
    if (subjectname && topicname && subtopic) {
      navigate(`/code-playground/${subjectname}/${topicname}/${subtopic}`, {
        state: { tag: tags },
      });
    } else navigate("/code-playground");
  };

  /* ─────────── render ─────────── */
  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gray-900 text-white mt-2 p-4 m-4">
      {/* ----- left: question ----- */}
      <div className="md:w-1/2 w-full p-4 md:border-r border-gray-700 overflow-y-auto">
        {isLoadingQuestion ? (
          <p className="text-gray-300">Loading question data...</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Question {question.Question_No || initIndex + 1}
            </h1>

            {question?.Question ? (
              <div className="space-y-3">
                {/* question body */}
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
                {/* sample I/O */}
                <div>
                  <h3 className="text-md font-semibold">Sample Input:</h3>
                  <div className="bg-gray-800 p-2 rounded text-gray-300">
                    {cleanedSampleInput.trim() ? (
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
                    {cleanedSampleOutput.trim() ? (
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
              <p className="text-gray-400">No question data available.</p>
            )}
          </>
        )}
      </div>

      {/* ----- right: editor ----- */}
      <div className="md:w-1/2 w-full p-4 flex flex-col overflow-y-auto">
        {/* controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div className="mb-2 md:mb-0">
            <label className="block font-semibold mb-1">Select Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white border border-gray-500 rounded px-2 py-1"
            >
              {Object.keys(languageExtensions).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
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
          </div>
        </div>

        {/* editor */}
        <div className="border border-gray-600 rounded mb-4 flex-grow bg-[#1E1E1E] min-h-[400px] max-h-[500px] overflow-auto">
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={[EditorView.lineWrapping, languageExtensions[language]]}
            onChange={handleCodeChange}
          />
        </div>

        {/* results */}
        <div>
          {sampleTestCaseResults.length === 0 ? (
            <div className="border border-gray-600 rounded bg-[#1E1E1E] mb-4 p-4">
              Run Code to display Result
            </div>
          ) : (
            <TestCaseTabs testCases={sampleTestCaseResults} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CPOnlineCompiler;
