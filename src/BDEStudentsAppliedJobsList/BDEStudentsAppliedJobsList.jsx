import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './BDEStudentsAppliedJobsList.css';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';  
import { writeFile, utils } from 'xlsx';
import MultipleSelect from './MultipleSelect';
import SkillsSelect from './SkillsSelect';
import { useStudentsApplyData } from '../contexts/StudentsApplyContext';

const BDEStudentsAppliedJobsList = () => {
  const { jobId } = useParams();
  const {
    appliedStudents,
    jobSkills,
    selectedStudents,
    rejectedStudents,
    resumeName,
    excelName,
    loading,
    fetchAppliedStudents,
  } = useStudentsApplyData();

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedPercentage, setSelectedPercentage] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { book_new, book_append_sheet, json_to_sheet } = utils;


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchAppliedStudents(jobId);
      setIsLoading(false);
    };
    fetchData();
  }, [jobId, fetchAppliedStudents]);

  const handleDepartmentChange = (event) => {
    const { target: { value } } = event;
    setSelectedDepartments(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSkillChange = (event) => {
    const { target: { value } } = event;
    setSelectedSkills(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const filteredStudents = appliedStudents.filter(student => {
    const departmentMatch =
      selectedDepartments.length === 0 || selectedDepartments.includes(student.department);

    const percentageMatch =
      !selectedPercentage ||
      parseInt(student.highestGraduationpercentage) >= parseInt(selectedPercentage);

    const skillMatch =
      selectedSkills.length === 0 ||
      selectedSkills.some(skill => student.studentSkills?.includes(skill));

    return departmentMatch && percentageMatch && skillMatch;
  });


  const downloadResume = async () => {
    try {
      const selectedStudentIds = filteredStudents.map(student => student.student_id);
      const loadingSwal = Swal.fire({
        title: 'Downloading Resumes',
        html: 'Please wait...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/downloadresume`, {
        student_ids: selectedStudentIds
      }, {
        responseType: 'blob'
      });
      loadingSwal.close();
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resumeName}.zip`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to download resumes. Please check the selected list',
      });
    }
  };


  const downloadExcel = () => {
    const formattedStudents = filteredStudents.map(student => ({
      ...student,
      studentSkills: student.studentSkills.join(', '),
    }));

    const workbook = book_new();
    const worksheet = json_to_sheet(formattedStudents);
    book_append_sheet(workbook, worksheet, 'Students');
    writeFile(workbook, `${excelName}.xlsx`);
  };

  // Function to accept selected students and update their status
  const acceptSelectedStudents = async () => {
    const result = await Swal.fire({
      title: 'Confirm Acceptance',
      text: 'Are you sure you want to accept the selected students?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Accept',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        const selectedStudentIds = filteredStudents.map(student => student.id);
        if (selectedStudentIds.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No students selected. Please check the selected list',
          });
          return;
        }
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/updatejobapplicants`, {
          selected_student_ids: selectedStudentIds, job_id: jobId
        });
        if (response.status === 200) {
          Swal.fire({
            title: "Accepted these selected students",
            icon: "success"
          });
          fetchAppliedStudents(jobId);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to accept selected students',
        });
      }
    }
  };

  return (
    <div className='students-jobs-list'>
      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <h2 style={{ textAlign: 'center' }}>
            <span className='text-2xl font-semibold'> Students Applied for Job </span>
            <div className='btn-parent'>
              <button className='btn-excel' onClick={downloadExcel}>Download Excel</button>
              <button className='resume-download' onClick={downloadResume}>Get the Resumes</button>
              <button onClick={acceptSelectedStudents} className='btn-accept-job-students'>Accept the selected students</button>
            </div>
          </h2>

          <div className='filter-list'>
            <MultipleSelect
              selectedDepartments={selectedDepartments}
              handleChange={handleDepartmentChange}
            />
            <div>
              <select
                className='percentage'
                value={selectedPercentage}
                onChange={(e) => setSelectedPercentage(e.target.value)}
              >
                <option value="">Minimum Percentage</option>
                {[...Array(10)].map((_, index) => {
                  const value = 50 + index * 5;
                  return <option key={value} value={value}>{value}%</option>;
                })}
              </select>
            </div>
            <SkillsSelect
              jobSkills={jobSkills}
              selectedSkills={selectedSkills}
              handleChange={handleSkillChange}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ color: "white" }}>Applied Students ({filteredStudents.length})</th>
                <th style={{ color: "white" }}>Selected Students ({selectedStudents.length})</th>
                <th style={{ color: "white" }}>Rejected Students ({rejectedStudents.length})</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3">Loading...</td></tr>
              ) : (
                filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <tr key={student.student_id}>
                      <td>
                        {student.name}<br />
                        {student.email}
                      </td>
                      <td>{selectedStudents.includes(student.student_id) ? 'Selected' : ''}</td>
                      <td>{rejectedStudents.includes(student.student_id) ? 'Rejected' : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No students have applied for this job.</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default BDEStudentsAppliedJobsList;
