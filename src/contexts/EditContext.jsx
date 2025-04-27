import React, { createContext, useState, useContext } from 'react';

// Create the context
const EditContext = createContext();

// Create a provider component
export const EditProvider = ({ children }) => {
  const [edit, setEdit] = useState(false);
  return (
    <EditContext.Provider value={{ edit, setEdit }}> 
      {children}
    </EditContext.Provider>
  );
};

// Custom hook for easier access to the context
export const useEdit = () => useContext(EditContext);
