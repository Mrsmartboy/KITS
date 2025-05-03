import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useUniqueBatches } from '../contexts/UniqueBatchesContext.jsx';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const picUrl = (raw) =>
  raw?.startsWith("http")
    ? raw
    : `${BASE_URL}/api/v1/pic?student_id=${raw}`;

const ManageLeaderBoard = () => {
  const [activeTab, setActiveTab] = useState("Class");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [topThree, setTopThree] = useState([]);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { batches, loading: batchesLoading, fetchBatches } = useUniqueBatches();

  // Fetch batches when component mounts
  useEffect(() => {
    const location = "KITS";
    fetchBatches(location);
  }, [fetchBatches]);

  const fetchData = useCallback(
    async (tab, batch) => {
      setLoading(true);
      try {
        const isClass = tab === "Class";
        const params = {
          mode: isClass ? "class" : "overall",
          location: "KITS",
          limit: 50,
          ...(isClass && batch && { batchNo: batch }),
        };

        const { data } = await axios.get(`${BASE_URL}/api/v1/leaderboard`, {
          params,
        });

        if (data.success) {
          setTopThree(data.topThree || []);
          setOthers(data.others || []);
        } else {
          toast.error(data.message || "Unknown error");
        }
      } catch (err) {
        toast.error("Could not load leaderboard");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch data when activeTab, selectedBatch, or batches change
  useEffect(() => {
    if (activeTab === "Overall") {
      fetchData("Overall");
    } else if (activeTab === "Class" && !batchesLoading) {
      if (batches.length === 0) {
        setSelectedBatch("");
      } else if (selectedBatch) {
        fetchData("Class", selectedBatch);
      }
    }
  }, [activeTab, selectedBatch, batches, batchesLoading, fetchData]);

  // Set default batch when batches are loaded
  useEffect(() => {
    if (activeTab === "Class" && batches.length > 0 && !batchesLoading && !selectedBatch) {
      setSelectedBatch(batches[0]?.Batch || "");
    } else if (activeTab === "Overall") {
      setSelectedBatch("");
    }
  }, [activeTab, batches, batchesLoading, selectedBatch]);

  const positionCardBg = (pos) =>
    pos !== 1 ? "bg-white text-[#181D27]" : "bg-[#2333CB] text-white";
  const positionCrown = (pos) => `/kits/card${pos}.png`;
  const orderClass = (pos) => {
    switch (pos) {
      case 2:
        return "lg:order-1";
      case 1:
        return "lg:order-2";
      case 3:
        return "lg:order-3";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen font-[Inter] text-white mt-16">
      {/* Tabs */}
      <div
        className="w-full sm:w-[90%] md:w-[400px] lg:w-[450px] h-10 sm:h-auto md:h-12 bg-[#2333CB] rounded-full sm:rounded-lg md:rounded-full p-1 sm:p-2 md:p-1 flex sm:flex-col md:flex-row items-center justify-between sm:gap-2 mx-auto mb-6"
        role="tablist"
      >
        {["Class", "Overall"].map((tab) => (
          <div
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => !loading && setActiveTab(tab)}
            className={`flex-1 sm:flex-none md:flex-1 flex items-center justify-center h-full sm:w-full md:h-full rounded-full sm:rounded-md md:rounded-full cursor-pointer transition-all duration-300 text-xs sm:text-sm md:text-base ${
              activeTab === tab ? "bg-white text-[#010181]" : "text-white"
            } sm:py-2`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Batch Filter (Visible only for Class tab) */}
      {activeTab === "Class" && (
        <div className="w-full sm:w-[90%] md:w-[400px] lg:w-[450px] mb-6">
          <div className="relative w-full h-12 rounded-full bg-[#2333CB] p-1">
            <select
              value={selectedBatch}
              onChange={(e) => {
                console.log("Batch selected:", e.target.value);
                setSelectedBatch(e.target.value);
              }}
              disabled={batchesLoading || loading}
              className="w-full h-full px-4 py-2 bg-white text-[#010181] text-sm md:text-base font-medium rounded-full outline-none appearance-none cursor-pointer"
            >
              {batchesLoading ? (
                <option>Loading batches...</option>
              ) : batches.length === 0 ? (
                <option>No batches available</option>
              ) : (
                <>
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.Batch} value={batch.Batch}>
                      {batch.Batch}
                    </option>
                  ))}
                </>
              )}
            </select>
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#010181] pointer-events-none"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      )}

      {/* Top-3 Cards */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 w-full justify-center items-center px-2 sm:mt-24 sm:mb-0 mx-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col items-center bg-[#2333CB]/60 rounded-lg p-5 w-full max-w-[250px] lg:w-[190px] h-60 sm:h-[260px]"
            />
          ))
        ) : topThree.length ? (
          topThree.map((p) => (
            <div
              key={p.position}
              className={`flex flex-col items-center rounded-lg p-3 sm:p-5 w-full max-w-[250px] lg:w-[250px] h-full sm:h-[300px] shadow-md gap-2 sm:gap-4 ${positionCardBg(
                p.position
              )} ${p.position === 1 ? "lg:-translate-y-16" : ""} ${
                orderClass(p.position)
              }`}
            >
              <div className="flex flex-col items-center mt-[-6px]">
                <img
                  src={positionCrown(p.position)}
                  alt="Crown"
                  className="w-14 sm:w-16 h-14 sm:h-11 object-contain"
                />
                <div
                  className={`w-20 sm:w-24 h-20 sm:h-24 rounded-full border-4 sm:border-[6px] shadow-md overflow-hidden ${
                    p.position === 1 ? "border-[1px]" : "border-[#2333CB]"
                  }`}
                >
                  <img
                    src={picUrl(p.img)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <h2 className="text-sm sm:text-xl font-semibold leading-5 sm:leading-6 text-center text-ellipsis overflow-hidden max-w-[100%] break-words line-clamp-2">
                  {p.name}
                </h2>
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    p.position !== 1 ? "text-[#535862]" : "text-[#F5F5F5]"
                  }`}
                >
                  {activeTab === "Class" ? `Class ${p.batchNo}` : p.batchNo}
                </p>
              </div>

              <div
                className={`flex items-center gap-1 sm:gap-2 mt-auto ${
                  p.position !== 1
                    ? "bg-[#2333CB] rounded-full text-white px-2 p-1"
                    : "text-[#2333CB] bg-white rounded-full px-2 p-1"
                }`}
              >
                <img
                  src="/kits/worldcup.png"
                  alt="Trophy"
                  className="w-5 sm:w-6 h-5 sm:h-6 object-contain"
                />
                <p className="text-sm sm:text-xl font-semibold">
                  Score: {p.score}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-lg font-semibold text-[#2333CB]">
            {activeTab === "Class" && !selectedBatch
              ? "Please select a batch"
              : "No data available"}
          </div>
        )}
      </div>

      {/* Leaderboard Rows */}
      <div className="flex flex-col w-full max-w-[100%] sm:max-w-[1470px] mb-6 sm:mb-0 mt-12 p-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center justify-between bg-[#2333CB]/60 rounded-[25px] px-6 py-3 mb-2 h-20"
            />
          ))
        ) : others.length > 0 ? (
          others.map((p) => (
            <div
              key={p.position}
              className="flex items-center justify-between bg-[#2333CB] rounded-[25px] px-4 sm:px-6 py-3 mb-2"
            >
              <div className="flex items-center gap-3 sm:gap-5">
                <span className="text-lg sm:text-2xl font-bold">{p.position}.</span>
                <img
                  src="/kits/generalcard.png"
                  alt="Icon"
                  className="w-8 sm:w-10 h-5 sm:h-6 object-contain"
                />
                <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full border-[3px] border-white/60 shadow-md overflow-hidden">
                  <img
                    src={picUrl(p.img)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm sm:text-md font-semibold leading-tight whitespace-nowrap">
                  {p.name}
                </span>
              </div>
              <div className="flex items-center gap-4 sm:gap-8">
                <p className="text-sm sm:text-base font-semibold text-center">
                  {activeTab === "Class" ? `${p.batchNo}` : p.batchNo}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-center">
                  Date: {p.date}
                </p>
                <div className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:py-2 bg-[#EF7989] rounded-full">
                  <img
                    src="/kits/worldcup.png"
                    alt="Trophy"
                    className="w-4 sm:w-6 h-4 sm:h-6 object-contain"
                  />
                  <span className="text-sm font-semibold leading-none">
                    Score: {p.score}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-lg font-semibold text-[#2333CB]">
            No leaderboard data available
          </div>
        )}
      </div>

      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
};

export default ManageLeaderBoard;