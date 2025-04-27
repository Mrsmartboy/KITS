import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useJobs } from '../contexts/JobsContext';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import './BDEDashboard.css';
import { decryptData } from '../../cryptoUtils.jsx';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const BDEDashboard = () => {
  const { jobs, loading, error, fetchJobs } = useJobs();

  useEffect(() => {
    fetchJobs();
  }, []);

  const userType = decryptData(sessionStorage.getItem('userType'));
  
  const [state, setState] = useState({
    selectedJob: null,
    isModalOpen: false,
    editingJobId: null,
    formData: {},
    skills: [
      'HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'Node.js', 'React.js', 'Angular', 'Vue.js',
      'Machine Learning', 'Django', 'Spring Boot', 'C++', 'C#', 'Ruby', 'PHP',
      'Flask', 'Bootstrap', 'MySQL', 'TypeScript', 'Go', 'Rust', 'Kotlin',
      'SQL', 'Shell Scripting', 'VB.NET', 'MATLAB', 'R', 'AWS', 'DevOps',
      'Hibernate', 'Spring', 'JSP', 'Servlets'
    ],
    branches: [
      'CSE', 'ISE', 'IT', 'ECE', 'EEE', 'CIVIL', 'MECH', 'AIML', 'AIDS',
      'CSD', 'MBA', 'MTECH CSE', 'IoT', 'BBA', 'BCA', 'BSC', 'MCA', 'MSC'
    ],
    years: Array.from({ length: 10 }, (_, index) => 2015 + index), // Generate years 2015-2024
    currentSkill: '',
    customSkill: '',
    selectedSkills: [],
    currentYear: '',
    selectedYears: [],
    currentBranch: '',
    customBranch: '',
    selectedBranches: [],
    isUpdated: false,
    errors: {
      branchError: '',
      yearsError: '',
      technologiesError: '',
    },
  });

  const setField = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleEditClick = (selectedJob) => {
    const jobToEdit = jobs.find((job) => job.job_id === selectedJob.job_id);
    if (jobToEdit) {
      setState((prevState) => ({
        ...prevState,
        editingJobId: jobToEdit.job_id,
        selectedSkills: jobToEdit.technologies || [],
        selectedBranches: jobToEdit.department || [],
        selectedYears: jobToEdit.graduates,
        formData: {
          jobRole: jobToEdit.jobRole,
          companyName: jobToEdit.companyName,
          salary: jobToEdit.salary,
          graduates: jobToEdit.graduates.join(', '),
          educationQualification: jobToEdit.educationQualification,
          department: jobToEdit.department.join(', '),
          percentage: parseInt(jobToEdit.percentage, 10),
          technologies: jobToEdit.technologies.join(', '),
          jobLocation: jobToEdit.jobLocation,
          specialNote: jobToEdit.specialNote,
          bond: parseInt(jobToEdit.bond, 10),
        },
      }));
    }
  };

  const setError = (errorField, message) => {
    setState((prevState) => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [errorField]: message,
      },
    }));
  };

  const addBranch = () => {
    if (!state.currentBranch && !state.customBranch) {
      setError('branchError', 'Please select a branch.');
      return;
    }

    const newBranch = state.currentBranch === 'Other' ? state.customBranch : state.currentBranch;

    if (state.selectedBranches.includes(newBranch)) {
      setError('branchError', 'This branch is already added.');
      return;
    }

    setField('selectedBranches', [...state.selectedBranches, newBranch]);
    setField('currentBranch', '');
    setField('customBranch', '');
    setError('branchError', '');
  };

  const removeBranch = (branch) => {
    setField('selectedBranches', state.selectedBranches.filter((b) => b !== branch));
  };

  const addYear = () => {
    if (!state.currentYear) {
      setError('yearsError', 'Please select a year.');
      return;
    }

    if (state.selectedYears.includes(state.currentYear)) {
      setError('yearsError', 'This year is already added.');
      return;
    }

    setField('selectedYears', [...state.selectedYears, state.currentYear]);
    setField('currentYear', '');
    setError('yearsError', '');
  };

  const removeYear = (year) => {
    setField('selectedYears', state.selectedYears.filter((y) => y !== year));
  };

  const addSkill = () => {
    if (!state.currentSkill && !state.customSkill) {
      setError('technologiesError', 'Please select or enter a skill.');
      return;
    }

    const newSkill = state.currentSkill === 'Other' ? state.customSkill : state.currentSkill;

    if (state.selectedSkills.includes(newSkill)) {
      setError('technologiesError', 'This skill is already added.');
      return;
    }

    setField('selectedSkills', [...state.selectedSkills, newSkill]);
    setField('currentSkill', '');
    setField('customSkill', '');
    setError('technologiesError', '');
  };

  const removeSkill = (skill) => {
    setField('selectedSkills', state.selectedSkills.filter((s) => s !== skill));
  };

  const openModal = (job) => {
    setState((prevState) => ({
      ...prevState,
      selectedJob: job,
      isModalOpen: true,
    }));
  };

  const applyCancel = () => {
    setState((prevState) => ({
      ...prevState,
      editingJobId: null,
      isModalOpen: false,
      formData: {},
      selectedJob: null,
      selectedBranches: [],
      selectedSkills: [],
      selectedYears: [],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setField('formData', {
      ...state.formData,
      [name]: value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const updatedJob = {
      job_id: state.editingJobId,
      jobRole: state.formData.jobRole,
      companyName: state.formData.companyName,
      salary: state.formData.salary,
      graduates: state.selectedYears,
      educationQualification: state.formData.educationQualification,
      department: state.selectedBranches,
      percentage: state.formData.percentage,
      jobSkills: state.selectedSkills,
      jobLocation: state.formData.jobLocation,
      specialNote: state.formData.specialNote,
      bond: state.formData.bond,
    };

    try {
      setState((prevState) => ({
        ...prevState,
        isUpdated: true,
      }));
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/editjob`,
        updatedJob
      );

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Job Updated Successfully',
          showConfirmButton: false,
          timer: 3000,
        });
        setState((prevState) => ({
          ...prevState,
          isUpdated: false,
        }));
        fetchJobs();
        setField('editingJobId', null);
        setField('isModalOpen', false);
        setField('formData', {});
      }
    } catch (error) {
      setError('error', error.response?.data?.message || 'Failed to update job details');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'This job is not active. You cannot apply.',
      });
    }
  };

  const closeModal = () => {
    setState((prevState) => ({
      ...prevState,
      isModalOpen: false,
      selectedJob: null,
    }));
  };

  const handleCurrentSkill = (e) => {
    const value = e.target.value;
    setState((prevState) => ({
      ...prevState,
      currentSkill: value,
      errors: { ...prevState.errors, technologiesError: '' },
    }));
  };

  const handleCustomSkill = (e) => {
    const value = e.target.value;
    setState((prevState) => ({
      ...prevState,
      customSkill: value,
      errors: { ...prevState.errors, technologiesError: '' },
    }));
  };

  const handleCustomBranch = (e) => {
    const value = e.target.value;
    setState((prevState) => ({
      ...prevState,
      customBranch: value,
      errors: { ...prevState.errors, branchError: '' },
    }));
  };

  const handleCurrentBranch = (e) => {
    const value = e.target.value;
    setState((prevState) => ({
      ...prevState,
      currentBranch: value,
      errors: { ...prevState.errors, branchError: '' },
    }));
  };

  const handleChangeYear = (e) => {
    const value = e.target.value;
    setState((prevState) => ({
      ...prevState,
      currentYear: value,
      errors: { ...prevState.errors, yearsError: '' },
    }));
  };

  // ------------------- Pagination for Job Cards -------------------
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div className="bde-dashboard mt-0">
      <h1 className="bde-head">Manage Jobs Dashboard</h1>
      {error && <p className="bde-error">{error}</p>}
      {state.editingJobId ? (
        <div className="job-edit-form">
          <h3 className="form-title">Edit Job</h3>
          <form className="job-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label">Job Role:</label>
              <input
                className="form-input"
                type="text"
                name="jobRole"
                value={state.formData.jobRole || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">company:</label>
              <input
                className="form-input"
                type="text"
                name="companyName"
                value={state.formData.companyName || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Salary:</label>
              <input
                className="form-input"
                type="text"
                name="salary"
                value={state.formData.salary || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Graduate:</label>
              <div className="years-container">
                <select
                  id="years"
                  name="years"
                  value={state.currentYear}
                  onChange={handleChangeYear}
                  className="form-input select"
                >
                  <option value="">Select a year</option>
                  {state.years.map((year, index) => (
                    <option key={index} value={year} className="skill-option">
                      {year}
                    </option>
                  ))}
                </select>
                {state.errors.yearsError && (
                  <p className="error-message">{state.errors.yearsError}</p>
                )}
                <button type="button" className="add-year-btn" onClick={addYear}>
                  Add Year
                </button>
              </div>
              <div className="selected-years">
                {state.selectedYears.map((year, index) => (
                  <p key={index} className="selected-year">
                    {year}
                    <button
                      type="button"
                      className="remove-year-btn"
                      onClick={() => removeYear(year)}
                    >
                      X
                    </button>
                  </p>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Education Qualification:</label>
              <input
                className="form-input"
                type="text"
                name="educationQualification"
                value={state.formData.educationQualification || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="branch" className="form-label">Branch/Stream</label>
              <div className="skills-container">
                <select
                  id="branch"
                  name="branch"
                  value={state.currentBranch}
                  onChange={handleCurrentBranch}
                  className="form-input select"
                >
                  <option value="">Select a Branch</option>
                  {state.branches.map((branch, index) => (
                    <option className="skill-option" key={index} value={branch}>
                      {branch}
                    </option>
                  ))}
                  <option value="Other" className="other">
                    Other
                  </option>
                </select>
                {state.currentBranch === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom Branch"
                    value={state.customBranch}
                    onChange={handleCustomBranch}
                    className="form-input select"
                  />
                )}
                {state.errors.branchError && (
                  <p className="error-message">{state.errors.branchError}</p>
                )}
                <button type="button" className="add-skill-btn" onClick={addBranch}>
                  Add Branch
                </button>
              </div>
              <div className="selected-skills">
                {state.selectedBranches.map((skill, index) => (
                  <p key={index} className="selected-skill">
                    {skill}
                    <button
                      type="button"
                      className="remove-skill-btn"
                      onClick={() => removeBranch(skill)}
                    >
                      X
                    </button>
                  </p>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Percentage Criteria:</label>
              <input
                className="form-input"
                type="number"
                name="percentage"
                value={state.formData.percentage}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="skills" className="form-label">Skills</label>
              <div className="skills-container">
                <select
                  id="skills"
                  name="skills"
                  value={state.currentSkill}
                  onChange={handleCurrentSkill}
                  className="form-input select"
                >
                  <option value="">Select a skill</option>
                  {state.skills.map((skill, index) => (
                    <option className="skill-option" key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                  <option value="Other" className="other">
                    Other
                  </option>
                </select>
                {state.currentSkill === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom skill"
                    value={state.customSkill}
                    onChange={handleCustomSkill}
                    className="form-input select"
                  />
                )}
                {state.errors.technologiesError && (
                  <p className="error-message">{state.errors.technologiesError}</p>
                )}
                <button type="button" className="add-skill-btn" onClick={addSkill}>
                  Add Skill
                </button>
              </div>
              <div className="selected-skills">
                {state.selectedSkills.map((skill, index) => (
                  <p key={index} className="selected-skill">
                    {skill}
                    <button
                      type="button"
                      className="remove-skill-btn"
                      onClick={() => removeSkill(skill)}
                    >
                      X
                    </button>
                  </p>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Job Location:</label>
              <input
                className="form-input"
                type="text"
                name="jobLocation"
                value={state.formData.jobLocation || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Special Note:</label>
              <textarea
                className="form-textarea"
                name="specialNote"
                value={state.formData.specialNote || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bond (in years):</label>
              <input
                className="form-input"
                type="number"
                name="bond"
                value={state.formData.bond}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={state.isUpdated}>
                {state.isUpdated ? 'updating...' : 'update Job'}
              </button>
              <button type="button" onClick={() => applyCancel()} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {jobs.length < 1 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-3xl text-blue-500 font-semibold text-center">
                There are no active jobs
              </p>
            </div>
          ) : (
            <>
              <div className="job-grid">
                {currentJobs.map((job) => (
                  <div
                    key={job.job_id}
                    className={`job-card ${!job.isActive ? 'job-card-closed' : ''}`}
                    onClick={() => openModal(job)}
                  >
                    <div className="job-card-header">
                      <h1 className="job-card-title">{job.jobRole}</h1>
                      <p className="job-card-company">{job.companyName}</p>
                    </div>
                    <div className="job-card-details">
                      <p className="job-card-info">
                        <span>CTC:</span>{" "}
                        {job.salary.includes('LPA') ? job.salary : `${job.salary} LPA`}
                      </p>
                      <p className="job-card-info">
                        <span>Location:</span> {job.jobLocation}
                      </p>
                      <p className="job-card-description">{job.description}</p>
                      <div className="job-card-tags">
                        {job.technologies.map((tech, index) => (
                          <span key={index} className="job-card-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <button onClick={() => openModal(job)} className="view-button">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination-container">
                  <Stack spacing={2} className="flex justify-center mt-4">
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      variant="outlined"
                      shape="rounded"
                    />
                  </Stack>
                </div>
              )}
            </>
          )}
          {state.isModalOpen && state.selectedJob && (
            <div className="job-modal-overlay">
              <div className="job-modal-bde">
                <button className="job-modal-close" onClick={closeModal}>
                  &times;
                </button>
                <h2 className="job-modal-title">{state.selectedJob.jobRole}</h2>
                <p className="job-modal-info">
                  <strong className="strong">Company:</strong> {state.selectedJob.companyName}
                </p>
                <p className="job-modal-info">
                  <strong className="strong">Salary:</strong>{" "}
                  {state.selectedJob.salary.includes('LPA')
                    ? state.selectedJob.salary
                    : `${state.selectedJob.salary} LPA`}
                </p>
                <p className="job-modal-info">
                  <strong className="strong">Location:</strong> {state.selectedJob.jobLocation}
                </p>
                <p className="job-modal-info">
                  <strong className="strong">Percentage:</strong> {state.selectedJob.percentage}%
                </p>
                <p className="job-modal-info">
                  <strong className="strong">Bond:</strong>{" "}
                  {state.selectedJob.bond > 1
                    ? `${state.selectedJob.bond} years`
                    : `${state.selectedJob.bond} year`}
                </p>
                <p className="job-modal-info">
                  <strong className="strong">Branch:</strong>{" "}
                  {state.selectedJob.department.join(', ')}
                </p>
                <p className="job-modal-info">
                  <strong className="strong">Qualification:</strong>{" "}
                  {state.selectedJob.educationQualification}
                </p>
                <p className="job-modal-info">
                  <strong className="strong">Graduate Level:</strong>{" "}
                  {state.selectedJob.graduates.join(', ')}
                </p>
                <div className="job-modal-tags">
                  {state.selectedJob.technologies.map((tech, index) => (
                    <span key={index} className="job-modal-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                {state.selectedJob.specialNote && (
                  <div className="job-modal-special-note">
                    <h3>Special Note</h3>
                    <p>{state.selectedJob.specialNote}</p>
                  </div>
                )}
                {userType === 'Manager' ? '' : (
                  <div className="btns">
                    <Link
                      to={`/bdestudentsappliedjoblist/${state.selectedJob.job_id}`}
                      className="applied-students-list"
                    >
                      Applied Students
                    </Link>
                    <button className="edit-btn" onClick={() => handleEditClick(state.selectedJob)}>
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BDEDashboard;
