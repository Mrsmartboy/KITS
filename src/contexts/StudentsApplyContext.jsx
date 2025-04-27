import React, { createContext,useContext, useState, useCallback,useMemo } from 'react';
import axios from 'axios';

 const StudentsApplyDataContext = createContext();

export const useStudentsApplyData = () => {
    return useContext(StudentsApplyDataContext);
};

export const StudentsApplyProvider = ({ children }) => {
    const [companyName, setCompanyName] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [appliedStudents, setAppliedStudents] = useState([]);
    const [jobSkills, setJobSkills] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [rejectedStudents, setRejectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [excelName, setExcelName] = useState('');
    const [resumeName, setResumeName] = useState('');

    const fetchAppliedStudents = useCallback(async (jobId) => {
        try {
            const resumeNameResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/getjobdetails?job_id=${jobId}`
            );
            const { companyName, jobRole } = resumeNameResponse.data;
            setCompanyName(companyName);
            setJobRole(jobRole);
            setExcelName(`${companyName}_${jobRole}`);
            setResumeName(`resumes_${companyName}_${jobRole}`);

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/getappliedstudentslist?job_id=${jobId}`
            );
            setAppliedStudents(response.data.students_applied);
            setJobSkills(response.data.jobSkills);
            setSelectedStudents(response.data.selected_students_ids);
            setRejectedStudents(response.data.rejected_students_ids);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching data:', error);
        }
    }, []);



    const contextValue = useMemo(() => ({
        companyName,
        jobRole,
        appliedStudents,
        jobSkills,
        selectedStudents,
        rejectedStudents,
        loading,
        excelName,
        resumeName,
        fetchAppliedStudents,
    }), [companyName,
        jobRole,
        appliedStudents,
        jobSkills,
        selectedStudents,
        rejectedStudents,
        loading,
        excelName,
        resumeName,
        fetchAppliedStudents,]);


    return (
        <StudentsApplyDataContext.Provider
            value={contextValue}
        >
            {children}
        </StudentsApplyDataContext.Provider>
    );
};
