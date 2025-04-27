import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'
import './EmailApplyJob.css'
import { useParams } from 'react-router-dom'; // Assuming you're using React Router for routing

export default function EmailApplyJob() {
    const { student_id, job_id } = useParams(); // Fetching parameters from URL
    const [studentDetails, setStudentDetails] = useState(null);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Make a backend request using the jobId
        fetchBackendData(job_id)
        // eslint-disable-next-line
    }, [job_id]); // Only fetch when jobId changes

    // Function to fetch backend data based on jobId
    const fetchBackendData = async (job_id) => {
        try {
            const studentResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/getstudentdetails?student_id=${student_id}`);
            setStudentDetails(studentResponse.data)
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/getjobdetails?job_id=${job_id}`);
            setJobDetails(response.data)
            setLoading(false); // Set loading to false when data is fetched
        } catch (error) {
            console.error('Error fetching job details:', error);
            setLoading(false); // Set loading to false even if there's an error
        }
    };
    async function applyJob() {
       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/applyforjob`, { job_id, student_id })
            .then((response) => {
                if (response.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "Job Applied Successfully",
                        showConfirmButton: false,
                        timer: 3000
                    });
                    window.location.href = "https://www.placements.codegnan.com/"
                }
            })
            .catch((error) => {
                if (error.response.status === 400)
                    Swal.fire({
                        icon: "error",
                        title: "Already applied for the job",
                    });
            });
    }

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                jobDetails && (
                    <div className='email-apply-job'>

                        <div className="email-apply-job-card">
                            <h3>{jobDetails.companyName}</h3>
                            <p><span className="email-apply-job-key">Job Role:</span> {jobDetails.jobRole}</p>
                            <p><span className="email-apply-job-key">Salary:</span> {jobDetails.salary}</p>
                            <p><span className="email-apply-job-key">Graduate:</span> {jobDetails.graduates.join(', ')}</p>
                            <p><span className="email-apply-job-key">Education Qualification:</span> {jobDetails.educationQualification}</p>
                            <p><span className="email-apply-job-key">Branch/Stream:</span> {jobDetails.department.join(', ')}</p>
                            <p><span className="email-apply-job-key">Percentage Criteria:</span> {jobDetails.percentage}%</p>
                            <p><span className="email-apply-job-key">Eligible Technologies:</span> {jobDetails.jobSkills.join(', ')}</p>
                            <p><span className="email-apply-job-key">Bond:</span> {jobDetails.bond} years</p>
                            <p><span className="email-apply-job-key">Job Location:</span> {jobDetails.jobLocation}</p>
                            <p><span className="email-apply-job-key">Special Note:</span> {jobDetails.specialNote}</p>
                            <button className={`apply-job-list-btn ${!jobDetails.isActive ? 'disabled' : ((studentDetails && studentDetails.applied_jobs && studentDetails.applied_jobs.includes(jobDetails.id)) ? 'applied' : '')}`} onClick={() => applyJob(jobDetails.job_id)} disabled={!jobDetails.isActive}>
                                {(!jobDetails.isActive) ? 'Timeout' : ((studentDetails && studentDetails.applied_jobs && studentDetails.applied_jobs.includes(jobDetails.id)) ? 'Applied' : 'Apply')}
                            </button>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
