import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { decryptData } from "../../cryptoUtils";

const CodingForm = () => {
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get("subject") || "";
  const tagsParam = searchParams.get("tags") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const testerId = decryptData(sessionStorage.getItem("Testers"));
  const textareaStyle =
    "w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] overflow-auto";
  const inputStyle =
    "w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: subjectParam,
      tag: tagsParam,
      question: "",
      sampleInput: "",
      sampleOutput: "",
      hiddenCases: [],
      constraints: "",
      score: "",
      difficulty: "",
      explanation: "",
      explanationURL: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "hiddenCases",
  });

  // Prefill subject/tag once on mount
  useEffect(() => {
    setValue("subject", subjectParam);
    setValue("tag", tagsParam);
  }, [subjectParam, tagsParam, setValue]);

  // Handle global paste event for auto-fill
  useEffect(() => {
    const handlePaste = (e) => {
      // Skip if pasting into an input or textarea
      const activeElement = document.activeElement;
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      try {
        const pastedData = e.clipboardData.getData("text");
        let parsedData;

        // Try parsing as JSON
        try {
          parsedData = JSON.parse(pastedData);
        } catch {
          // Fallback to plain text parsing (newline-separated)
          const lines = pastedData.trim().split("\n").map((line) => line.trim());
          if (lines.length < 15) {
            return;
          }
          const hiddenCases = [];
          // Parse hidden test cases (at least 4, starting from line 7)
          for (let i = 7; i < lines.length - 1; i += 2) {
            if (lines[i] && lines[i + 1]) {
              hiddenCases.push({
                Input: lines[i],
                Output: lines[i + 1],
              });
            }
          }
          if (hiddenCases.length < 4) {
            return;
          }
          parsedData = {
            question: lines[0],
            sampleInput: lines[1],
            sampleOutput: lines[2],
            constraints: lines[3] || "",
            score: parseInt(lines[4], 5) || 1,
            difficulty: lines[5] || "Easy",
            hiddenCases,
          };
        }

        // Validate required fields
        if (
          !parsedData.question ||
          !parsedData.sampleInput ||
          !parsedData.sampleOutput
        ) {
          return;
        }

        // Validate at least 4 hidden test cases
        const hiddenCases = parsedData.hiddenCases || [];
        const validHiddenCases = hiddenCases.filter(
          (tc) => tc.Input && tc.Output
        );
        if (validHiddenCases.length < 4) {
          return;
        }

        // Validate difficulty
        if (!["Easy", "Medium", "Hard"].includes(parsedData.difficulty)) {
          parsedData.difficulty = "Easy"; // Default to Easy
        }

        // Validate score
        if (isNaN(parsedData.score) || parsedData.score < 1) {
          parsedData.score = 1; // Default to 1
        }

        // Populate form fields
        setValue("question", parsedData.question);
        setValue("sampleInput", parsedData.sampleInput);
        setValue("sampleOutput", parsedData.sampleOutput);
        setValue("constraints", parsedData.constraints || "");
        setValue("score", parsedData.score);
        setValue("difficulty", parsedData.difficulty);
       

        // Clear existing hidden cases and append all valid ones
        remove();
        validHiddenCases.forEach((tc) => {
          append({ Input: tc.Input, Output: tc.Output });
        });
      } catch (err) {
        console.error("Paste error:", err);
      }
    };

    // Add paste event listener
    document.addEventListener("paste", handlePaste);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [setValue, append, remove]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Build base object
      const questionObj = {
        internId: testerId,
        Question_Type: "code_test",
        Subject: data.subject.toLowerCase(),
        Question: data.question,
        Sample_Input: data.sampleInput,
        Sample_Output: data.sampleOutput,
        Constraints: data.constraints || "",
        Score: data.score || "",
        Tags: data.tag.toLowerCase(),
        Difficulty: data.difficulty || "",
        Text_Explanation: data.explanation || "",
        Explanation_URL: data.explanationURL || "",
      };

      // Inject dynamic hidden test cases as backend expects
      data.hiddenCases.forEach((tc, idx) => {
        const i = idx + 1;
        questionObj[`Hidden_Test_case_${i}_Input`] = tc.Input;
        questionObj[`Hidden_Test_case_${i}_Output`] = tc.Output;
      });

      // Wrap in array for your endpoint
      const payload = [questionObj];

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-upload-questions`,
        payload
      );

      toast.success(response.data.message);
      toast.info(
        `Total Questions Created on ${tagsParam}:${response.data.codeCreatedForTag}`,
        {
          autoClose: 8000,
        }
      );

      reset(); // Resets everything back to defaultValues
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to submit. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md mt-16"
    >
      <h3 className="text-2xl font-semibold text-center">Code Question Form</h3>

      {/* Subject & Tag (read-only) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            {...register("subject")}
            readOnly
            className={`${inputStyle} bg-gray-100`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tag</label>
          <input
            {...register("tag")}
            readOnly
            className={`${inputStyle} bg-gray-100`}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <label className="block text-sm font-medium mb-1">Question</label>
        <textarea
          {...register("question", { required: true })}
          placeholder="Type the coding question..."
          className={textareaStyle}
          rows={3}
        />
        {errors.question && (
          <p className="text-red-500 text-sm">Question is required</p>
        )}
      </div>

      {/* Sample Input / Output */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sample Input</label>
          <textarea
            {...register("sampleInput", { required: true })}
            placeholder="e.g., 5"
            className={textareaStyle}
            rows={2}
          />
          {errors.sampleInput && (
            <p className="text-red-500 text-sm">Sample input is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Sample Output
          </label>
          <textarea
            {...register("sampleOutput", { required: true })}
            placeholder="e.g., 25"
            className={textareaStyle}
            rows={2}
          />
          {errors.sampleOutput && (
            <p className="text-red-500 text-sm">Sample output is required</p>
          )}
        </div>
      </div>

      {/* Hidden Test Cases */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Hidden Test Cases
        </label>
        {fields.map((field, idx) => (
          <div key={field.id} className="flex items-start space-x-2 mb-2">
            <textarea
              {...register(`hiddenCases.${idx}.Input`, {
                required: "Input required",
              })}
              placeholder="Input"
              className={`${textareaStyle} flex-1`}
              rows={2}
            />
            <textarea
              {...register(`hiddenCases.${idx}.Output`, {
                required: "Output required",
              })}
              placeholder="Output"
              className={`${textareaStyle} flex-1`}
              rows={2}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-red-500 hover:underline self-center"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ Input: "", Output: "" })}
          className="text-blue-600 hover:underline"
        >
          + Add Hidden Test Case
        </button>
      </div>

      {/* Optional extras */}
      <div>
        <label className="block text-sm font-medium mb-1">Constraints</label>
        <textarea
          {...register("constraints")}
          placeholder="e.g., 0 ≤ num ≤ 100"
          rows={2}
          className={textareaStyle}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Score */}
        <div>
          <label className="block text-sm font-medium mb-1">Score</label>
          <input
            type="number"
            min={1}
            {...register("score", { valueAsNumber: true })}
            placeholder="Points"
            className={inputStyle}
            onBlur={(e) => {
              const val = e.target.valueAsNumber ?? Number(e.target.value);
              if (val < 1) {
                setValue("score", 1);
              }
            }}
          />
          {errors.score && (
            <p className="text-red-500 text-sm">{errors.score.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select {...register("difficulty")} className={inputStyle}>
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Explanation</label>
        <textarea
          {...register("explanation")}
          placeholder="Add an explanation..."
          className={`${inputStyle} h-24`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Explanation URL
        </label>
        <textarea
          {...register("explanationURL")}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-x"
          rows={1}
        />
      </div>

      {/* Submit */}
      <button
        disabled={isSubmitting}
        type="submit"
        className={`w-full py-2 rounded-md text-white transition ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Code Question"}
      </button>
    </form>
  );
};

export default CodingForm;