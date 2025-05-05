import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export const FlagsContext = createContext();

export const FlagsProvider = ({ children }) => {
  const location = useLocation();
  const [flags, setFlags] = useState({
    flagcodePlayground: false, // Default value
  });
  const [codePlaygroundStatus, setCodePlaygroundStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Fetch feature flags from backend
  const fetchFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/flags");
      setFlags((prev) => {
        if (prev.flagcodePlayground !== data.flagcodePlayground) {
          setCodePlaygroundStatus(data.flagcodePlayground);
          return { flagcodePlayground: data.flagcodePlayground };
        }
        return prev;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update a single flag
  const updateFlag = async (flagKey, enabled) => {
    try {
      const { data } = await api.post(`/flags/${flagKey}`, { enabled });
      setFlags((prev) => ({
        ...prev,
        [flagKey]: data.enabled ?? enabled,
      }));
      if (flagKey === "flagcodePlayground") {
        setCodePlaygroundStatus(data.enabled ?? enabled);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchFlags();
  }, []);

  // Refetch whenever navigation occurs
  useEffect(() => {
    fetchFlags();
  }, [location]);

  return (
    <FlagsContext.Provider
      value={{ flags, codePlaygroundStatus, loading, error, updateFlag }}
    >
      {children}
    </FlagsContext.Provider>
  );
};
