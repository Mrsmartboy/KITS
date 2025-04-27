import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const UniqueBatchesContext = createContext();

export const UniqueBatchesProvider = ({ children }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false); // Set initial loading to false

  // Memoized fetch function
  const fetchBatches = useCallback(async (location) => {
    if (!location || location === "SelectLocation") {
      setBatches([]); // Clear batches if no valid location
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/batches`, {
        params: { location },
      });
      setBatches(response.data.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed since location is passed as an argument

  return (
    <UniqueBatchesContext.Provider value={{ batches, loading, fetchBatches }}>
      {children}
    </UniqueBatchesContext.Provider>
  );
};

export const useUniqueBatches = () => useContext(UniqueBatchesContext);