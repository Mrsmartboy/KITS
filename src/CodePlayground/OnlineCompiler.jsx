import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaArrowLeft, FaChevronDown, FaSun, FaMoon } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { decryptData } from "../../cryptoUtils";
import axios from "axios";
import TestCaseTabsNew from "./TestCaseTabs";
import { Position } from "@react-pdf-viewer/core";

const languageExtensions = {
  Python: "python",
  Java: "java",
  C: "cpp",
  "C++": "cpp",
  JavaScript: "javascript",
};

function CPOnlineCompiler() {
  const [theme, setTheme] = useState("dark"); // Default theme is dark

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
    prog_sourceCode,
    prog_results,
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
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ─────────── handle dropdown toggle and click outside ─────────── */
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ─────────── toggle theme ─────────── */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
    setCode(newMap[newIdx] ?? loc.prog_sourceCode ?? "");
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
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/question-crud?subject=${subject}&questionId=${questionId}&questionType=${questionType}`;

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
  const handleRun = async (isSubmit = false) => {
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

      if (hidSum.failed === 0) {
        toast.success("All test cases passed!", { position: "bottom-left" });
      } else {
        toast.warn(
          `Some test cases failed. Passed: ${hidSum.passed}/${
            hidSum.passed + hidSum.failed
          }`,
          { position: "bottom-left" }
        );
      }

      if (isSubmit) {
        setModalLoading(true);
        setShowModal(true);
        setTimeout(() => {
          setModalLoading(false);
          if (hidSum.failed === 0) {
            handleBack();
          }
        }, 1000); // Simulate loading delay
      }
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
  const isDarkTheme = theme === "dark";

  return (
    <div
      className={`h-screen flex flex-col font-[Inter] ${
        isDarkTheme ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-900"
      } overflow-hidden`}
    >
      {/* Theme Toggle Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className={`px-3 py-2 rounded-lg font-medium text-sm ${
            isDarkTheme
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
          }`}
        >
          {isDarkTheme ? (
            <>
              <FaSun className="inline mr-2" /> Light Theme
            </>
          ) : (
            <>
              <FaMoon className="inline mr-2" /> Dark Theme
            </>
          )}
        </button>
      </div>

      {/* Main Compiler Container */}
      <div className={`flex-1 m-4 md:m-6 p-4 md:p-6 border-2 ${
        isDarkTheme ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-100"
      } rounded-lg flex flex-col overflow-hidden`}>
        <div className={`flex-1 grid grid-cols-1 lg:grid-cols-[45%_52%] gap-6 overflow-hidden ${
          isDarkTheme ? "bg-gray-800" : "bg-gray-100"
        }`}>
          {/* Left Side - Question Panel */}
          <div className={`flex flex-col gap-6 ${
            isDarkTheme ? "bg-gray-800" : "bg-white"
          } p-4 rounded-md overflow-hidden`}>
            <div
              className={`flex items-center gap-2 px-4 py-2 border-2 ${
                isDarkTheme
                  ? "border-[#6E6E6E] bg-[#1E1E1E]"
                  : "border-gray-300 bg-gray-50"
              } rounded-lg w-fit cursor-pointer`}
              onClick={handleBack}
            >
              <FaArrowLeft className="text-inherit w-4 h-4" />
              <div className="text-inherit text-base font-medium">
                Code Playground
              </div>
            </div>

            <div className={`flex-1 ${
              isDarkTheme
                ? "bg-[#1E1E1E] border-[rgba(216,216,216,0.8)]"
                : "bg-white border-gray-200"
            } border rounded-lg overflow-auto`}>
              {isLoadingQuestion ? (
                <div className="p-6 text-inherit text-base font-medium">
                  Loading question data...
                </div>
              ) : (
                <div className="flex flex-col gap-4 p-6 text-inherit text-base font-medium leading-5">
                  <div>Question {question.Question_No || initIndex + 1}</div>
                  <div>
                    <div>Question:</div>
                    <div>{question.Question || "No question available."}</div>
                  </div>
                  <div>
                    <div>Constraints:</div>
                    <div>{question.Constraints || "No constraints provided."}</div>
                  </div>
                  <div>
                    <div>Difficulty:</div>
                    <div>{question.Difficulty || "Not specified"}</div>
                  </div>
                  <div>Sample Input:</div>
                  <div
                    className={`bg-${
                      isDarkTheme ? "#525252" : "#E5E7EB"
                    } rounded-lg min-h-[70px] p-4 flex items-center overflow-x-auto`}
                  >
                    {cleanedSampleInput.trim() ? (
                      <pre className="whitespace-pre-wrap break-words text-inherit">
                        {cleanedSampleInput}
                      </pre>
                    ) : (
                      "No sample input available."
                    )}
                  </div>
                  <div>Sample Output:</div>
                  <div
                    className={`bg-${
                      isDarkTheme ? "#525252" : "#E5E7EB"
                    } rounded-lg min-h-[52px] p-4 flex items-center overflow-x-auto`}
                  >
                    {cleanedSampleOutput.trim() ? (
                      <pre className="whitespace-pre-wrap break-words text-inherit">
                        {cleanedSampleOutput}
                      </pre>
                    ) : (
                      "No sample output available."
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Editor Panel */}
          <div className={`flex flex-col gap-6 ${
            isDarkTheme ? "bg-gray-800" : "bg-white"
          } p-4 rounded-md overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
              <div className="relative" ref={dropdownRef}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 border-2 ${
                    isDarkTheme
                      ? "border-[#BABABA] bg-[#1E1E1E]"
                      : "border-gray-300 bg-gray-50"
                  } rounded-md flex-shrink-0 cursor-pointer`}
                  onClick={toggleDropdown}
                >
                  <div className="text-inherit text-base font-medium">
                    {language}
                  </div>
                  <FaChevronDown
                    className={`text-inherit w-5 h-5 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isDropdownOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-full ${
                    isDarkTheme
                      ? "bg-[#1E1E1E] border-[#BABABA]"
                      : "bg-white border-gray-300"
                  } border rounded-md shadow-lg z-10`}>
                    {Object.keys(languageExtensions).map((lang) => (
                      <div
                        key={lang}
                        className={`px-3 py-2 text-inherit text-base font-medium hover:${
                          isDarkTheme ? "bg-[#2A2A2A]" : "bg-gray-100"
                        } cursor-pointer`}
                        onClick={() => {
                          setLanguage(lang);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <button
                  onClick={() => handleRun()}
                  disabled={loading || !questionId}
                  className={`px-7 py-2 border-2 ${
                    isDarkTheme
                      ? "border-[#BABABA] bg-[#1E1E1E]"
                      : "border-gray-300 bg-gray-50"
                  } text-inherit rounded-md font-medium ${
                    loading || !questionId
                      ? "opacity-50 cursor-not-allowed"
                      : isDarkTheme
                      ? "hover:bg-[#2A2A2A]"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {loading ? "Running..." : "Run"}
                </button>
                <button
                  onClick={() => handleRun(true)}
                  disabled={loading || !questionId}
                  className={`px-4 py-2 border-2 ${
                    isDarkTheme
                      ? "border-[#BABABA] bg-[#129E00]"
                      : "border-gray-300 bg-green-600"
                  } text-white rounded-md font-medium ${
                    loading || !questionId
                      ? "opacity-50 cursor-not-allowed"
                      : isDarkTheme
                      ? "hover:bg-[#0F7A00]"
                      : "hover:bg-green-700"
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>

            <div className="flex flex-col flex-1 gap-6 overflow-hidden">
              <div className={`flex flex-col flex-1 ${
                isDarkTheme
                  ? "bg-[#1E1E1E] border-[rgba(216,216,216,0.8)]"
                  : "bg-white border-gray-200"
              } border rounded-lg overflow-hidden`}>
                <div className={`bg-${
                  isDarkTheme ? "#525252" : "#E5E7EB"
                } rounded-t-lg flex items-center h-9 px-4`}>
                  <div className="text-inherit text-base font-medium">
                    {initIndex + 1}
                  </div>
                </div>
                <div className="flex-1 h-full">
                  <Editor
                    height="100%"
                    language={languageExtensions[language]}
                    value={code}
                    theme={isDarkTheme ? "vs-dark" : "vs-light"}
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>

              <div className={`flex flex-col flex-1 ${
                isDarkTheme
                  ? "bg-[#1E1E1E] border-[rgba(216,216,216,0.8)]"
                  : "bg-white border-gray-200"
              } border rounded-lg p-4 gap-4 overflow-hidden`}>
                {sampleTestCaseResults.length === 0 ? (
                  <div className={`flex-1 ${
                    isDarkTheme
                      ? "bg-[#1E1E1E] border-[#3A3A3A]"
                      : "bg-gray-100 border-gray-300"
                  } border rounded-lg p-4 text-inherit overflow-auto`}>
                    Run Code to display Result
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <TestCaseTabsNew
                      testCases={sampleTestCaseResults}
                      theme={theme}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-${
            isDarkTheme ? "#1E1E1E" : "white"
          } border ${
            isDarkTheme ? "border-[#3A3A3A]" : "border-gray-300"
          } rounded-lg p-6 w-96`}>
            {modalLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#129E00]"></div>
                <p className="text-inherit text-lg">Processing Submission...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-semibold text-inherit">
                  Submission Result
                </h2>
                <p className="text-inherit text-center">
                  {hiddenTestCaseSummary.failed === 0
                    ? "All test cases passed! 🎉"
                    : hiddenTestCaseSummary.failed > 0
                    ? `${hiddenTestCaseSummary.passed}/${
                        hiddenTestCaseSummary.passed + hiddenTestCaseSummary.failed
                      } cases passed.`
                    : "Test cases not passed."}
                </p>
                {hiddenTestCaseSummary.failed > 0 && (
                  <button
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 ${
                      isDarkTheme
                        ? "bg-[#129E00] hover:bg-[#0F7A00]"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white rounded-md`}
                  >
                    Close
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CPOnlineCompiler;