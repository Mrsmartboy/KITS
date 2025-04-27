import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { decryptData } from "../../cryptoUtils";

const MCQForm = () => {
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
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: subjectParam,
      tag: tagsParam,
    },
  });

  const [preview, setPreview] = useState(null);

  // Prefill subject and tag from URL params
  useEffect(() => {
    setValue("subject", subjectParam);
    setValue("tag", tagsParam);
  }, [subjectParam, tagsParam, setValue]);

  // Handle global paste event
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
          if (lines.length < 8) {
            
            return;
          }
          parsedData = {
            question: lines[0],
            optionA: lines[1],
            optionB: lines[2],
            optionC: lines[3],
            optionD: lines[4],
            correctOption: `option${lines[5].toUpperCase()}`,
            difficulty: lines[6],
            score: parseInt(lines[7], 10),
            explanation: lines[8] || "",
            explanationURL: lines[9] || "",
          };
        }

        // Validate parsed data
        if (
          !parsedData.question ||
          !parsedData.optionA ||
          !parsedData.optionB ||
          !parsedData.optionC ||
          !parsedData.optionD ||
          !parsedData.correctOption
        ) {
          return;
        }

        // Validate correctOption
        if (
          !["optionA", "optionB", "optionC", "optionD"].includes(
            parsedData.correctOption
          )
        ) {
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
        setValue("optionA", parsedData.optionA);
        setValue("optionB", parsedData.optionB);
        setValue("optionC", parsedData.optionC);
        setValue("optionD", parsedData.optionD);
        setValue("correctOption", parsedData.correctOption);
        setValue("difficulty", parsedData.difficulty);
        setValue("score", parsedData.score);
        setValue("explanation", parsedData.explanation || "");
        setValue("explanationURL", parsedData.explanationURL || "");

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
  }, [setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        !["image/png", "image/jpeg", "image/jpg", "image/gif"].includes(file.type)
      ) {
        toast.error("Invalid file type. Only PNG, JPG, or GIF allowed.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Max size is 10MB.");
        return;
      }
      setValue("coverImage", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let coverImageUrl = "";
      if (data.coverImage && data.coverImage.length !== 0) {
        const formData = new FormData();
        formData.append("file", data.coverImage);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
        const uploadRes = await axios.post(url, formData);
        coverImageUrl = uploadRes.data.secure_url;
      }

      const payload = [
        {
          internId: testerId,
          Question_Type: "mcq_test",
          Subject: data.subject,
          Question: data.question,
          A: data.optionA,
          B: data.optionB,
          C: data.optionC,
          D: data.optionD,
          Correct_Option: data.correctOption.replace("option", "").toUpperCase(),
          Score: data.score,
          Difficulty: data.difficulty,
          Tags: data.tag.toLowerCase(),
          Text_Explanation: data.explanation,
          Explanation_URL: data.explanationURL,
          Image_URL: coverImageUrl,
        },
      ];

      console.log("Submitting to /upload-test-questions:", payload);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-upload-questions`,
        payload
      );
      toast.success(response.data.message);
      toast.info(
        `Total Questions Created on ${tagsParam}:${response.data.mcqCreatedForTag}`,
        { autoClose: 8000 }
      );

      reset();
      setPreview(null);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(
        err?.message ||
          err?.response?.data?.error?.message ||
          "Failed to submit MCQ. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-16 font-[inter]"
    >
      <h3 className="text-2xl font-semibold text-center">MCQ Form</h3>

      {/* Subject (read-only) */}
      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input
          {...register("subject")}
          value={subjectParam}
          readOnly
          className={`${inputStyle} bg-gray-100`}
        />
      </div>

      {/* Tag (read-only) */}
      <div>
        <label className="block text-sm font-medium mb-1">Tag</label>
        <input
          {...register("tag")}
          value={tagsParam}
          readOnly
          className={`${inputStyle} bg-gray-100`}
        />
      </div>

      {/* Question */}
      <div>
        <label className="block text-sm font-medium mb-1">Your Question</label>
        <textarea
          {...register("question", { required: "Question is required" })}
          placeholder="Type the question..."
          className={textareaStyle}
        />
        {errors.question && (
          <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
        )}
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium mb-1">Options</label>
        <div className="space-y-2">
          {["A", "B", "C", "D"].map((i) => (
            <input
              key={i}
              {...register(`option${i}`, {
                required: `Option ${i} is required`,
              })}
              placeholder={`Option ${i}`}
              className={inputStyle}
            />
          ))}
          {errors.optionA && (
            <p className="text-red-500 text-sm mt-1">{errors.optionA.message}</p>
          )}
          {errors.optionB && (
            <p className="text-red-500 text-sm mt-1">{errors.optionB.message}</p>
          )}
          {errors.optionC && (
            <p className="text-red-500 text-sm mt-1">{errors.optionC.message}</p>
          )}
          {errors.optionD && (
            <p className="text-red-500 text-sm mt-1">{errors.optionD.message}</p>
          )}
        </div>
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium mb-1">Correct Option</label>
        <select
          {...register("correctOption", {
            required: "Please select the correct option",
          })}
          className={inputStyle}
        >
          <option value="">Select correct option</option>
          {["A", "B", "C", "D"].map((i) => (
            <option key={i} value={`option${i}`}>
              {`Option ${i}`}
            </option>
          ))}
        </select>
        {errors.correctOption && (
          <p className="text-red-500 text-sm mt-1">
            {errors.correctOption.message}
          </p>
        )}
      </div>

      {/* Difficulty & Score */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            {...register("difficulty", {
              required: "Difficulty is required",
            })}
            className={inputStyle}
          >
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          {errors.difficulty && (
            <p className="text-red-500 text-sm mt-1">
              {errors.difficulty.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Score</label>
          <input
            type="number"
            min={1}
            {...register("score", {
              valueAsNumber: true,
              required: "Score is required",
              min: { value: 1, message: "Score must be at least 1" },
            })}
            placeholder="Points"
            className={inputStyle}
            onBlur={(e) => {
              const val = e.target.valueAsNumber ?? Number(e.target.value);
              if (val < 1 || isNaN(val)) {
                setValue("score", 1);
              }
            }}
          />
          {errors.score && (
            <p className="text-red-500 text-sm mt-1">{errors.score.message}</p>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium mb-1">Explanation</label>
        <textarea
          {...register("explanation")}
          placeholder="Add explanation for this question..."
          className={`${inputStyle} h-24`}
        />
      </div>

      {/* Explanation URL */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Explanation URL
        </label>
        <input
          {...register("explanationURL")}
          placeholder="Enter URL for detailed explanation"
          className={inputStyle}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <label
          htmlFor="coverImage"
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg border-gray-300 p-6 cursor-pointer hover:bg-gray-50 transition"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 object-contain"
            />
          ) : (
            <>
              <svg
                className="w-12 h-12 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m10 12V4m-4 12V4m-4 4h8M4 20h16"
                />
              </svg>
              <p className="text-sm text-gray-500">
                <span className="text-blue-600 font-semibold">
                  Upload a file
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </>
          )}
          <input
            id="coverImage"
            type="file"
            accept="image/*"
            {...register("coverImage")}
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Submit Button with Loader */}
      <button
        disabled={isSubmitting}
        type="submit"
        className={`w-full flex items-center justify-center py-2 rounded-md text-white transition ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Submitting...</span>
          </div>
        ) : (
          "Submit MCQ"
        )}
      </button>
    </form>
  );
};

export default MCQForm;