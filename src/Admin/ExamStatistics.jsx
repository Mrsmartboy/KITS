import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import NewFigmaCalender from './NewFigmaCalender';
import { decryptData } from '../../cryptoUtils';

const ExamStatistics = () => {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noData, setNoData] = useState(false);
  const [batchFilter, setBatchFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const getDefaultDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.getDay() === 0) {
      yesterday.setDate(yesterday.getDate() - 1);
    }
    return yesterday.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());

  const Location = decryptData(sessionStorage.getItem("location"))?.toLowerCase() || 'all';

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDate) return;
      setLoading(true);
      setNoData(false);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/exam-report?date=${selectedDate}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch exam statistics');
        }
        const result = await response.json();
        
        if (!result || !result.locations || Object.keys(result.locations).length === 0) {
          setNoData(true);
          setData(null);
          setFilteredData(null);
          setAllBatches([]);
        } else {
          const transformedData = {
            location_stats: Object.keys(result.locations).reduce((acc, loc) => {
              acc[loc.toLowerCase()] = {
                allocated: result.locations[loc].total_allocated,
                attempted: result.locations[loc].total_attempted,
                non_attempted: result.locations[loc].total_not_attempted,
              };
              return acc;
            }, {}),
            batches: Object.values(result.locations).flatMap(loc =>
              loc.batches.map(batch => ({
                ...batch,
                location: Object.keys(result.locations).find(
                  key => result.locations[key].batches.includes(batch)
                )?.toLowerCase(),
              }))
            ),
            total_allocated_students: result.total_allocated_students,
            total_attempted_students: result.total_attempted_students,
            total_batches: result.total_batches,
          };
          setData(transformedData);
          setAllBatches(transformedData.batches);
          setNoData(false);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setNoData(false);
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    if (!data) return;

    let filteredLocationStats = data.location_stats;
    let filteredBatches = data.batches;

    if (Location !== 'all') {
      filteredLocationStats = {
        [Location]: data.location_stats[Location] || { allocated: 0, attempted: 0, non_attempted: 0 },
      };
      filteredBatches = data.batches.filter(batch => batch.location === Location);
    }

    if (batchFilter) {
      filteredBatches = filteredBatches.filter(batch => batch.batch === batchFilter);
    }

    if (locationFilter) {
      filteredBatches = filteredBatches.filter(batch => batch.location === locationFilter.toLowerCase());
    }

    if (filteredBatches.length === 0) {
      setNoData(true);
      setFilteredData(null);
      return;
    }

    const total_allocated_students = filteredBatches.reduce((sum, batch) => sum + batch.allocated, 0);
    const total_attempted_students = filteredBatches.reduce((sum, batch) => sum + batch.attempted, 0);
    const total_not_attempted = filteredBatches.reduce((sum, batch) => sum + batch.non_attempted, 0);
    const total_batches = filteredBatches.length;

    setFilteredData({
      total_allocated_students,
      total_attempted_students,
      total_not_attempted,
      total_batches,
      location_stats: filteredLocationStats,
      batches: filteredBatches,
    });
  }, [data, Location, batchFilter, locationFilter]);

  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  const getProgressColor = (percentage) => {
    if (percentage > 75) return '#22c55e'; // Green
    if (percentage >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  if (noData || !filteredData) {
    return (
      <div className="w-full p-6 sm:p-4 md:p-6 lg:p-8 font-[Inter]">
        <h2 className="font-[Inter] font-semibold p-4 text-2xl sm:text-3xl">Exam Reports Dashboard</h2>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Data Found</h2>
          <p className="text-gray-600">
            No exam statistics available for the selected date{Location !== 'all' ? ` in ${Location.charAt(0).toUpperCase() + Location.slice(1)}` : ''}.
          </p>
        </div>
        <NewFigmaCalender onDayClick={handleDayClick} selectedDate={selectedDate} />
      </div>
    );
  }

  const { total_allocated_students, total_attempted_students, total_not_attempted, total_batches, location_stats, batches } = filteredData;

  const animatedPercentage = Math.min((total_attempted_students / total_allocated_students) * 100, 100) || 0;
  const progress = Math.min((total_allocated_students / (total_allocated_students || 1)) * 100, 100) || 0;
  const notAttemptedPercentage = Math.min((total_not_attempted / total_allocated_students) * 100, 100) || 0;

  const renderLocationPerformance = (loc, index) => {
    const stats = location_stats[loc] || { allocated: 0, attempted: 0, non_attempted: 0 };
    const locAnimatedPercentage = Math.min((stats.attempted / stats.allocated) * 100, 100) || 0;
    const locProgress = Math.min((stats.allocated / (stats.allocated || 1)) * 100, 100) || 0;

    return (
      <div
        key={loc}
        className="border shadow-lg bg-[#FFFFFF] rounded-lg p-3 sm:p-4 md:p-6 h-auto min-h-[280px] sm:min-h-[300px] flex flex-col"
      >
        <div className="mb-4">
          <span className="text-[#333333] text-base sm:text-lg font-medium">Performance - {loc.charAt(0).toUpperCase() + loc.slice(1)}</span>
          <div className="border-t border-gray-300 mt-2 w-full"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center flex-grow">
          <div className="relative w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] xl:w-[120px]">
            <CircularProgressbar
              value={locAnimatedPercentage}
              strokeWidth={4}
              circleRatio={0.7}
              styles={buildStyles({
                rotation: 0.65,
                strokeLinecap: "round",
                pathColor: getProgressColor(locAnimatedPercentage),
                trailColor: "#e5e7eb",
                pathTransition: "none",
              })}
              aria-label={`${loc} performance progress`}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-xs sm:text-sm md:text-base font-medium">{stats.attempted}/{stats.allocated}</span>
              <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 block capitalize">{loc}</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 sm:space-y-4 w-full">
            <div>
              <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
                <span className="font-normal text-sm">Allocated</span>
                <span className="font-normal text-sm">{stats.allocated}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mt-1">
                <div
                  className="bg-green-500 h-1 transition-all duration-300"
                  style={{ width: `${locProgress}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
                <span className="font-normal text-sm">Attempted</span>
                <span className="font-normal text-sm">{stats.attempted}/{stats.allocated}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mt-1">
                <div
                  className="h-1 transition-all duration-300"
                  style={{ 
                    width: `${locAnimatedPercentage}%`,
                    backgroundColor: getProgressColor(locAnimatedPercentage)
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
                <span className="font-normal text-sm">Not-Attempted</span>
                <span className="font-normal text-sm">{stats.non_attempted}/{stats.allocated}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mt-1">
                <div
                  className="bg-red-500 h-1 transition-all duration-300"
                  style={{ width: `${(stats.non_attempted / stats.allocated) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-6 sm:p-4 md:p-6 lg:p-8 font-[Inter]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
        <h2 className="font-[Inter] font-semibold text-2xl sm:text-3xl">Exam Reports Dashboard</h2>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#22c55e] rounded-sm" />
            <span className="text-xs text-[#434343]">Above 75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#f97316] rounded-sm" />
            <span className="text-xs text-[#434343]">50% - 75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ef4444] rounded-sm" />
            <span className="text-xs text-[#434343]">Below 50%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {Location ? (
          <div className="border shadow-lg bg-[#FFFFFF] rounded-lg p-3 sm:p-4 md:p-6 h-auto min-h-[280px] sm:min-h-[300px] flex flex-col">
            <div className="mb-4">
              <span className="text-[#333333] text-base sm:text-lg font-medium">Overall Performance</span>
              <div className="border-t border-gray-300 mt-2"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center flex-grow">
              <div className="relative w-[100px] sm:w-[120px] md:w-[160px] lg:w-[200px]">
                <CircularProgressbar
                  value={animatedPercentage}
                  strokeWidth={4}
                  circleRatio={0.7}
                  styles={buildStyles({
                    rotation: 0.65,
                    strokeLinecap: "round",
                    pathColor: getProgressColor(animatedPercentage),
                    trailColor: "#e5e7eb",
                    pathTransition: "none",
                  })}
                  aria-label="Overall performance progress"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-xs sm:text-sm md:text-base font-medium">{total_attempted_students}/{total_allocated_students}</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 inline-block text-nowrap">
                    Total Allocation
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                <div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
                    <span className="font-normal text-sm inline-block text-nowrap">Total Allocated</span>
                    <span className="font-normal text-sm">{total_allocated_students}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mt-1">
                    <div
                      className="bg-green-500 h-1 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
                    <span className="font-normal text-sm">Total Attempted</span>
                    <span className="font-normal text-sm">{total_attempted_students}/{total_allocated_students}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mt-1">
                    <div
                      className="h-1 transition-all duration-300"
                      style={{ 
                        width: `${animatedPercentage}%`,
                        backgroundColor: getProgressColor(animatedPercentage)
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
                    <span className="font-normal text-sm">Total Not Attempted</span>
                    <span className="font-normal text-sm">{total_not_attempted}/{total_allocated_students}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mt-1">
                    <div
                      className="bg-red-500 h-1 transition-all duration-300"
                      style={{ width: `${notAttemptedPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:border rounded-md lg:shadow-lg bg-[#FFFFFF] md:grid md:grid-cols-1 lg:grid-cols-1">
            {renderLocationPerformance(Location, 0)}
          </div>
        )}
      </div>

      <NewFigmaCalender onDayClick={handleDayClick} selectedDate={selectedDate} />

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="font-[Inter] font-semibold text-2xl sm:text-3xl">Batch Details</span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <select
              name="batch"
              className="border shadow-md px-3 py-2 text-sm sm:text-base w-full sm:w-40 rounded-md"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              <option value="">All Batches</option>
              {[...new Set(
                allBatches.filter(batch => Location === 'all' || batch.location === Location)
                .map(item => item.batch)
              )].map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
            {Location === 'all' ? (
              <select
                name="location"
                className="border shadow-md px-3 py-2 text-sm sm:text-base w-full sm:w-40 rounded-md"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {[...new Set(allBatches.map(batch => batch.location))].map((loc) => (
                  <option key={loc} value={loc}>
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="border shadow-md px-3 py-2 text-sm sm:text-base w-full sm:w-40 rounded-md bg-gray-100 text-gray-700">
                {Location.charAt(0).toUpperCase() + Location.slice(1)}
              </span>
            )}
          </div>
        </div>
        <div className="border-t border-gray-300 mt-4 mb-6"></div>

        <div className="hidden sm:block max-h-[400px] overflow-y-auto">
          <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
            <thead className="sticky top-0 bg-[#19216F] text-white">
              <tr>
                <th className="py-3 px-4 text-left text-sm sm:text-base">Batch</th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">Allocated</th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">Attempted</th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">Not Attempted</th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">Last Exam End Date</th>
                {Location === 'all' && (
                  <th className="py-3 px-4 text-left text-sm sm:text-base">Location</th>
                )}
              </tr>
            </thead>
            <tbody>
              {batches.map((item, index) => (
                <tr key={index} className="border even:bg-gray-50 odd:bg-white">
                  <td className="py-3 px-4 text-sm sm:text-base">{item.batch}</td>
                  <td className="py-3 px-4 text-sm sm:text-base">{item.allocated}</td>
                  <td className="py-3 px-4 text-sm sm:text-base">{item.attempted}</td>
                  <td className="py-3 px-4 text-sm sm:text-base">{item.non_attempted}</td>
                  <td className="py-3 px-4 text-sm sm:text-base">{item.last_exam_end_time}</td>
                  {Location === 'all' && (
                    <td className="py-3 px-4 text-sm sm:text-base capitalize">{item.location}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden max-h-[400px] overflow-y-auto space-y-4">
          {batches.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white shadow-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Batch:</span>
                <span>{item.batch}</span>
                <span className="font-medium">Allocated:</span>
                <span>{item.allocated}</span>
                <span className="font-medium">Attempted:</span>
                <span>{item.attempted}</span>
                <span className="font-medium">Not Attempted:</span>
                <span>{item.non_attempted}</span>
                <span className="font-medium">Exam End:</span>
                <span>{item.last_exam_end_time}</span>
                {Location === 'all' && (
                  <>
                    <span className="font-medium">Location:</span>
                    <span className="capitalize">{item.location}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamStatistics;