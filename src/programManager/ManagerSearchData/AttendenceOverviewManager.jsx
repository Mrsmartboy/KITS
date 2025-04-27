import React, { useEffect, useMemo, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const AttendenceOverviewManager = ({ data }) => {
  // Fallback UI if data is missing or empty.
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <img
          src="https://img.freepik.com/free-vector/calendar-with-user-glyph-style_78370-7208.jpg?semt=ais_hybrid.png"
          alt="No Student"
          className="w-28 h-28 mb-4 opacity-80"
        />
        <p className="text-xl font-semibold text-gray-600 mb-1">
          No Attendance Data Available
        </p>
        <p className="text-gray-500 text-sm">
          Search for a student to see their details here.
        </p>
      </div>
    );
  }

  // Memoize the unique subjects to prevent unnecessary recalculations.
  const uniqueSubjects = useMemo(() => {
    return [...new Set(data.map(item => item.course))];
  }, [data]);

  // Initialize selectedSubject and selectedDate.
  const [selectedSubject, setSelectedSubject] = useState('');
  // The date is initialized to today; clearing it will set an empty string.
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Set the default subject on mount (or when data changes) if none is selected.
  useEffect(() => {
    if (!selectedSubject && uniqueSubjects.length > 0) {
      setSelectedSubject(uniqueSubjects[0]);
    }
  }, [selectedSubject, uniqueSubjects]);

  // Filtering attendance data.
  let filteredData;
  if (!selectedDate) {
    // When no date is selected, include all records for the selected subject.
    filteredData = data.filter(item => item.course === selectedSubject);
  } else {
    // When a date is selected, filter by subject and by the selected month and year.
    const selectedMonth = new Date(selectedDate).getMonth() + 1;
    const selectedYear = new Date(selectedDate).getFullYear();
    filteredData = data.filter(item => {
      // Assuming item.datetime is in "YY-MM-DD" or "YYYY-MM-DD" format.
      const [yearStr, monthStr] = item.datetime.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const fullYear = year < 100 ? 2000 + year : year;
      return (
        item.course === selectedSubject &&
        month === selectedMonth &&
        fullYear === selectedYear
      );
    });
  }

  // Calculate attendance stats.
  // If no date is selected, group by the full date (to cover all months);
  // otherwise, group by the day-of-month.
  let attendanceByDay = {};
  if (!selectedDate) {
    filteredData.forEach(item => {
      // Using the full date as a key (e.g., "2023-04-01")
      const dateKey = item.datetime;
      if (!attendanceByDay[dateKey]) attendanceByDay[dateKey] = [];
      attendanceByDay[dateKey].push(item.status);
    });
  } else {
    filteredData.forEach(item => {
      const day = parseInt(item.datetime.split('-')[2], 10);
      if (!attendanceByDay[day]) attendanceByDay[day] = [];
      attendanceByDay[day].push(item.status);
    });
  }

  const totalDays = Object.keys(attendanceByDay).length;
  const presentCount = Object.values(attendanceByDay).filter(statuses =>
    statuses.includes('present')
  ).length;
  const absentCount = totalDays - presentCount;

  // Calendar display: If no date is selected, show the current month.
  let daysInMonth;
  let displayDate;
  if (!selectedDate) {
    const now = new Date();
    daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    displayDate = now.toISOString().split('T')[0];
  } else {
    const selDate = new Date(selectedDate);
    daysInMonth = new Date(selDate.getFullYear(), selDate.getMonth() + 1, 0).getDate();
    displayDate = selectedDate;
  }
  const displayMonthName = new Date(displayDate).toLocaleString('default', { month: 'long' });
  const displayYear = new Date(displayDate).getFullYear();

  return (
    <div className="w-full flex justify-center items-center p-0 md:p-6 lg:p-10 font-[inter]">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px]">
        {/* Left Section: Attendance Overview */}
        <div className="flex-1 bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg px-4 sm:px-6 md:px-8 py-6">
          <h2 className="text-[#19216F] text-xl font-bold mb-6">Attendance Overview</h2>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Subject Dropdown */}
            <div className="w-full md:w-1/2">
              <h3 className="text-[#19216F] font-semibold text-[18px] mb-2">Select a Subject</h3>
              <div className="relative w-full h-[46px] bg-white shadow-md rounded flex items-center px-4">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-transparent text-black text-[16px] outline-none cursor-pointer"
                >
                  {uniqueSubjects.map((subject, i) => (
                    <option key={i} value={subject}>
                      {subject}
                    </option>
                  ))}
                  <FaChevronDown  className="absolute right-4 text-black" />
                </select>
              </div>
            </div>

            {/* Date Picker */}
            <div className="w-full md:w-1/2">
              <h3 className="text-[#19216F] font-semibold text-[18px] mb-2">Select a Date</h3>
              <div className="relative w-full h-[46px] bg-white shadow-md rounded flex items-center px-4" >
                <input
                  type="date"
                  className="w-full bg-transparent text-[#19216F] text-[16px] outline-none cursor-pointer"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="w-full border-t border-[#303C60] mb-6"></div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Days', value: totalDays, color: '#19216F' },
              { label: 'Present', value: presentCount, color: '#129E00' },
              { label: 'Absent', value: absentCount, color: '#FF6000' },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-[10px] shadow-md bg-white border"
                style={{ borderColor: item.color }}
              >
                <div
                  className="rounded-t-[10px] h-[54px] flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <p className="text-white text-[20px] font-semibold">{item.label}</p>
                </div>
                <div className="flex justify-center items-center h-[100px]">
                  <p className="text-[36px] font-bold" style={{ color: item.color }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Calendar */}
        <div className="w-full lg:w-[456px] h-auto bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-4 md:p-6">
          {/* Month Header */}
          <div className="text-center text-2xl font-bold text-[#19216F] mb-4">
            {displayMonthName} {displayYear}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-[10px]">
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(displayYear, new Date(displayDate).getMonth(), day);
              const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              // When no date is selected, group by full date string; otherwise by day.
              const key =
                !selectedDate
                  ? dateObj.toISOString().split('T')[0]
                  : day;
              const statuses = attendanceByDay[key] || [];
              const isPresent = statuses.includes('present');
              const isAbsent = statuses.includes('absent');

              let bgColor = 'bg-[#E1EFFF]';
              let textColor = 'text-gray-600';
              if (isPresent) {
                bgColor = 'bg-[#129E00]';
                textColor = 'text-white';
              } else if (isAbsent) {
                bgColor = 'bg-[#FF6000]';
                textColor = 'text-white';
              }

              return (
                <div
                  key={day}
                  className={`rounded-[8px] flex flex-col items-center justify-center aspect-square ${bgColor}`}
                >
                  <span className={`text-[18px] font-medium ${textColor}`}>{day}</span>
                  <span className={`text-[12px] ${textColor}`}>{weekday}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendenceOverviewManager;
