import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStudent } from "../contexts/StudentProfileContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const picUrl = (raw) =>
  raw?.startsWith("http")
    ? raw
    : `${BASE_URL}/api/v1/pic?student_id=${raw}`;

const LeaderBoard = () => {
  const [activeTab, setActiveTab] = useState("Class");
  const [topThree, setTopThree] = useState([]);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { studentDetails } = useStudent();

  const fetchData = useCallback(
    async (tab) => {
      if (!studentDetails) return;
      setLoading(true);

      try {
        const isClass = tab === "Class";
        const params = {
          mode: isClass ? "class" : "overall",
          location: "KITS",
          limit: 50,
          ...(isClass && { batchNo: studentDetails.BatchNo }),
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
        console.error(err);
        toast.error("Could not load leaderboard");
      } finally {
        setLoading(false);
      }
    },
    [studentDetails]
  );

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

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

      {/* Top-3 Cards */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 w-full justify-center items-center px-2 sm:mt-24 sm:mb-0 mx-auto">
        {topThree.length ? (
          topThree.map((p) => (
            <div
              key={p.position}
              className={`flex flex-col items-center justify-between rounded-lg p-3 sm:p-5 w-full max-w-[250px] lg:w-[250px] h-[320px] shadow-md gap-3 ${positionCardBg(
                p.position
              )} ${p.position === 1 ? "lg:-translate-y-16" : ""} ${
                orderClass(p.position)
              }`}
            >
              <div className="flex flex-col items-center">
                <img
                  src={positionCrown(p.position)}
                  alt="Crown"
                  className="w-14 sm:w-16 h-11 object-contain mb-2"
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

              <div className="flex flex-col items-center gap-2">
                <h2 className="text-sm sm:text-md font-semibold leading-5 text-center text-ellipsis overflow-hidden max-w-[100%] break-words line-clamp-2">
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
                className={`flex items-center gap-2 px-3 py-1.5 ${
                  p.position !== 1
                    ? "bg-[#2333CB] rounded-full text-white"
                    : "text-[#2333CB] bg-white rounded-full"
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
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col items-center bg-[#2333CB]/60 rounded-lg p-5 w-full max-w-[250px] lg:w-[190px] h-[260px]"
            />
          ))
        )}
      </div>

      {/* Leaderboard Rows */}
      <div className="flex flex-col w-full max-w-[100%] sm:max-w-[1470px] mb-6 sm:mb-0 mt-12 p-6">
        <div className="flex sm:hidden flex-col gap-4">
          {others.map((p) => (
            <div
              key={p.position}
              className="flex flex-col items-center w-full bg-[#2333CB] rounded-[25px] p-4 mx-2"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src="/kits/generalcard.png"
                    alt="Icon"
                    className="w-8 h-5 object-contain"
                  />
                  <div className="w-16 h-16 rounded-full border-2 border-white/60 shadow-md overflow-hidden">
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

        <div className="hidden sm:flex flex-col gap-2">
          {others.map((p) => (
            <div
              key={p.position}
              className="flex items-center justify-between bg-[#2333CB] rounded-[25px] px-6 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold w-12 text-center">{p.position}.</span>
                <img
                  src="/kits/generalcard.png"
                  alt="Icon"
                  className="w-10 h-6 object-contain"
                />
                <div className="w-16 h-16 rounded-full border-[3px] border-white/60 shadow-md overflow-hidden">
                  <img
                    src={picUrl(p.img)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-md font-semibold leading-tight whitespace-nowrap max-w-xs truncate">
                  {p.name}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-base font-semibold text-center w-32">
                  {activeTab === "Class" ? ` ${p.batchNo}` : p.batchNo}
                </p>
                <p className="text-sm font-semibold text-center w-32">
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
            </div>
          ))}
        </div>
      </div>

      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
};

export default LeaderBoard;