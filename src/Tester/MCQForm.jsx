import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { decryptData } from "../../cryptoUtils";

const MCQForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subjectParam = searchParams.get("subject") || "dataanalytics";
  const tagsParam = searchParams.get("tags")?.toLowerCase() || "day-1:1";
  const testerId = decryptData(sessionStorage.getItem("Testers"));
  const questionType = "mcq_test";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [tagCountPerDay, setTagCountPerDay] = useState({});
  const [tagToTopicMap, setTagToTopicMap] = useState({});
  const [nextTag, setNextTag] = useState(null);
  const [prevTag, setPrevTag] = useState(null);

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
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "",
      difficulty: "",
      score: 1,
      explanation: "",
      explanationURL: "",
      coverImage: null,
    },
  });

  // Prefill subject and tag from URL params
  useEffect(() => {
    setValue("subject", subjectParam);
    setValue("tag", tagsParam);
  }, [subjectParam, tagsParam, setValue]);

  // Fetch syllabus data
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        console.log("Fetching syllabus for testerId:", testerId, "subject:", subjectParam);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester-curriculum?id=${testerId}`
        );
        const data = response.data;
        console.log("Syllabus data received:", data);

        if (!data?.curriculumTable) {
          throw new Error("Curriculum table not found in response");
        }

        const dayIdToDayNumber = {};
        const subjectDays = Object.keys(data.curriculumTable[subjectParam] || {});
        subjectDays.forEach((dayId, index) => {
          dayIdToDayNumber[dayId] = index + 1;
        });

        const curriculumData = Object.entries(data.curriculumTable).flatMap(([subject, days]) =>
          Object.entries(days).map(([dayId, dayData]) => {
            const dayNumber = dayIdToDayNumber[dayId] || parseInt(dayId);
            return {
              subject,
              DayOrder: `Day-${dayNumber}`,
              Topics: dayData.Topics || "Unknown Topic",
              SubTopics: dayData.SubTopics.map((sub) => sub.title || "N/A"),
              originalSubTopics: dayData.SubTopics,
            };
          })
        );

        curriculumData.sort((a, b) => {
          const dayA = parseInt(a.DayOrder.split("-")[1] || 0);
          const dayB = parseInt(b.DayOrder.split("-")[1] || 0);
          return dayA - dayB;
        });

        const filteredCurriculum = curriculumData.filter((item) => item.subject === subjectParam);

        const groupedByDay = filteredCurriculum.reduce((acc, item) => {
          if (!acc[item.DayOrder]) acc[item.DayOrder] = [];
          acc[item.DayOrder].push(item);
          return acc;
        }, {});

        const tagCountPerDay = {};
        const tagToTopicMap = {};
        Object.entries(groupedByDay).forEach(([dayOrder, items]) => {
          let totalTags = 0;
          const dayNumber = parseInt(dayOrder.split("-")[1] || 0);
          items.forEach((item) => {
            if (!Array.isArray(item.originalSubTopics) || item.originalSubTopics.length === 0) {
              console.warn(`No valid SubTopics for ${item.subject} on ${dayOrder}`);
              return;
            }
            item.originalSubTopics.forEach((sub) => {
              if (!sub.tag || !sub.title) {
                console.warn(`Invalid subtopic at ${item.subject} ${dayOrder}:`, sub);
              }
              const normalizedTag = sub.tag.toLowerCase();
              tagToTopicMap[normalizedTag] = item.Topics || "Unknown Topic";
              totalTags++;
            });
            tagCountPerDay[`day-${dayNumber}`] = totalTags;
          });
        });

        console.log("Tag Count Per Day:", tagCountPerDay);
        console.log("Tag to Topic Map:", tagToTopicMap);

        setTagCountPerDay(tagCountPerDay);
        setTagToTopicMap(tagToTopicMap);

        const { nextTag, prevTag } = getNextAndPreviousTags(tagsParam, groupedByDay, tagCountPerDay);
        console.log("Current Tag:", tagsParam, "Next Tag:", nextTag, "Prev Tag:", prevTag);
        setNextTag(nextTag);
        setPrevTag(prevTag);
      } catch (error) {
        console.error("Error fetching syllabus data:", error);
        toast.error("Failed to fetch syllabus data.");
      }
    };

    fetchSyllabus();
  }, [subjectParam, tagsParam, testerId]);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT"
      ) {
        return;
      }

      if (e.key === "ArrowRight" && nextTag) {
        console.log("Right arrow pressed, navigating to:", nextTag);
        handleTagNavigation(nextTag);
      } else if (e.key === "ArrowLeft" && prevTag) {
        console.log("Left arrow pressed, navigating to:", prevTag);
        handleTagNavigation(prevTag);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextTag, prevTag]);

  // Helper function to get day number
  const getDayNumber = (dayOrderStr) => {
    const parts = dayOrderStr.split("-");
    return parts.length > 1 ? parseInt(parts[1]) : parseInt(dayOrderStr);
  };

  // Helper function to get next and previous tags
  const getNextAndPreviousTags = useCallback(
    (currentTag, groupedByDay, tagCountPerDay) => {
      if (!currentTag || !currentTag.includes("day-")) {
        console.warn("Invalid current tag format:", currentTag);
        return { nextTag: null, prevTag: null };
      }

      const normalizedTag = currentTag.toLowerCase();
      const match = normalizedTag.match(/day-(\d+):(\d+)/i);
      if (!match) {
        console.warn("Tag does not match expected format:", currentTag);
        return { nextTag: null, prevTag: null };
      }

      const currentDayNumber = parseInt(match[1]);
      const currentTagIndex = parseInt(match[2]);

      const dayNumbers = Object.keys(groupedByDay)
        .map((dayOrder) => getDayNumber(dayOrder))
        .sort((a, b) => a - b);

      if (!dayNumbers.length) {
        console.warn("No day numbers found in groupedByDay:", groupedByDay);
        return { nextTag: null, prevTag: null };
      }

      const currentDayKey = `day-${currentDayNumber}`;
      const totalTagsInCurrentDay = tagCountPerDay[currentDayKey] || 0;
      const currentDayIndex = dayNumbers.indexOf(currentDayNumber);

      let nextTag = null;
      let prevTag = null;

      if (currentTagIndex < totalTagsInCurrentDay) {
        nextTag = `Day-${currentDayNumber}:${currentTagIndex + 1}`;
      } else if (currentDayIndex < dayNumbers.length - 1) {
        const nextDayNumber = dayNumbers[currentDayIndex + 1];
        nextTag = `Day-${nextDayNumber}:1`;
      }

      if (currentTagIndex > 1) {
        prevTag = `Day-${currentDayNumber}:${currentTagIndex - 1}`;
      } else if (currentDayIndex > 0) {
        const prevDayNumber = dayNumbers[currentDayIndex - 1];
        const prevDayKey = `day-${prevDayNumber}`;
        const totalTagsInPrevDay = tagCountPerDay[prevDayKey] || 0;
        if (totalTagsInPrevDay > 0) {
          prevTag = `Day-${prevDayNumber}:${totalTagsInPrevDay}`;
        }
      }

      return { nextTag, prevTag };
    },
    []
  );

  // Handle tag navigation
  const handleTagNavigation = (tag) => {
    if (tag) {
      console.log("Navigating to tag:", tag);
      navigate(`/upload/mcq?subject=${encodeURIComponent(subjectParam)}&tags=${encodeURIComponent(tag)}`);
    } else {
      console.warn("No tag provided for navigation");
      toast.error("Unable to navigate: Invalid tag.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warn("File too large. Max size is 10MB.");
        return;
      }
      setValue("coverImage", file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        setPreview("PDF");
      }
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const payload = {
        internId: testerId,
        Question_Type: "mcq_test",
        Subject: data.subject.toLowerCase(),
        Question: data.question,
        A: data.optionA,
        B: data.optionB,
        C: data.optionC,
        D: data.optionD,
        Correct_Option: data.correctOption.toUpperCase(),
        Score: data.score,
        Difficulty: data.difficulty,
        Tags: data.tag.toLowerCase(),
        Text_Explanation: data.explanation,
        Explanation_URL: data.explanationURL,
      };

      formData.append("data", JSON.stringify([payload]));
      if (data.coverImage) {
        formData.append("coverImage", data.coverImage);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-upload-questions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message, { autoClose: 2000 });
      toast.info(`MCQs Created for ${data.tag}: ${response.data.mcqCreatedForTag}`, { autoClose: 2000 });
      toast.info(
        `Total Questions Today: ${response.data.internCreatedOnDate} (MCQ: ${response.data.mcqCreatedOnDate})`,
        { autoClose: 2000 }
      );

      reset();
      setPreview(null);
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err.response?.data?.error?.message || err.message || "Failed to submit MCQ. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gray-100 flex items-center justify-center p-4 sm:p-8 md:p-12 min-h-screen font-inter">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-5xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-[#00007F] font-poppins mb-6">
          MCQ QUESTION FORM
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                SUBJECT <span className="text-red-500">*</span>
              </label>
              <input
                {...register("subject", { required: "Subject is required" })}
                value={subjectParam}
                readOnly
                className="mt-1 w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-100"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
              )}
            </div>

            {/* Tag */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                TAG <span className="text-red-500">*</span>
              </label>
              <input
                {...register("tag", { required: "Tag is required" })}
                value={tagsParam}
                readOnly
                className="mt-1 w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-100"
              />
              {errors.tag && (
                <p className="text-red-500 text-sm mt-1">{errors.tag.message}</p>
              )}
            </div>

            {/* Score */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                SCORE <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                {...register("score", {
                  valueAsNumber: true,
                  required: "Score is required",
                  min: { value: 1, message: "Score must be at least 1" },
                })}
                placeholder="Ex: 1 Points"
                className="mt-1 w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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

            {/* Difficulty */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                DIFFICULTY <span className="text-red-500">*</span>
              </label>
              <select
                {...register("difficulty", { required: "Difficulty is required" })}
                className="mt-1 w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {errors.difficulty && (
                <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Question */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                QUESTION <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("question", { required: "Question is required" })}
                placeholder="Ex: Type the question..."
                className="mt-1 w-full p-3 border border-[#00007F] rounded-md h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              {errors.question && (
                <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
              )}
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                OPTIONS <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {["A", "B", "C", "D"].map((i) => (
                  <div key={i}>
                    <input
                      {...register(`option${i}`, { required: `Option ${i} is required` })}
                      placeholder={`Option ${i}`}
                      className="w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                    {errors[`option${i}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`option${i}`].message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Correct Option */}
              <div>
                <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                  CORRECT OPTION <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("correctOption", { required: "Please select the correct option" })}
                  className="mt-1 w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select correct option</option>
                  {["A", "B", "C", "D"].map((i) => (
                    <option key={i} value={i}>{`Option ${i}`}</option>
                  ))}
                </select>
                {errors.correctOption && (
                  <p className="text-red-500 text-sm mt-1">{errors.correctOption.message}</p>
                )}
              </div>

              {/* Explanation URL */}
              <div>
                <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                  EXPLANATION URL <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("explanationURL")}
                  placeholder="Ex: https://..."
                  className="mt-1 w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                EXPLANATION <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("explanation")}
                placeholder="Ex: Add an Explanation..."
                className="mt-1 w-full p-3 border border-[#00007F] rounded-md h-36 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Upload Image or PDF */}
          <div>
            <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
              UPLOAD PHOTO <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                id="coverImage"
                type="file"
                accept="image/*,application/pdf"
                {...register("coverImage")}
                onChange={handleFileChange}
                className="mt-1 w-full p-3 border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <button
                type="button"
                disabled={isSubmitting}
                className="w-full sm:w-auto mt-1 p-3 bg-[#00007F] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                Upload
              </button>
            </div>
            {preview && (
              <div className="mt-2">
                {preview === "PDF" ? (
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500">PDF Selected</p>
                  </div>
                ) : (
                  <img src={preview} alt="Preview" className="max-h-48 object-contain" />
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center w-full">
            <button
              disabled={isSubmitting}
              type="submit"
              className={`w-full p-3 bg-[#00007F] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-800"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
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
                "SUBMIT MCQ QUESTION >"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MCQForm;