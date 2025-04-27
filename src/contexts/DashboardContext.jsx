import React, { createContext, useContext, useState, useEffect } from "react";

const DashboardContext = createContext();

export const useDashboard = () => {
  return useContext(DashboardContext);
};

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({
    companiesList: {},
    collegesList: {},
    yearOFPlacement: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/refreshdashboard`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch data from API");
      }
      const data = await response.json();

      setDashboardData({
        companiesList: data.COMPANIES || {},
        collegesList: data.COLLEGES_LIST || {},
        yearOFPlacement: data.YOP_DICT || {},
      });
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setDashboardData({
        companiesList: {},
        collegesList: {},
        yearOFPlacement: {},
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboardData, loading, error }}>
      {children}
    </DashboardContext.Provider>
  );
};
