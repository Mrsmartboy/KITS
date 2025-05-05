import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { decryptData } from "../../cryptoUtils";
import axios from "axios";
import TestCaseTabsNew from "./TestCaseTabs";
import { Position } from "@react-pdf-viewer/core";

const languageExtensions = {
  Python: "python",
  C: "cpp",
  "C++": "cpp",

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
      Score: Number(question.Score),
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
      // navigate(`/code-playground/${subjectname}/${topicname}/${subtopic}`, {
      //   state: { tag: tags },
      // });
      navigate(-1);
    } else navigate("/code-playground");
  };

  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  /* ─────────── render ─────────── */
  return (
    <div
      className="h-screen flex flex-col font-[Inter] bg-[#1E1E1E] overflow-hidden"
      onCopy={prevent}
      onCut={prevent}
      onPaste={prevent}
      onContextMenu={prevent}
      onMouseDown={prevent}
      onSelectStart={prevent}
    >
      {/* Main Compiler Container */}
      <div className="flex-1 m-4 md:m-6 p-4 md:p-6 border-2 border-gray-700 rounded-lg flex flex-col overflow-hidden">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[45%_52%] gap-6 overflow-hidden">
          {/* Left Side - Question Panel */}
          <div className="flex flex-col gap-6 bg-gray-800 p-4 rounded-md overflow-hidden">
            {/* Code Practice Button */}
            <div
              className="flex items-center gap-2 px-4 py-2 border-2 border-[#6E6E6E] bg-[#1E1E1E] rounded-lg w-fit cursor-pointer"
              onClick={handleBack}
            >
              <FaArrowLeft className="text-white w-4 h-4" />
              <div className="text-white text-base font-medium">
                Code Playground
              </div>
            </div>

            {/* Question Box */}
            <div className="flex-1 bg-[#1E1E1E] border border-[rgba(216,216,216,0.8)] rounded-lg overflow-auto">
              {isLoadingQuestion ? (
                <div className="p-6 text-white text-base font-medium">
                  Loading question data...
                </div>
              ) : (
                <div className="flex flex-col gap-4 p-6 text-white text-base font-medium leading-5">
                  <div>Question {question.Question_No || initIndex + 1}</div>
                  <div>
                    <div>Question:</div>
                    <div>{question.Question || "No question available."}</div>
                  </div>
                  <div>
                    <div>Constraints:</div>
                    <div>
                      {question.Constraints || "No constraints provided."}
                    </div>
                  </div>
                  <div>
                    <div>Difficulty:</div>
                    <div>{question.Difficulty || "Not specified"}</div>
                  </div>
                  <div>Sample Input:</div>
                  <div className="bg-[#525252] rounded-lg min-h-[70px] p-4 flex items-center overflow-x-auto">
                    {cleanedSampleInput.trim() ? (
                      <pre className="whitespace-pre-wrap break-words">
                        {cleanedSampleInput}
                      </pre>
                    ) : (
                      "No sample input available."
                    )}
                  </div>
                  <div>Sample Output:</div>
                  <div className="bg-[#525252] rounded-lg min-h-[52px] p-4 flex items-center overflow-x-auto">
                    {cleanedSampleOutput.trim() ? (
                      <pre className="whitespace-pre-wrap break-words">
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
          <div className="flex flex-col gap-6 bg-gray-800 p-4 rounded-md overflow-hidden">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center gap-3 px-3 py-2 border-2 border-[#BABABA] bg-[#1E1E1E] rounded-md flex-shrink-0 cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <div className="text-white text-base font-medium">
                    {language}
                  </div>
                  <FaChevronDown
                    className={`text-white w-5 h-5 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#1E1E1E] border border-[#BABABA] rounded-md shadow-lg z-10">
                    {Object.keys(languageExtensions).map((lang) => (
                      <div
                        key={lang}
                        className="px-3 py-2 text-white text-base font-medium hover:bg-[#2A2A2A] cursor-pointer"
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <button
                  onClick={() => handleRun()}
                  disabled={loading || !questionId}
                  className={`px-7 py-2 border-2 border-[#BABABA] bg-[#1E1E1E] text-white rounded-md font-medium ${
                    loading || !questionId
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#2A2A2A]"
                  }`}
                >
                  {loading ? "Running..." : "Run"}
                </button>
                <button
                  onClick={() => handleRun(true)}
                  disabled={loading || !questionId}
                  className={`px-4 py-2 border-2 border-[#BABABA] bg-[#129E00] text-white rounded-md font-medium ${
                    loading || !questionId
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#0F7A00]"
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Editor + Output Section */}
            <div className="flex flex-col flex-1 gap-6 overflow-hidden">
              {/* Code Editor */}
              <div className="flex flex-col flex-1 bg-[#1E1E1E] border border-[rgba(216,216,216,0.8)] rounded-lg overflow-hidden">
                <div className="bg-[#525252] rounded-t-lg flex items-center h-9 px-4">
                  <div className="text-white text-base font-medium">
                    {initIndex + 1}
                  </div>
                </div>
                <div className="flex-1 h-full">
                  <Editor
                    height="100%"
                    language={languageExtensions[language]}
                    value={code}
                    theme="vs-dark"
                    onChange={handleCodeChange}
                    options={{
                      contextmenu: false, // disable Monaco context menu
                      minimap: { enabled: false },
                      fontSize: 16,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      // turn off any inline suggestions/snippets
                      suggestOnTriggerCharacters: false,
                      acceptSuggestionOnEnter: false,
                      quickSuggestions: false,
                      suggest: {
                        showSnippets: false,
                        showWords: false,
                      },
                    }}
                    onMount={(editor, monaco) => {
                      // swallow Ctrl/Cmd + C, V, X
                      editor.onKeyDown((e) => {
                        if (
                          (e.ctrlKey || e.metaKey) &&
                          ["KeyC", "KeyV", "KeyX"].includes(e.browserEvent.code)
                        ) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      });
                    }}
                  />
                </div>
              </div>

              {/* Output Section */}
              <div className="flex flex-col flex-1 bg-[#1E1E1E] border border-[rgba(216,216,216,0.8)] rounded-lg p-4 gap-4 overflow-hidden">
                {sampleTestCaseResults.length === 0 ? (
                  <div className="flex-1 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4 text-white overflow-auto">
                    Run Code to display Result
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <TestCaseTabsNew testCases={sampleTestCaseResults} />
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
          <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-6 w-96">
            {modalLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#129E00]"></div>
                <p className="text-white text-lg">Processing Submission...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  Submission Result
                </h2>
                <p className="text-white text-center">
                  {hiddenTestCaseSummary.failed === 0
                    ? "All test cases passed! 🎉"
                    : hiddenTestCaseSummary.failed > 0
                    ? `${hiddenTestCaseSummary.passed}/${
                        hiddenTestCaseSummary.passed +
                        hiddenTestCaseSummary.failed
                      } cases passed.`
                    : "Test cases not passed."}
                </p>
                {hiddenTestCaseSummary.failed > 0 && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-[#129E00] text-white rounded-md hover:bg-[#0F7A00]"
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
