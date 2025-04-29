import React, { useState, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { useLocation, useNavigate } from "react-router-dom";
import TestCaseTabs from "./TestCaseTabs";
import { toast } from "react-toastify";
import { decryptData } from "../../cryptoUtils";
import axios from "axios";
import { CheckCircle } from "lucide-react";

function OnlineCompiler() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state || {};
  const {
    question: initialQuestion = {},
    index: initialIndex = 0,
    questions: initialQuestionsList = [],
    codeMap: initialCodeMap = {},
  } = locationState;
  const questionId = initialQuestion?.questionId;
  const subject = initialQuestion?.Subject?.toLowerCase() || "python";
  const tags = initialQuestion?.Tags?.toLowerCase() || "day-1:1";
  const questionType = initialQuestion?.Question_Type || "code_test";
  const testerId = decryptData(sessionStorage.getItem("Testers") || "") || "";

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
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedSourceCode, setVerifiedSourceCode] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState({
    ...initialQuestion,
    Hidden_Test_Cases: Array.isArray(initialQuestion?.Hidden_Test_Cases)
      ? initialQuestion.Hidden_Test_Cases
      : [],
  });

  const languageExtensions = {
    Python: python(),
    Java: java(),
    C: cpp(),
    "C++": cpp(),
    JavaScript: javascript(),
  };

  // Update state when location.state changes
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
    setEditedQuestion({
      ...newQuestion,
      Hidden_Test_Cases: Array.isArray(newQuestion?.Hidden_Test_Cases)
        ? newQuestion.Hidden_Test_Cases
        : [],
    });
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
        setEditedQuestion({
          ...fetchedQuestion,
          Hidden_Test_Cases: Array.isArray(fetchedQuestion.Hidden_Test_Cases)
            ? fetchedQuestion.Hidden_Test_Cases
            : [],
        });
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

  const fetchVerificationStatus = useCallback(async () => {
    if (!questionId || !testerId) return;
    try {
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/verify-question?internId=${testerId}&subject=${subject}&questionType=${questionType}`;
      const response = await axios.get(url);
      const data = response.data;
      if (!data.success || !Array.isArray(data.verifications)) {
        throw new Error("Invalid verification response");
      }
      const verification = data.verifications.find(
        (v) => v.questionId === questionId && v.tag === tags && v.verified
      );
      const isQuestionVerified = !!verification;
      const sourceCode = verification?.sourceCode || "";
      console.log("Verification status:", { isQuestionVerified, sourceCode });
      setIsVerified(isQuestionVerified);
      setVerifiedSourceCode(sourceCode);
      if (isQuestionVerified && sourceCode) {
        setCodeMap((prev) => ({ ...prev, [initialIndex]: sourceCode }));
        setCode(sourceCode);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      toast.error("Failed to fetch verification status.");
    }
  }, [questionId, testerId, subject, questionType, tags, initialIndex]);

  useEffect(() => {
    fetchQuestionData();
    fetchVerificationStatus();
  }, [fetchQuestionData, fetchVerificationStatus, initialIndex]);

  useEffect(() => {
    setCode(codeMap[initialIndex] || "");
  }, [initialIndex, codeMap]);

  useEffect(() => {
    setEditedQuestion({
      ...question,
      Hidden_Test_Cases: Array.isArray(question?.Hidden_Test_Cases)
        ? question.Hidden_Test_Cases
        : [],
    });
  }, [question]);

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

  const handleSave = async () => {
    if (!questionId) {
      toast.error("No question ID found! Cannot save changes.");
      return;
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/question-crud`,
        editedQuestion
      );
      console.log("Question updated:", response.data);
      setQuestion(editedQuestion);
      setIsEditing(false);
      toast.success("Question updated successfully!");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditedQuestion({
      ...question,
      Hidden_Test_Cases: Array.isArray(question?.Hidden_Test_Cases)
        ? question.Hidden_Test_Cases
        : [],
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHiddenTestCaseChange = (index, field, value) => {
    setEditedQuestion((prev) => {
      const updatedHiddenTestCases = [...(prev.Hidden_Test_Cases || [])];
      updatedHiddenTestCases[index] = {
        ...updatedHiddenTestCases[index],
        [field]: value,
      };
      return { ...prev, Hidden_Test_Cases: updatedHiddenTestCases };
    });
  };

  const addHiddenTestCase = () => {
    setEditedQuestion((prev) => ({
      ...prev,
      Hidden_Test_Cases: [
        ...(prev.Hidden_Test_Cases || []),
        { Input: "", Output: "" },
      ],
    }));
  };

  const removeHiddenTestCase = (index) => {
    setEditedQuestion((prev) => ({
      ...prev,
      Hidden_Test_Cases: (prev.Hidden_Test_Cases || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

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
      ...processedHiddenTestCases(editedQuestion.Hidden_Test_Cases),
      {
        Input: cleanedSampleInput,
        Output: cleanedSampleOutput,
        type: "sample",
      },
    ];
    const bodyData = {
      internId: testerId,
      question_id: questionId,
      source_code: code,
      language,
      custom_input_enabled: customInputEnabled,
      custom_input: customInput,
      description: editedQuestion.Question,
      constraints: editedQuestion.Constraints,
      difficulty: editedQuestion.Difficulty,
      hidden_test_cases: hiddenTestCasesWithSample,
      sample_input: editedQuestion.Sample_Input,
      sample_output: editedQuestion.Sample_Output,
      Score: Number(editedQuestion.Score),
      type: editedQuestion.Question_Type,
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-submission`,
        bodyData
      );
      const { results } = response.data;

      // Process normal test cases (only for custom input)
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

      // Process hidden and sample test cases
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

      // Update state
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
    } catch (error) {
      console.error("Error in handleRun:", error);
      setTestCases([]);
      setHiddenTestCaseResults([]);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    console.log("handleNext called", {
      initialIndex,
      questionsList: initialQuestionsList,
    });
    if (
      initialQuestionsList &&
      initialIndex < initialQuestionsList.length - 1
    ) {
      const nextIndex = initialIndex + 1;
      const nextQuestion = initialQuestionsList[nextIndex];
      console.log("Navigating to next question:", { nextIndex, nextQuestion });
      navigate("/testing/compiler", {
        state: {
          question: nextQuestion,
          index: nextIndex,
          questions: initialQuestionsList,
          codeMap,
        },
      });
    } else {
      console.log("Cannot navigate to next question");
      toast.info("No more questions.");
    }
  };

  const handlePrevious = () => {
    console.log("handlePrevious called", {
      initialIndex,
      questionsList: initialQuestionsList,
    });
    if (initialQuestionsList && initialIndex > 0) {
      const prevIndex = initialIndex - 1;
      const prevQuestion = initialQuestionsList[prevIndex];
      console.log("Navigating to previous question:", {
        prevIndex,
        prevQuestion,
      });
      navigate("/testing/compiler", {
        state: {
          question: prevQuestion,
          index: prevIndex,
          questions: initialQuestionsList,
          codeMap,
        },
      });
    } else {
      console.log("Cannot navigate to previous question");
      toast.info("This is the first question.");
    }
  };

  const handleBack = () => {
    if (subject && tags) {
      navigate(`/testing/coding?subject=${subject}&tags=${tags}`);
    } else {
      console.warn(
        "Subject or tags missing, navigating to default coding page"
      );
      toast.warn(
        "Unable to determine subject or tags, returning to coding page."
      );
      navigate("/testing/coding");
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gray-900 text-white mt-2 p-4 m-4">
      <div className="md:w-1/2 w-full p-4 md:border-r border-gray-700 overflow-y-auto">
        {isLoadingQuestion ? (
          <p className="text-gray-300">Loading question data...</p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              {isVerified ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={24} />
                  <span className="text-lg font-semibold">
                    Question is verified
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle size={24} className="opacity-50" />
                  <span className="text-lg font-semibold">
                    Question is not verified
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">
                Question {question.Question_No || initialIndex + 1}
              </h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 underline"
                >
                  Edit
                </button>
              ) : (
                <div>
                  <button
                    onClick={handleSave}
                    className="text-green-400 underline mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-red-400 underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {question?.Question ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold">Question:</h2>
                  {isEditing ? (
                    <textarea
                      className="bg-gray-800 p-2 rounded text-gray-300 whitespace-pre-wrap w-full"
                      value={editedQuestion.Question || ""}
                      onChange={(e) =>
                        handleInputChange("Question", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-300">{editedQuestion.Question}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-md font-semibold">Constraints:</h3>
                  {isEditing ? (
                    <textarea
                      className="bg-gray-800 p-2 rounded text-gray-300 whitespace-pre-wrap w-full"
                      value={editedQuestion.Constraints || ""}
                      onChange={(e) =>
                        handleInputChange("Constraints", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-300">
                      {editedQuestion.Constraints}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-md font-semibold">Difficulty:</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      className="bg-gray-800 p-2 rounded text-gray-300 w-full"
                      value={editedQuestion.Difficulty || ""}
                      onChange={(e) =>
                        handleInputChange("Difficulty", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-300">{editedQuestion.Difficulty}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-md font-semibold">Sample Input:</h3>
                  {isEditing ? (
                    <textarea
                      className="bg-gray-800 p-2 rounded text-gray-300 whitespace-pre-wrap w-full"
                      value={
                        editedQuestion.Sample_Input !== undefined
                          ? String(editedQuestion.Sample_Input)
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange("Sample_Input", e.target.value)
                      }
                    />
                  ) : (
                    <div className="bg-gray-800 p-2 rounded text-gray-300">
                      {editedQuestion.Sample_Input !== undefined &&
                      String(editedQuestion.Sample_Input).trim() ? (
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
                  )}
                </div>
                <div>
                  <h3 className="text-md font-semibold">Sample Output:</h3>
                  {isEditing ? (
                    <textarea
                      className="bg-gray-800 p-2 rounded text-gray-300 whitespace-pre-wrap w-full"
                      value={
                        editedQuestion.Sample_Output !== undefined
                          ? String(editedQuestion.Sample_Output)
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange("Sample_Output", e.target.value)
                      }
                    />
                  ) : (
                    <div className="bg-gray-800 p-2 rounded text-gray-300">
                      {editedQuestion.Sample_Output !== undefined &&
                      String(editedQuestion.Sample_Output).trim() ? (
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
                  )}
                </div>
                <div>
                  <h3 className="text-md font-semibold">Hidden Test Cases:</h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      {(editedQuestion.Hidden_Test_Cases || []).map(
                        (tc, index) => (
                          <div
                            key={index}
                            className="border border-gray-600 p-2 rounded"
                          >
                            <div>
                              <label className="text-sm font-semibold">
                                Input:
                              </label>
                              <textarea
                                className="bg-gray-800 p-2 rounded text-gray-300 whitespace-pre-wrap w-full mt-1"
                                value={
                                  tc.Input !== undefined ? String(tc.Input) : ""
                                }
                                onChange={(e) =>
                                  handleHiddenTestCaseChange(
                                    index,
                                    "Input",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="mt-2">
                              <label className="text-sm font-semibold">
                                Output:
                              </label>
                              <textarea
                                className="bg-gray-800 p-2 rounded text-gray-300 whitespace-pre-wrap w-full mt-1"
                                value={
                                  tc.Output !== undefined
                                    ? String(tc.Output)
                                    : ""
                                }
                                onChange={(e) =>
                                  handleHiddenTestCaseChange(
                                    index,
                                    "Output",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <button
                              onClick={() => removeHiddenTestCase(index)}
                              className="text-red-400 underline mt-2"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      )}
                      <button
                        onClick={addHiddenTestCase}
                        className="text-blue-400 underline mt-2"
                      >
                        Add Hidden Test Case
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Array.isArray(editedQuestion.Hidden_Test_Cases) &&
                      editedQuestion.Hidden_Test_Cases.length > 0 ? (
                        editedQuestion.Hidden_Test_Cases.map((tc, index) => (
                          <div key={index} className="bg-gray-800 p-2 rounded">
                            <p className="text-sm font-semibold">
                              Test Case {index + 1}:
                            </p>
                            <pre className="text-gray-300 whitespace-pre-wrap break-words">
                              Input:{"\n"}
                              {tc.Input !== undefined
                                ? String(tc.Input)
                                : "(empty)"}
                            </pre>
                            <pre className="text-gray-300 whitespace-pre-wrap break-words mt-2">
                              Output:{"\n"}
                              {tc.Output !== undefined
                                ? String(tc.Output)
                                : "(empty)"}
                            </pre>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-300">
                          No hidden test cases available.
                        </p>
                      )}
                    </div>
                  )}
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
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              {loading ? "Running..." : "Run"}
            </button>
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-500"
              disabled={initialIndex === 0}
            >
              Previous Question
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500"
            >
              Next Question
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
        <div className="mb-4">
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
              rows={2}
              className="w-full mt-2 p-2 border border-gray-600 bg-[#1E1E1E] rounded text-white"
              placeholder="Enter custom input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-[#1E1E1E] p-3 rounded border border-gray-600 max-h-[200px] overflow-y-auto">
            {customInputEnabled ? (
              <>
                <p className="font-semibold mb-2 text-white">
                  Normal Test Summary: {testCaseSummary.passed} Passed /{" "}
                  {testCaseSummary.failed} Failed
                </p>
                {testCases.length === 0 ? (
                  <p className="text-sm text-gray-300">
                    No normal test results yet.
                  </p>
                ) : (
                  <TestCaseTabs testCases={testCases} />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-300">
                Normal test summary is only shown if custom input is enabled.
              </p>
            )}
          </div>
          {hiddenTestCaseResults.length > 0 && (
            <div className="bg-[#1E1E1E] p-3 rounded border border-gray-600 max-h-[200px] overflow-y-auto">
              <p className="font-semibold mb-2 text-white">
                Hidden Test Case Summary: {hiddenTestCaseSummary.passed} Passed
                / {hiddenTestCaseSummary.failed} Failed
              </p>
              <TestCaseTabs testCases={hiddenTestCaseResults} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnlineCompiler;
