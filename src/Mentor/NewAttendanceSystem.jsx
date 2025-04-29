import React from 'react';
import { FaChevronDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { MdDateRange } from 'react-icons/md';
import { FaFileExport } from 'react-icons/fa';
import { IoEyeSharp } from 'react-icons/io5';
import { FaCheckCircle } from 'react-icons/fa';

const NewAttendanceSystem = () => {
  const students = [
    { id: 'CG701', name: 'K.Ramya Priya' },
    { id: 'CG702', name: 'A.Swathi' },
    { id: 'CG703', name: 'P.Vamsi Krishna' },
    { id: 'CG704', name: 'M.Naveen' },
    { id: 'CG705', name: 'S.Rohit' },
    { id: 'CG706', name: 'D.Swetha' },
    { id: 'CG707', name: 'T.Harsha' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-6 font-['Inter'] bg-white p-4 pb-10">
      
      {/* Heading */}
      <div className="text-[#00007F] font-semibold text-[25px] leading-[25px] text-center">
        Attendance Management
      </div>

      {/* Rectangle 481 */}
      <div className="w-[90%] max-w-[1440px] bg-white shadow-md rounded-[20px] flex items-center justify-between px-8 py-6 flex-wrap gap-6">
        {/* Select a Subject */}
        <div className="flex flex-row items-center gap-6">
          <div className="text-[#00007F] font-semibold text-[20px] leading-[24px] whitespace-nowrap">
            Select a Subject
          </div>
          <div className="flex items-center justify-between w-[230px] h-[46px] bg-[#EFF0F7] rounded-[4px] px-4">
            <span className="text-black text-[16px] font-normal leading-[71px]">
              Java
            </span>
            <FaChevronDown className="text-black rotate-[-90deg]" />
          </div>
        </div>

        {/* Select a Batch */}
        <div className="flex flex-row items-center gap-6">
          <div className="text-[#00007F] font-semibold text-[20px] leading-[24px] whitespace-nowrap">
            Select a Batch
          </div>
          <div className="flex items-center justify-between w-[230px] h-[46px] bg-[#EFF0F7] rounded-[4px] px-4">
            <span className="text-black text-[16px] font-normal leading-[71px]">
              JFS-108
            </span>
            <FaChevronDown className="text-black rotate-[-90deg]" />
          </div>
        </div>

        {/* Select Date & Time */}
        <div className="flex flex-row items-center gap-6">
          <div className="text-[#00007F] font-semibold text-[20px] leading-[24px] whitespace-nowrap">
            Select Date & Time
          </div>
          <div className="flex items-center justify-between w-[230px] h-[46px] bg-[#EFF0F7] rounded-[4px] px-4">
            <span className="text-black text-[16px] font-normal leading-[71px]">
              Select Date
            </span>
            <MdDateRange className="text-[#00007F] text-[22px]" />
          </div>
        </div>

      </div>

      {/* 70% and 30% Grid */}
      <div className="w-[90%] max-w-[1440px] grid grid-cols-[70%_30%] gap-6">

        {/* Left side */}
        <div className=" bg-white shadow-md rounded-lg p-6 flex flex-col gap-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-center">
            <div className="text-[#00007F] font-semibold text-[20px] leading-[24px]">
              Student Attendance
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-[#00007F] text-white font-semibold text-[16px] rounded-[4px] px-6 h-[46px]">
                <FaFileExport className="text-white" />
                Export Excel
              </button>
              <button className="flex items-center gap-2 border border-[#00007F] text-[#00007F] font-semibold text-[16px] rounded-[4px] px-6 h-[46px] bg-white">
                <IoEyeSharp className="text-[#00007F]" />
                View Attendance
              </button>
            </div>
          </div>

          {/* Line */}
          <div className="w-full border-t-[1.2px] border-[#939393]"></div>

          {/* Table Section */}
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#00007F] text-white grid grid-cols-4 text-center font-semibold text-[16px] leading-[71px] ">
              <div>Student ID</div>
              <div>Name</div>
              <div>Attendance</div>
              <div>Remarks</div>
            </div>

            {/* Table Rows */}
            {/* Table Rows */}
{students.map((student, index) => (
  <div
    key={index}
    className={`grid grid-cols-4 items-center text-center text-black text-[16px] ${
      index % 2 === 0 ? 'bg-[#EFF0F7]' : 'bg-white'
    }`}
  >
    <div className="py-3">{student.id}</div>
    <div className="py-3">{student.name}</div>

    {/* Attendance Toggle */}
    <div className="py-3 flex justify-center">
      <label className="inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00007F] rounded-full peer peer-checked:bg-[#129E00] relative transition-all duration-300">
          <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 peer-checked:translate-x-5"></span>
        </div>
      </label>
    </div>

    {/* Remarks Input */}
    <div className="flex justify-center py-3">
      <input
        type="text"
        placeholder="Add Remarks........."
        className="bg-[#E0E4FE] border border-[#00007F] rounded-[10px] text-[#8992CC] text-[13px] px-3 py-1 w-[80%]"
      />
    </div>
  </div>
))}

          </div>

          {/* Pagination + Save */}
          <div className="flex justify-between items-center ">
            {/* Pagination */}
            <div className="flex items-center gap-2 text-black font-medium text-[16px]">
              <FaArrowLeft />
              <span>Prev</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>Next</span>
              <FaArrowRight />
            </div>

            {/* Save Attendance Button */}
            <button className="flex items-center gap-2 bg-[#00007F] text-white font-semibold text-[16px] rounded-[4px] px-6 h-[46px]">
              Save Attendance
            </button>
          </div>

        </div>

        {/* Right side */}
{/* Right side - 30% */}
<div className="flex justify-center">
  <div className="w-full max-w-[383px] h-auto bg-white shadow-md rounded-[20px] p-6 grid grid-rows-3 gap-6">
    
    {/* Total Students Card */}
    <div className="w-full border border-[#00007F] rounded-[10px] shadow-md grid grid-rows-[auto_1fr] overflow-hidden">
      {/* Header */}
      <div className="bg-[#00007F] rounded-t-[10px] p-3 flex items-center justify-center min-h-[60px]">
        <span className="text-white font-semibold text-[20px] leading-[24px]">
          Total Students
        </span>
      </div>
      {/* Body */}
      <div className="flex justify-center items-center">
        <span className="text-[#00007F] font-bold text-[40px] leading-[48px]">
          30
        </span>
      </div>
    </div>

    {/* Present Card */}
    <div className="w-full border border-[#129E00] rounded-[10px] shadow-md grid grid-rows-[auto_1fr] overflow-hidden">
      {/* Header */}
      <div className="bg-[#129E00] rounded-t-[10px] p-3 flex items-center justify-center min-h-[60px]">
        <span className="text-white font-semibold text-[20px] leading-[24px]">
          Present
        </span>
      </div>
      {/* Body */}
      <div className="flex justify-center items-center">
        <span className="text-[#129E00] font-bold text-[40px] leading-[48px]">
          17
        </span>
      </div>
    </div>

    {/* Absent Card */}
    <div className="w-full border border-[#FF6000] rounded-[10px] shadow-md grid grid-rows-[auto_1fr] overflow-hidden">
      {/* Header */}
      <div className="bg-[#FF6000] rounded-t-[10px] p-3 flex items-center justify-center min-h-[60px]">
        <span className="text-white font-semibold text-[20px] leading-[24px]">
          Absent
        </span>
      </div>
      {/* Body */}
      <div className="flex justify-center items-center">
        <span className="text-[#FF6000] font-bold text-[40px] leading-[48px]">
          13
        </span>
      </div>
    </div>

  </div>
</div>



      </div>

    </div>
  );
};

export default NewAttendanceSystem;
