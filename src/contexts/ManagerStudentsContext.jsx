import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const ManagerStudentsContext = createContext();

export const useStudentsManageData = () => {
  return useContext(ManagerStudentsContext);
};

export const StudentsManageProvider = ({ children }) => {
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized function to fetch students list
  const fetchManageStudents = useCallback(async (location) => { 
    if (studentsList.length > 0) return; // Prevent unnecessary fetches
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/stdlocations`, {
        params: { location }, // Use stored location
      });

      setStudentsList(response.data);
    } catch (err) {
      setError('Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  }, [ studentsList.length]); // Re-fetch only when location changes

  // useEffect(() => {
  //   if (studentsList.length >0) fetchManageStudents();
  // }, [fetchManageStudents, studentsList.length]); // Prevents redundant API calls

  // Memoized context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({ studentsList, loading, error, fetchManageStudents }),
    [studentsList, loading, error, fetchManageStudents]
  );

  return (
    <ManagerStudentsContext.Provider value={contextValue}>
      {children}
    </ManagerStudentsContext.Provider>
  );
};
