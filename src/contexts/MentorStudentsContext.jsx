import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { decryptData } from '../../cryptoUtils.jsx';

const MentorStudentsContext = createContext();

export const useStudentsMentorData = () => useContext(MentorStudentsContext);

export const StudentsMentorProvider = ({ children }) => {
  const [studentsList, setStudentsList] = useState([]);
  const [mentorData, setMentorData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 const location = decryptData(sessionStorage.getItem("location"))

  const fetchMentorStudents = useCallback(async (selectedBatch) => {
    setLoading(true);
    setError(null);

    try {
      const  mentorId= decryptData(sessionStorage.getItem('Mentors'));

      if (!mentorId) {
        throw new Error('Mentor ID is missing in local storage.');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorstds`,
        { params: { location, mentorId: mentorId,batch:selectedBatch } }
      );


      setMentorData(response.data.mentor_data[0] || {});
      setScheduleData(response.data.schedule_data || []);
      setStudentsList(response.data.student_data || []);
      setClasses(response.data.classes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  }, [location]);



  const contextValue = useMemo(
    () => ({
      mentorData,
      scheduleData,
      classes,
      studentsList,
      loading,
      error,
      fetchMentorStudents,
    }),
    [mentorData, scheduleData, studentsList, loading, error, fetchMentorStudents, classes]
  );

  return (
    <MentorStudentsContext.Provider value={contextValue}>
      {children}
    </MentorStudentsContext.Provider>
  );
};
