import React from "react";

const Alert = ({ children, variant = "error" }) => {
  const bgColor =
    variant === "error"
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";
  return <div className={`p-3 rounded ${bgColor}`}>{children}</div>;
};

export default Alert;
