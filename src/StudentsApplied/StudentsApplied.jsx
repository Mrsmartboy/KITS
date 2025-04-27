import React, { useState, useEffect } from 'react';
import './StudentsApplied.css';
import axios from 'axios';
import { decryptData } from '../../cryptoUtils.jsx';

const StudentsApplied = () => {
  const [appliedJobs, setAppliedJobs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const student_id = decryptData(sessionStorage.getItem('student_id'));
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/getappliedjobslist?student_id=${student_id}`);
        setAppliedJobs(response.data.jobs_applied);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };

    fetchAppliedJobs();
  }, [student_id]);

  return loading ? (
    <p style={{color:"black"}}>Loading...</p>
  ) : (
    <div className="studentapplied-main">
      <h2>Jobs Applied by Student</h2>
      <div className="students-applied-job-container">
        {appliedJobs.map(job => (
          <div className="students-applied-job-card" key={job.job_id}>
            <h3><span className='students-applied-job-key'>Company Name:</span>{job.companyName}</h3>
            <p className="students-applied-job-key">
              Job Role: <span>{job.jobRole}</span>
            </p>
            
            <p className="students-applied-job-key">
              Package: <span>{job.salary}</span>
            </p>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsApplied;
