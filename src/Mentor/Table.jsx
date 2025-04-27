import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./CurriculumTable.css";

export const Table = ({ subject, batch, mentorId }) => {
  const [tableData, setTableData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittedFields, setSubmittedFields] = useState({});
  const [submittingRows, setSubmittingRows] = useState({});

  useEffect(() => {
    if (subject && batch && mentorId) {
      fetchCurriculumTable();
    }
  }, [subject, batch, mentorId]);

  const fetchCurriculumTable = async () => {
    try {
      setLoading(true);
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/mentorsyllabus?mentorId=${mentorId}&subject=${subject}&batch=${batch}`;
      const response = await axios.get(url);
      setTableData(response.data);
      setEditedData(JSON.parse(JSON.stringify(response.data)));
      setSubmittedFields((prevSubmitted) => {
        const newSubmitted = { ...prevSubmitted };
        Object.keys(response.data).forEach((key) => {
          if (!newSubmitted.hasOwnProperty(key)) {
            newSubmitted[key] = { subtopics: false, videoUrl: false };
          }
        });
        return newSubmitted;
      });
    } catch (error) {
      toast.error("Error fetching curriculum table.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicChange = (rowId, tag) => {
    setEditedData((prevData) => ({
      ...prevData,
      [rowId]: {
        ...prevData[rowId],
        SubTopics: prevData[rowId].SubTopics.map((sub) =>
          sub.tag === tag && sub.status === "false"
            ? { ...sub, status: "true" }
            : sub
        ),
      },
    }));
  };

  const handleVideoUrlChange = (rowId, value) => {
    setEditedData((prevData) => ({
      ...prevData,
      [rowId]: { ...prevData[rowId], videoUrl: value },
    }));
  };

  const isValidVideoUrl = (url) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|drive\.google\.com\/file\/d\/)[\w-]+/;
    return regex.test(url.trim());
  };

  const handleRowSubmit = async (rowId) => {
    const originalRow = tableData[rowId];
    const currentRow = editedData[rowId];
    if (!originalRow || !currentRow) {
      toast.error("Row data is missing.");
      return;
    }
    const subtopicsChanged = originalRow.SubTopics.some((sub, i) => {
      return sub.status !== currentRow.SubTopics[i].status;
    });
    const videoUrlChanged = originalRow.videoUrl !== currentRow.videoUrl;

    const pendingSubtopics =
      subtopicsChanged && !submittedFields[rowId]?.subtopics;
    const pendingVideoUrl =
      videoUrlChanged && !submittedFields[rowId]?.videoUrl;

    if (
      pendingVideoUrl &&
      (!currentRow.videoUrl || !isValidVideoUrl(currentRow.videoUrl))
    ) {
      toast.error("Please enter a valid Google Drive/YouTube video URL.");
      return;
    }

    if (!pendingSubtopics && !pendingVideoUrl) {
      toast.error("No pending changes to submit.");
      return;
    }

    const payload = {
      mentorId,
      subject,
      batch,
      data: { [rowId]: currentRow },
    };

    setSubmittingRows((prev) => ({ ...prev, [rowId]: true }));

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`;
      const response = await axios.post(url, payload);
      if (response.data?.warning) {
        toast.warn(response.data.warning, {
          autoClose: false,
          closeOnClick: true,
          closeButton: true,
          style: { width: "500px", whiteSpace: "pre-wrap" },
        });
      }
      toast.success(response.data.message || "Row updated successfully.");
      setSubmittedFields((prev) => ({
        ...prev,
        [rowId]: {
          subtopics: pendingSubtopics ? true : prev[rowId]?.subtopics,
          videoUrl: pendingVideoUrl ? true : prev[rowId]?.videoUrl,
        },
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Error submitting row. Please try again."
      );
    } finally {
      await fetchCurriculumTable();
      setSubmittingRows((prev) => ({ ...prev, [rowId]: false }));
    }
  };

  return (
    <div className="bg-white w-full max-w-full h-auto p-2 flex flex-col justify-center">
      {loading && <p className="mt-4 text-center">Loading...</p>}

      {Object.keys(editedData).length > 0 ? (
        <div className="max-h-[550px] overflow-y-auto rounded-md border shadow-sm scrollbar-thin scrollbar-thumb-[#0C1BAA] scrollbar-track-[#F5F5F5]">
          <table className="min-w-full text-sm md:text-base ">
            <thead className="sticky top-0 bg-[#0C1BAA] text-white text-left font-medium">
              <tr>
                <th className="px-4 py-3 max-w-[100px] text-center">
                  Day Order
                </th>
                <th className="px-4 py-3 max-w-[200px]  text-center">Topic</th>
                <th className="px-4 py-3  text-center">Topics to Cover</th>
                <th className="px-4 py-3 max-w-[350px]  text-center">
                  Video URL
                </th>
                <th className="px-4 py-3 max-w-[120px]  text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(editedData).map(([id, item], index) => {
                const originalRow = tableData[id];
                let subtopicsChanged = false;
                let videoUrlChanged = false;
                if (originalRow) {
                  subtopicsChanged = originalRow.SubTopics.some((sub, i) => {
                    return sub.status !== item.SubTopics[i].status;
                  });
                  videoUrlChanged = originalRow.videoUrl !== item.videoUrl;
                }
                const pendingSubtopics =
                  subtopicsChanged && !submittedFields[id]?.subtopics;
                const pendingVideoUrl =
                  videoUrlChanged && !submittedFields[id]?.videoUrl;
                const isPending = pendingSubtopics || pendingVideoUrl;
                const rowSubmitting = submittingRows[id];
                const rowComplete =
                  tableData[id]?.videoUrl &&
                  tableData[id].videoUrl === item.videoUrl &&
                  item.SubTopics.every((sub) => sub.status === "true");

                return (
                  <tr
                    key={id}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-3">Class {index + 1}</td>
                    <td className="px-4 py-3">{item.Topics}</td>
                    <td className="px-4 py-3 align-top">
                      <ul className="list-none space-y-1">
                        {item.SubTopics.sort((a, b) => {
                          const parseTag = (tag) => {
                            const match = tag.match(/Day-(\d+):(\d+)/);
                            if (match) {
                              return {
                                day: parseInt(match[1], 10),
                                id: parseInt(match[2], 10),
                              };
                            }
                            return { day: 0, id: 0 };
                          };
                          const aInfo = parseTag(a.tag || "");
                          const bInfo = parseTag(b.tag || "");
                          if (aInfo.day !== bInfo.day) {
                            return aInfo.day - bInfo.day;
                          }
                          return aInfo.id - bInfo.id;
                        }).map((sub, subIndex) => (
                          <li
                            key={subIndex}
                            className={
                              "Day-" + (index + 1) !==
                              (sub.tag.match(/(Day-\d+)/)?.[0] || "")
                                ? "text-red-500"
                                : ""
                            }
                          >
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={sub.status === "true"}
                                disabled={
                                  sub.status === "true" ||
                                  submittedFields[id]?.subtopics
                                }
                                onChange={() =>
                                  handleSubtopicChange(id, sub.tag)
                                }
                              />
                              {sub.title}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {rowComplete ? (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {item.videoUrl}
                        </a>
                      ) : (
                        <input
                          type="text"
                          placeholder="Enter Video URL..."
                          value={item.videoUrl || ""}
                          onChange={(e) =>
                            handleVideoUrlChange(id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        disabled={loading || !isPending || rowSubmitting}
                        onClick={() => handleRowSubmit(id)}
                        className={`w-[100px] h-[36px] text-white text-sm md:text-base font-semibold rounded-md transition ${
                          !loading && isPending && !rowSubmitting
                            ? "bg-[#0C1BAA] hover:bg-blue-900"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {rowSubmitting ? "Submitting" : "Submit"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-center text-gray-500">
          No curriculum data available.
        </p>
      )}
    </div>
  );
};
