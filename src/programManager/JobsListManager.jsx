import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSearch, FaChevronDown, FaSadTear } from 'react-icons/fa';
import { useJobs } from '../contexts/JobsContext';

const JobsListManager = () => {
  const { jobs, loading: jobsLoading, error: jobsError, fetchJobs } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (jobs.length > 0) {
      setFilteredJobs(jobs);
    }
  }, [jobs]);

  const uniqueLocations = [...new Set(jobs.map((job) => job.jobLocation))];

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    let filtered = jobs;

    if (query) {
      filtered = filtered.filter((job) => {
        const searchableFields = [
          job.jobRole,
          job.companyName,
          job.jobLocation,
          job.salary,
          job.educationQualification,
          ...(job.technologies || []),
          ...(job.department || []),
          ...(job.graduates || []),
          job.specialNote,
          String(job.percentage),
          String(job.bond),
        ].map((field) => (field ? String(field).toLowerCase() : ''));

        return searchableFields.some((field) => field.includes(query));
      });
    }

    if (selectedLocation) {
      filtered = filtered.filter((job) => job.jobLocation === selectedLocation);
    }

    setFilteredJobs(filtered);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  if (jobsLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-4 border-[#19216F] border-solid rounded-full animate-[spin_1s_linear_infinite]"></div>
          <p className="text-lg font-semibold text-[#19216F] font-['Inter']">Loading Job Openings...</p>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-red-600 font-['Inter']">Error: {jobsError}</p>
        <button
          onClick={() => fetchJobs()}
          className="mt-4 bg-[#19216F] text-white px-4 py-2 rounded-md font-semibold font-['Inter'] hover:bg-[#0f1a5b]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center pt-2 px-4 mt-0">
      {/* Heading */}
      <h1 className="text-[20px] sm:text-[24px] leading-[70px] font-semibold text-[#19216F] font-['Inter'] text-center">
        Job Openings
      </h1>

      {/* Line Break */}
      <hr className="w-full max-w-[1433px] border-t border-[#9E9A9A] mt-2" />

      {/* Search + Location + Button */}
      <div className="w-full max-w-[1433px] flex flex-col lg:flex-row items-center mt-6">
        <div className="flex-grow w-full lg:w-[calc(100%-379px-45px)] bg-[#EFF0F7] shadow-md rounded-sm px-4 py-2 h-[46px] flex items-center">
          <input
            type="text"
            placeholder="Search by role, skills, company, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent outline-none text-gray-600 text-[16px] font-['Inter'] placeholder:text-[#000000]"
          />
        </div>
        <div className="relative w-full lg:w-[379px] h-[46px] bg-[#FFDCC9] shadow-md rounded-sm px-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer w-full"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          >
            <FaMapMarkerAlt className="text-black" />
            <span className="text-black font-semibold text-[16px] font-['Inter']">
              {selectedLocation || 'Location'}
            </span>
          </div>
          <FaChevronDown className="text-black text-sm" />
          {isLocationDropdownOpen && (
            <div className="absolute top-[46px] left-0 w-full bg-white shadow-lg rounded-md z-10 max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedLocation('');
                  setIsLocationDropdownOpen(false);
                }}
              >
                All Locations
              </div>
              {uniqueLocations.map((location) => (
                <div
                  key={location}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedLocation(location);
                    setIsLocationDropdownOpen(false);
                  }}
                >
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="w-[45px] h-[46px] bg-[#19216F] shadow-md flex items-center justify-center hover:bg-[#0f1a5b]"
        >
          <FaSearch className="text-white text-[16px]" />
        </button>
      </div>

      {/* No Results Found */}
      {filteredJobs.length === 0 ? (
        <div className="w-full flex justify-center mt-10">
          <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-6 max-w-[600px] text-center">
            <FaSadTear className="text-[#19216F] text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#19216F] font-['Inter'] mb-2">
              No Jobs Found
            </h2>
            <p className="text-gray-600 text-[16px] font-['Inter']">
              Sorry, we couldn’t find any jobs matching your search. Try adjusting your search terms or location!
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('');
                setFilteredJobs(jobs);
              }}
              className="mt-4 bg-[#19216F] text-white px-4 py-2 rounded-md font-semibold font-['Inter'] hover:bg-[#0f1a5b]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="w-full flex justify-center mt-10">
            <div className="w-full hidden md:block max-w-[1433px] bg-white shadow-[0px_4px_20px_#B3BAF7] overflow-x-auto">
              <div className="grid grid-cols-[25%_18%_15%_20%_11%_11%] bg-[#19216F] text-white font-semibold text-[16px] font-['Inter'] min-w-[1000px] px-4 py-3">
                <div className="flex justify-start items-center">Job Title</div>
                <div className="flex justify-start items-center">Primary Skills</div>
                <div className="flex justify-start items-center">Deadline</div>
                <div className="flex justify-start items-center">Location</div>
                <div className="flex justify-start items-center">Status</div>
                <div className="flex justify-center items-center">Action</div>
              </div>
              {filteredJobs.map((job, index) => {
                const status = job.isActive ? 'Active' : 'Timeout'; // Placeholder status, customize as needed
                return (
                  <div
                    key={job.job_id}
                    className={`grid grid-cols-[25%_18%_15%_20%_11%_11%] ${
                      index % 2 === 0 ? 'bg-[#EFF0F7]' : 'bg-white'
                    } text-black text-[16px] font-['Inter'] px-4 py-3 border-b min-w-[1000px]`}
                  >
                    <div className="flex justify-start items-center">{job.jobRole || 'N/A'}</div>
                    <div className="flex justify-start items-center">{job.technologies?.join(', ') || 'N/A'}</div>
                    <div className="flex justify-start items-center">{new Date(job.deadLine).toLocaleDateString() || 'N/A'}</div>
                    <div className="flex justify-start items-center">{job.jobLocation || 'N/A'}</div>
                    <div
                      className="flex justify-start items-center font-semibold"
                      style={{
                        color: status === 'Active' ? '#129E00' : '#FF0000',
                      }}
                    >
                      {status}
                    </div>
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => openModal(job)}
                        className="bg-[#EC5300] text-white px-4 py-1 text-sm font-semibold hover:bg-[#d94a00]"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden mt-6 w-full flex flex-col items-center space-y-6 px-4">
            {filteredJobs.map((job) => {
              const status = job.isActive ? 'Active' : 'Timeout'; // Placeholder status, customize as needed
              return (
                <div
                  key={job.job_id}
                  className="w-[90%] bg-white shadow-xl p-6 rounded-xl border border-gray-200 transition-all duration-300"
                >
                  <h3 className="text-[20px] font-bold text-[#19216F] font-['Inter'] mb-3">
                    {job.jobRole || 'N/A'}
                  </h3>
                  <div className="text-[15px] font-['Inter'] text-gray-800 space-y-2">
                    <p><span className="text-gray-500 font-medium">Skills:</span> {job.technologies?.join(', ') || 'N/A'}</p>
                    <p>
                      <span className="text-gray-500 font-medium">Deadline:</span>{' '}
                      {new Date(job.deadLine).toLocaleDateString() || 'N/A'}
                    </p>
                    <p><span className="text-gray-500 font-medium">Location:</span> {job.jobLocation || 'N/A'}</p>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Status:</span>
                      <span
                        className={`font-semibold px-3 py-1 text-xs rounded-full ${
                          status === 'Active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                  </div>
                  <div className="flex justify-end mt-5">
                    <button
                      onClick={() => openModal(job)}
                      className="bg-[#EC5300] hover:bg-[#d94a00] transition-colors duration-200 text-white px-6 py-2 rounded-md text-sm font-semibold shadow-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal with JobViewer Details */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-[90%] md:max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
            <h1 className="text-xl sm:text-2xl font-semibold font-['Inter'] text-[#19216F] text-center mb-6">
              Job Details
            </h1>

            {/* Job Info Card */}
            <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-4 sm:p-6">
              <div className="w-full flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-[#19216F] text-lg sm:text-xl font-bold font-['Inter']">Job Role:</span>
                  <span className="text-[#19216F] text-lg sm:text-xl font-bold font-['Inter']">
                    {selectedJob.jobRole || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-[#E41F3A] text-lg sm:text-xl font-bold font-['Inter']">Deadline:</span>
                  <span className="text-[#19216F] text-lg sm:text-xl font-bold font-['Inter']">
                    {selectedJob.deadLine ? new Date(selectedJob.deadLine).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <hr className="w-full border-t border-[#6C6C6C] mb-6" />

              {/* Info Grid */}
              <div className="w-full flex flex-col md:flex-row gap-6">
                {/* Left Info */}
                <div className="w-full md:w-1/2 text-base font-['Inter'] text-black leading-[30px]">
                  {[
                    ['Job ID:', selectedJob.job_id || 'N/A'],
                    ['Company Name:', selectedJob.companyName || 'N/A'],
                    ['Job Location:', selectedJob.jobLocation || 'N/A'],
                    ['Salary:', selectedJob.salary ? `${selectedJob.salary} LPA` : 'N/A'],
                    ['Technologies:', selectedJob.technologies?.join(', ') || 'N/A'],
                  ].map(([label, value], index) => (
                    <div className="mb-4" key={index}>
                      <p className="text-[#19216F] font-medium text-lg">{label}</p>
                      <p className="text-gray-600">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Right Info */}
                <div className="w-full md:w-1/2 text-base font-['Inter'] text-black leading-[30px]">
                  {[
                    ['Education Qualification:', selectedJob.educationQualification || 'N/A'],
                    ['Department:', selectedJob.department?.join(', ') || 'N/A'],
                    ['Graduates:', selectedJob.graduates?.join(', ') || 'N/A'],
                    ['Percentage:', selectedJob.percentage ? `${selectedJob.percentage}%` : 'N/A'],
                    ['Bond:', selectedJob.bond !== undefined ? `${selectedJob.bond} Year${selectedJob.bond !== 1 ? 's' : ''}` : 'N/A'],
                  ].map(([label, value], index) => (
                    <div className="mb-4" key={index}>
                      <p className="text-[#19216F] font-medium text-lg">{label}</p>
                      <p className="text-gray-600">{value}</p>
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
                  {selectedJob.specialNote || 'No special note available.'}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 font-semibold font-['Inter']"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsListManager;