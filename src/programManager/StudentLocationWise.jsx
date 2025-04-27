import React, { useState } from "react";
import axios from "axios";
import AttendanceModal from '../StudentSearch/AttendanceModal'
import { decryptData } from '../../cryptoUtils.jsx';

const StudentLocationWise = () => {
  const [studentId, setStudentId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isEligibleModalOpen, setIsEligibleModalOpen] = useState(false);
  
  const location = decryptData(sessionStorage.getItem('location'));
  const handleSearch = async () => {
    const id = studentId.toUpperCase();
    try {
      setLoading(true); // Start loading
      setErrorMessage("");
      setStudentData(null);
      setAppliedJobs([]);
      setEligibleJobs([]);
      setAttendance([]);
  
      // Construct the URL with query parameters
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/searchstudent?studentId=${id}&location=${location}`;
  
      // API call using GET method
      const response = await axios.get(apiUrl);
      console.log(response)
      const data = response.data;
      if (!data.student_data || data.student_data.length === 0) {
        setErrorMessage(data.message || "No student found.");
        return;
      }
  
      const studentDetails = data.student_data || {};
      console.log(studentDetails)
      setStudentData({
        studentId: studentDetails.studentId || "N/A",
        name: studentDetails.name || "N/A",
        batchNo: studentDetails.BatchNo || "N/A",
        email: studentDetails.email || "N/A",
        phone: studentDetails.studentPhNumber || "N/A",
        parentNumber: studentDetails.parentNumber || "N/A",
        modeOfStudy: studentDetails.ModeofStudey || "N/A",
        location: studentDetails.location || "N/A",
        profileStatus: studentDetails.ProfileStatus ? "Completed" : "Incomplete",
        arrearsCount: studentDetails.ArrearsCount || "0",
        dob: studentDetails.DOB || "N/A",
        age: studentDetails.age || "N/A",
        gender: studentDetails.gender || "N/A",
        githubLink: studentDetails.githubLink || "N/A",
        qualification: studentDetails.qualification || "N/A",
        department: studentDetails.department || "N/A",
        state: studentDetails.state || "N/A",
        city: studentDetails.city || "N/A",
        collegeName: studentDetails.collegeName || "N/A",
        collegeUSNNumber: studentDetails.collegeUSNNumber || "N/A",
        tenthStandard: studentDetails.tenthStandard || "N/A",
        tenthPassoutYear: studentDetails.TenthPassoutYear || "N/A",
        twelfthStandard: studentDetails.twelfthStandard || "N/A",
        twelfthPassoutYear: studentDetails.TwelfthPassoutYear || "N/A",
        highestGraduationPercentage: studentDetails.highestGraduationpercentage || "N/A",
        yearOfPassing: studentDetails.yearOfPassing || "N/A",
        studentSkills: studentDetails.studentSkills || "N/A",
      });
      setAppliedJobs(data.applied_jobs_details || []);
      setEligibleJobs(data.eligible_jobs_details || []);
      setAttendance(data.Attendance || []);
    } catch (err) {
      console.log(err.response?.data?.error)
      setErrorMessage(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); 
      handleSearch();
    }
  };
  
  

  const handleRowClick = (job) => {
    setSelectedJob(job);
  };

  const closeModal = () => {
    setSelectedJob(null);
  };

// Assume `attendance` is your array of attendance records
const uniqueAttendance = attendance.reduce((acc, record) => {
  const date = record.datetime;
  // If this date hasn't been added, add it with the current status.
  if (!acc[date]) {
    acc[date] = record.status.toLowerCase();
  } else {
    // If the day already exists, mark it as 'present' if any record for that day is present.
    if (acc[date] !== "present" && record.status.toLowerCase() === "present") {
      acc[date] = "present";
    }
  }
  return acc;
}, {});

const totalDays = Object.keys(uniqueAttendance).length;
const presentDays = Object.values(uniqueAttendance).filter(
  (status) => status === "present"
).length;
const absentDays = totalDays - presentDays;



  return (
    <div className="flex flex-col items-center  p-4 min-h-[70vh]">
      <div className="w-full md:max-w-lg p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Student Data
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onKeyDown={handleKeyDown} // Trigger search on Enter key press
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`w-full text-white py-2 px-4 rounded-md shadow-md transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 focus:outline-none"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
      </div>

      {(studentData) && (
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6">
       {/* Student Details Card */}
       <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-xl w-full max-w-2xl">
         <h3 className="text-2xl font-extrabold text-indigo-800 mb-6 text-center">
           Student Details
         </h3>
         <div className="overflow-y-auto max-h-60 bg-white p-4 rounded-lg shadow-md">
         <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
        <tbody>
          {/* Personal Details */}
          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Name
            </th>
            <td className="border px-4 py-3">{studentData.name || "N/A"}</td>
          </tr>

          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Student ID
            </th>
            <td className="border px-4 py-3">{studentData.studentId || "N/A"}</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Email
            </th>
            <td className="border px-4 py-3">{studentData.email || "N/A"}</td>
          </tr>

          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Phone Number
            </th>
            <td className="border px-4 py-3">{studentData.phone || "N/A"}</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Parent's Number
            </th>
            <td className="border px-4 py-3">{studentData.parentNumber || "N/A"}</td>
          </tr>

          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Gender
            </th>
            <td className="border px-4 py-3">{studentData.gender || "N/A"}</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Date of Birth
            </th>
            <td className="border px-4 py-3">{studentData.dob || "N/A"}</td>
          </tr>

          {/* Academic Details */}
          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Batch No
            </th>
            <td className="border px-4 py-3">{studentData.batchNo || "N/A"}</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Mode of Study
            </th>
            <td className="border px-4 py-3">{studentData.modeOfStudy || "N/A"}</td>
          </tr>

          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Location
            </th>
            <td className="border px-4 py-3">{studentData.location || "N/A"}</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              College Name
            </th>
            <td className="border px-4 py-3">{studentData.collegeName || "N/A"}</td>
          </tr>

          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              College USN Number
            </th>
            <td className="border px-4 py-3">{studentData.collegeUSNNumber || "N/A"}</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Department
            </th>
            <td className="border px-4 py-3">{studentData.department || "N/A"}</td>
          </tr>

          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Qualification
            </th>
            <td className="border px-4 py-3">{studentData.qualification || "N/A"}</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Year of Passing
            </th>
            <td className="border px-4 py-3">{studentData.yearOfPassing || "N/A"}</td>
          </tr>

          {/* Exam & Score Details */}
          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              10th Percentage
            </th>
            <td className="border px-4 py-3">{studentData.tenthStandard || "N/A"}%</td>
          </tr>

          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              12th Percentage
            </th>
            <td className="border px-4 py-3">{studentData.twelfthStandard || "N/A"}%</td>
          </tr>

          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Highest Graduation Percentage
            </th>
            <td className="border px-4 py-3">{studentData.highestGraduationPercentage || "N/A"}%</td>
          </tr>

          {/* Skills */}
          <tr className="bg-gray-100">
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              Skills
            </th>
            <td className="border px-4 py-3">
            {Array.isArray(studentData?.studentSkills) && studentData.studentSkills.length > 0 ? (
              studentData.studentSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mr-2"
                >
                  {skill}
                </span>
              ))
            ) : (
              "N/A"
            )}
          </td>
          </tr>

          {/* GitHub Link */}
          <tr>
            <th className="border px-4 py-3 text-left font-semibold text-indigo-700">
              GitHub Profile
            </th>
            <td className="border px-4 py-3">
              {studentData.githubLink ? (
                <a
                  href={studentData.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {studentData.githubLink}
                </a>
              ) : (
                "N/A"
              )}
            </td>
          </tr>
        </tbody>
      </table>

         </div>
       </div>
     
       {/* Other Sections like Applied Jobs, Eligible Jobs, etc. */}
       {appliedJobs.length > 0 ? (
         <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-lg w-full max-w-2xl">
           <h3 className="text-2xl font-extrabold text-green-700 mb-6 text-center">
             Applied Jobs <span className="text-blue-500 ml-2">({appliedJobs.length})</span>
           </h3>
     
           <div className="overflow-y-auto max-h-60 bg-white p-4 rounded-lg shadow-inner">
             <table className="w-full border-collapse border border-gray-300">
               <thead>
                 <tr className="bg-green-100">
                   <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                     Company Name
                   </th>
                   <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                     Job Role
                   </th>
                   <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                     Salary
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {appliedJobs.map((job, index) => (
                   <tr
                     key={index}
                     className="transition-all cursor-pointer hover:bg-green-50"
                     onClick={() => handleRowClick(job)}
                   >
                     <td className="border border-gray-300 px-4 py-2">{job.companyName}</td>
                     <td className="border border-gray-300 px-4 py-2">{job.jobRole}</td>
                     <td className="border border-gray-300 px-4 py-2">
                       {job.salary.includes("LPA") ? job.salary : `${job.salary} LPA`}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       ) : (
         <div className="bg-gradient-to-r from-red-100 to-red-200 p-6 rounded-lg shadow-lg w-full max-w-2xl text-center">
           <h3 className="text-2xl font-extrabold text-red-700 mb-4">
             No Applied Jobs Found
           </h3>
           <p className="text-gray-800 text-lg">
             This student has not applied for any jobs yet.
           </p>
         </div>
       )}

{eligibleJobs.length > 0 ? (
  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-lg w-full max-w-2xl">
    <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
      Eligible Jobs
      <span className="text-blue-500 ml-2">({eligibleJobs.length})</span>
    </h3>

    {/* Table Preview */}
    <div className="overflow-y-auto max-h-60 bg-white p-4 rounded-lg shadow-md">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
              Company Name
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
              Job Role
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
              Salary
            </th>
          </tr>
        </thead>
        <tbody>
          {eligibleJobs.map((job, index) => (
            <tr
              key={index}
              className="transition-all cursor-pointer hover:bg-green-100"
              onClick={() => handleRowClick(job)}
            >
              <td className="border border-gray-300 px-4 py-2">{job.companyName}</td>
              <td className="border border-gray-300 px-4 py-2">{job.jobRole}</td>
              <td className="border border-gray-300 px-4 py-2">
                {job.salary.includes("LPA") ? job.salary : `${job.salary} LPA`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Show More Button */}
    <div className="text-center mt-4">
      <button
        onClick={() => setIsEligibleModalOpen(true)}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-green-700 transition duration-300"
      >
        Show All Eligible Jobs
      </button>
    </div>

    {/* Modal for Eligible Jobs */}
    {isEligibleModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
        <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
          <button
            onClick={() => setIsEligibleModalOpen(false)}
            className="absolute top-2 right-2 px-2 text-black font-bold hover:text-red-500"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
            Eligible Jobs
            <span className="text-blue-500 ml-2">({eligibleJobs.length})</span>
          </h3>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                    Company Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                    Job Role
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black font-semibold">
                    Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {eligibleJobs.map((job, index) => (
                  <tr
                    key={index}
                    className="transition-all cursor-pointer hover:bg-green-100"
                  >
                    <td className="border border-gray-300 px-4 py-2">{job.companyName}</td>
                    <td className="border border-gray-300 px-4 py-2">{job.jobRole}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {job.salary.includes("LPA") ? job.salary : `${job.salary} LPA`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
) : (
  <div className="bg-red-50 p-6 rounded-lg shadow-md w-full max-w-2xl text-center">
    <h3 className="text-xl font-bold text-red-600">No Eligible Jobs Found</h3>
    <p className="text-gray-700">The student is not eligible for any jobs currently.</p>
  </div>
)}

     
       {attendance.length > 0 ? (
         <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg w-full max-w-2xl justify-center">
           <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">
             Attendance Overview
           </h3>
           <div className="flex justify-around items-center bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col items-center">
            <span className="text-blue-500 text-lg font-bold">Total Days</span>
            <span className="text-gray-700 text-2xl font-extrabold">{totalDays}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-500 text-lg font-bold">Present</span>
            <span className="text-gray-700 text-2xl font-extrabold">{presentDays}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-red-500 text-lg font-bold">Absent</span>
            <span className="text-gray-700 text-2xl font-extrabold">{absentDays}</span>
          </div>
        </div>

           <div className="text-center">
             <button
               onClick={() => setIsAttendanceModalOpen(true)}
               className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition duration-300"
             >
               Show Detailed Attendance
             </button>
             <AttendanceModal
               isOpen={isAttendanceModalOpen}
               onClose={() => setIsAttendanceModalOpen(false)}
               attendance={attendance}
             />
           </div>
         </div>
       ) : (
         <div className="bg-red-50 p-6 rounded-lg shadow-lg w-full max-w-2xl">
           <h3 className="text-2xl font-bold text-red-600 mb-4 text-center">
             No Attendance Records Found
           </h3>
           <p className="text-gray-700 text-center">
             The student has not attended any classes yet.
           </p>
         </div>
       )}
     </div>
     
      )}

      {selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 px-2 text-black font-bold hover:text-red-500"
            >
              ✕
            </button>
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "rgb(204, 51, 102)" }}
            >
              {selectedJob.jobRole}
            </h2>
            <p className="text-sm mb-2">
              <span className="font-bold">Company Name:</span> {selectedJob.companyName}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Salary:</span> {selectedJob.salary.includes("LPA") ? selectedJob.salary : `${selectedJob.salary} LPA`}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Location:</span> {selectedJob.jobLocation || "N/A"}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Percentage:</span> {selectedJob.percentage || "N/A"}%
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Bond:</span> {selectedJob.bond || "N/A"} year
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Branch:</span> {selectedJob.department?.join(", ") || "N/A"}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Qualification:</span> {selectedJob.educationQualification}
            </p>
            <p className="text-sm mb-2">
              <span className="font-bold">Graduate Level:</span>{" "}
              {selectedJob.graduates?.join(", ") || "N/A"}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
            {selectedJob.jobSkills?.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-1 border border-gray-300 text-sm text-[#00796b] font-semibold bg-[#e6f4f1] rounded-[5px]"
              >
                {skill}
              </span>
            ))}
          </div>

            {selectedJob.specialNote && (
              <div className="mt-4 p-2 border-l-4 border-yellow-500">
                <p className="text-sm font-bold">Special Note:</p>
                <p className="text-sm">{selectedJob.specialNote}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLocationWise;
