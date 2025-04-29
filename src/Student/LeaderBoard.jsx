import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStudent } from "../contexts/StudentProfileContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
// right below BASE_URL (or inside your helpers block)
const picUrl = (raw) =>
  raw?.startsWith("http") // API already sent a full URL?
    ? raw
    : `${BASE_URL}/api/v1/pic?student_id=${raw}`;

const LeaderBoard = () => {
  const [activeTab, setActiveTab] = useState("Class"); // "Class" | "Overall"
  const [topThree, setTopThree] = useState([]); // 1-3
  const [others, setOthers] = useState([]); // 4+
  const [loading, setLoading] = useState(false);

  const { studentDetails } = useStudent();

  /* ── fetchData ─────────────────────────────────────────────── */
  const fetchData = useCallback(
    async (tab) => {
      if (!studentDetails) return; // still loading user info
      setLoading(true);

      try {
        const isClass = tab === "Class";

        // build query params dynamically
        const params = {
          mode: isClass ? "class" : "overall",
          location: "KITS",
          limit: 7,
          ...(isClass && { batchNo: studentDetails.BatchNo }), // 🆕
        };

        const { data } = await axios.get(`${BASE_URL}/api/v1/leaderboard`, {
          params,
        });

        if (data.success) {
          setTopThree(data.topThree || []);
          setOthers(data.others || []);
          // toast.success(`Loaded ${params.mode} leaderboard`);
        } else {
          toast.error(data.message || "Unknown error");
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load leaderboard");
      } finally {
        setLoading(false);
      }
    },
    [studentDetails] // 🆕  make sure callback updates when BatchNo changes
  );
  /* ──────────────────────────────────────────────────────────── */

  /* ────────────────────────────────────────────────────────── */
  /*  run once and whenever tab changes                        */
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);
  /* ────────────────────────────────────────────────────────── */

  /*  helpers  */
  const positionCardBg = (pos) =>
    pos !== 1 ? "bg-white text-[#181D27]" : "bg-[#2333CB] text-white";
  const positionCrown = (pos) => `/kits/card${pos}.png`;
  // Put first-place card in the middle (visual order 2 → 1 → 3 on ≥ sm)
  const orderClass = (pos) => {
    switch (pos) {
      case 2: // second place should be left
        return "sm:order-1";
      case 1: // first place should be centre
        return "sm:order-2";
      case 3: // third place should be right
        return "sm:order-3";
      default: // anything else – keep natural order
        return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen font-[Inter] text-white mt-16">
      {/* Tabs */}
      <div className="w-full sm:max-w-[450px] h-10 sm:h-12 bg-[#2333CB] rounded-full p-1 flex items-center justify-between mx-auto mb-6 sm:mb-0">
        {["Class", "Overall"].map((tab) => (
          <div
            key={tab}
            onClick={() => !loading && setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center h-full rounded-full cursor-pointer transition-all duration-300 text-xs sm:text-base ${
              activeTab === tab ? "bg-white text-[#010181]" : "text-white"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Top-3 Cards */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-full max-w-[90%] sm:max-w-[600px] md:max-w-[650px] px-2 sm:mt-24 items-end sm:mb-0 mx-auto">
        {topThree.length
          ? topThree.map((p) => (
              <div
                key={p.position}
                className={`flex flex-col items-center rounded-lg p-3 sm:p-5
                        w-full min-w-[190px] sm:w-[190px] h-full sm:h-[280px] shadow-md
                        gap-2 sm:gap-4
                        ${positionCardBg(p.position)}
                        ${p.position === 1 ? "md:-translate-y-12" : ""}
                        ${orderClass(p.position)}`} // ⬅️ add this
              >
                {/* crown + avatar */}
                <div className="flex flex-col items-center mt-[-6px]">
                  <img
                    src={positionCrown(p.position)}
                    alt="Crown"
                    className="w-10 sm:w-11 h-10 sm:h-11 object-contain"
                  />
                  <div
                    className={`w-14 sm:w-16 h-14 sm:h-16 rounded-full border-2 sm:border-[4px] shadow-md overflow-hidden ${
                      p.position === 1 ? "border-1" : "border-[#2333CB]"
                    }`}
                  >
                    <img
                      src={picUrl(picUrl(p.img))}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* name, batch/class */}
                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-sm sm:text-xl font-semibold leading-5 sm:leading-6 text-center text-ellipsis overflow-hidden max-w-[90%] break-words line-clamp-2">
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

                {/* score */}
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
          : /* skeletons while loading */
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex flex-col items-center bg-[#2333CB]/60 rounded-lg p-5 w-full sm:w-[190px] h-60 sm:h-[260px]"
              />
            ))}
      </div>

      {/* Leaderboard Rows */}
      <div className="flex flex-col w-full max-w-[90%] sm:max-w-[1470px] mb-6 sm:mb-0 mt-12 p-6">
        {/* Mobile stacked rows */}
        <div className="flex sm:hidden flex-col">
          {others.map((p) => (
            <div
              key={p.position}
              className="flex flex-col items-center w-full bg-[#2333CB] rounded-[25px] p-4 mx-2 mb-6"
            >
              {/* row content condensed */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src="/kits/generalcard.png"
                    alt="Icon"
                    className="w-5 h-5 object-contain"
                  />
                  <div className="w-12 h-12 rounded-full border-2 border-white/60 shadow-md overflow-hidden">
                    <img
                      src={picUrl(p.img)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-base font-semibold leading-tight text-center whitespace-nowrap">
                  {p.name}
                </span>
                <p className="text-sm font-semibold text-center">
                  {activeTab === "Class" ? `Class: ${p.batchNo}` : p.batchNo}
                </p>
                <p className="text-xs font-semibold text-center">
                  Date: {p.date}
                </p>
                <div className="flex items-center gap-1 px-2 py-1 bg-[#EF7989] rounded-full">
                  <img
                    src="/kits/worldcup.png"
                    alt="Trophy"
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-sm font-semibold leading-none">
                    Score: {p.score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop rows 4-7 */}
        <div className="hidden sm:flex flex-col">
          {others.map((p) => (
            <div
              key={p.position}
              className="flex items-center justify-between bg-[#2333CB] rounded-[25px] px-6 py-3 mb-2"
            >
              <div className="flex items-center gap-5">
                <span className="text-2xl font-bold">{p.position}.</span>
                <img
                  src="/kits/generalcard.png"
                  alt="Icon"
                  className="w-6 h-6 object-contain"
                />
                <div className="w-16 h-16 rounded-full border-[3px] border-white/60 shadow-md overflow-hidden">
                  <img
                    src={picUrl(p.img)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-2xl font-semibold leading-tight whitespace-nowrap">
                  {p.name}
                </span>
              </div>

              <p className="text-base font-semibold text-center">
                {activeTab === "Class" ? `Class: ${p.batchNo}` : p.batchNo}
              </p>
              <p className="text-sm font-semibold text-center">
                Date: {p.date}
              </p>

              <div className="flex items-center gap-2 px-3 py-2 bg-[#EF7989] rounded-full">
                <img
                  src="/kits/worldcup.png"
                  alt="Trophy"
                  className="w-6 h-6 object-contain"
                />
                <span className="text-sm font-semibold leading-none">
                  Score: {p.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
};

export default LeaderBoard;
