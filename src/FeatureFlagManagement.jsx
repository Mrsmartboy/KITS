// FeatureFlagManagement.jsx
import React, { useContext } from "react";
import { FlagsContext } from "./contexts/FlagsContext";
import { decryptData } from "../cryptoUtils";
import Swal from "sweetalert2";

const FeatureFlagManagement = () => {
  const { flags, loading, error, updateFlag } = useContext(FlagsContext);
  const userType = decryptData(sessionStorage.getItem("userType"));

  // Restrict access to superAdmin and super roles
  if (!["superAdmin", "super"].includes(userType)) {
    return <div className="p-6 text-red-600">Access Denied</div>;
  }

  if (loading) {
    return <div className="p-6">Loading feature flags...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  const handleToggleFlag = async (flagKey, currentValue) => {
    const result = await Swal.fire({
      title: `Toggle ${flagKey}?`,
      text: `Do you want to ${
        currentValue ? "disable" : "enable"
      } the ${flagKey} feature?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        await updateFlag(flagKey, !currentValue);
        Swal.fire({
          title: "Success",
          text: `${flagKey} has been ${
            !currentValue ? "enabled" : "disabled"
          }.`,
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: `Failed to update ${flagKey}: ${err.message}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Feature Flag Management</h2>

      {/* Code Playground Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-lg">Code Playground</span>
        <label
          htmlFor="toggle-code-playground"
          className="relative inline-flex items-center cursor-pointer"
        >
          {/* 1. Hidden checkbox */}
          <input
            id="toggle-code-playground"
            type="checkbox"
            className="sr-only peer"
            checked={flags.flagcodePlayground}
            onChange={() =>
              handleToggleFlag("flagcodePlayground", flags.flagcodePlayground)
            }
          />

          {/* 2. Track */}
          <div
            className="
              w-12 h-6 rounded-full
              bg-gray-300
              peer-checked:bg-blue-600
              transition-colors duration-200
            "
          />

          {/* 3. Thumb */}
          <div
            className="
              absolute left-1 top-1
              w-4 h-4 rounded-full bg-white
              transition-transform duration-200
              peer-checked:translate-x-6
            "
          />
        </label>
      </div>
    </div>
  );
};

export default FeatureFlagManagement;
