import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../contexts/JobsContext';
import { useStudent } from '../contexts/StudentProfileContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { decryptData } from '../../cryptoUtils';

const JobViewer = () => {
  const { jobId } = useParams();
  const { jobs, loading: jobsLoading, error: jobsError, fetchJobs } = useJobs();
  const { studentDetails, loading: studentLoading, error: studentError, fetchStudentDetails } = useStudent();
  const navigate = useNavigate();
  const student_id = decryptData(localStorage.getItem('student_id'));

  useEffect(() => {
    fetchJobs();
    fetchStudentDetails();
  }, [fetchJobs, fetchStudentDetails]);

  const applyJob = (selectedJobId) => {
    const job = jobs.find((job) => job.job_id === selectedJobId);

    if (!job || !job.isActive) {
      Swal.fire({
        icon: 'error',
        title: 'This job is not active. You cannot apply.',
      });
      return;
    }

    if (studentDetails?.applied_jobs?.includes(selectedJobId)) {
      Swal.fire({
        icon: 'info',
        title: 'Already Applied',
        text: 'You have already applied for this job.',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to apply for this job?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/applyforjob`, { job_id: selectedJobId, student_id })
          .then(async (response) => {
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Job Applied Successfully',
                showConfirmButton: false,
                timer: 3000,
              });
              await fetchStudentDetails();
              await fetchJobs();
            }
          })
          .catch((error) => {
            if (error.response?.status === 400) {
              Swal.fire({
                icon: 'error',
                title: 'Already applied for the job',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'An error occurred while applying',
              });
            }
          });
      }
    });
  };

  // Loading Screen with Inline Animation
  if (jobsLoading || studentLoading) {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <style>
          {`
            @layer utilities {
              @keyframes custom-spin {
                to { transform: rotate(360deg); }
              }
              .animate-custom-spin {
                animation: custom-spin 1s linear infinite;
              }
            }
          `}
        </style>
      
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-4 border-[#19216F] border-solid rounded-full animate-custom-spin"></div>
          <p className="text-lg font-semibold text-[#19216F] font-['Inter']">Loading Job Details...</p>
        </div>
      </div>
      
    );
  }

  // Error Screen
  if (jobsError || studentError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-red-600 font-['Inter']">
          Error: {jobsError || studentError}
        </p>
        <button
          onClick={() => { fetchJobs(); fetchStudentDetails(); }}
          className="mt-4 bg-[#19216F] text-white px-4 py-2 rounded-md font-semibold font-['Inter'] hover:bg-[#0f1a5b]"
        >
          Retry
        </button>
      </div>
    );
  }

  const job = jobs.find((j) => j.job_id === jobId) || {};
  const isApplied = studentDetails?.applied_jobs?.includes(jobId);

  return (
    <div className="w-full flex flex-col items-center pt-4 px-4 pb-20 mt-0">
      {/* Heading */}
    
      {/* Main Content */}
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-6 justify-center items-end">
        {/* Left Column */}
        <div className="w-full lg:w-[70%] flex flex-col">
        <h1 className="text-xl sm:text-2xl font-semibold font-['Inter'] text-[#19216F] text-center mb-6 mt-6">
        Job Details
      </h1>

          {/* Job Info Card */}
          <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-4 sm:p-6">
            {/* Job Role, Deadline, Button */}
            <div className="w-full flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-[#19216F] text-lg sm:text-xl font-bold font-['Inter']">Job Role:</span>
                <span className="text-[#19216F] text-lg sm:text-xl font-bold font-['Inter']">
                  {job.jobRole || 'N/A'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-[#E41F3A] text-lg sm:text-xl font-bold font-['Inter']">Deadline:</span>
                <span className="text-[#19216F] text-lg sm:text-xl font-bold font-['Inter']">
                  {job.deadLine ? new Date(job.deadLine).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <button
                onClick={() => applyJob(job.job_id)}
                className={`px-5 py-2 rounded-md text-sm sm:text-base font-semibold font-['Inter'] whitespace-nowrap ${
                  isApplied || !job.isActive
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#19216F] text-white hover:bg-[#0f1a5b]'
                }`}
                disabled={isApplied || !job.isActive}
              >
                {isApplied ? 'Applied' : 'Apply Now'}
              </button>
            </div>

            <hr className="w-full border-t border-[#6C6C6C] mb-6" />

            {/* Info Grid */}
            <div className="w-full flex flex-col md:flex-row gap-6">
              {/* Left Info */}
              <div className="w-full md:w-1/2 text-base font-['Inter'] text-black leading-[30px]">
                {[
                  ['Job ID:', job.job_id || 'N/A'],
                  ['Company Name:', job.companyName || 'N/A'],
                  ['Job Location:', job.jobLocation || 'N/A'],
                  ['Salary:', job.salary ? `${job.salary} LPA` : 'N/A'],
                  ['Technologies:', job.technologies?.join(', ') || 'N/A'],
                ].map(([label, value], index) => (
                  <div className="mb-4" key={index}>
                    <p className="text-[#19216F] font-medium text-lg">{label}</p>
                    <p className='text-gray-600'>{value}</p>
                  </div>
                ))}
              </div>

              {/* Right Info */}
              <div className="w-full md:w-1/2 text-base font-['Inter'] text-black leading-[30px]">
                {[
                  ['Education Qualification:', job.educationQualification || 'N/A'],
                  ['Department:', job.department?.join(', ') || 'N/A'],
                  ['Graduates:', job.graduates?.join(', ') || 'N/A'],
                  ['Percentage:', job.percentage ? `${job.percentage}%` : 'N/A'],
                  ['Bond:', job.bond !== undefined ? `${job.bond} Year${job.bond !== 1 ? 's' : ''}` : 'N/A'],
                ].map(([label, value], index) => (
                  <div className="mb-4" key={index}>
                    <p className="text-[#19216F] font-medium text-lg">{label}</p>
                    <p className='text-gray-600'>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Special Note */}
          <div className="relative z-0 -mt-3">
            <div className="bg-[#19216F] p-4 sm:p-6 rounded-md shadow-lg">
              <h2 className="text-white text-lg sm:text-xl font-bold font-['Inter'] mb-2 leading-[30px]">
                Special Note:
              </h2>
              <p className="text-white text-sm sm:text-base font-['Inter'] leading-[28px]">
                {job.specialNote || 'No special note available.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="hidden lg:flex w-full lg:w-[30%] justify-center items-start pt-4 mt-10">
          <img
            src="/Joblist/jobviewer.png"
            alt="Job Illustration"
            className="w-full max-w-[400px] h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default JobViewer;