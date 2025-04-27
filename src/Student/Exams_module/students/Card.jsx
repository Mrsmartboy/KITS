import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div
      className={`rounded-lg ${className} w-full sm:w-80`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => (
  <div className="bg-[#19216F] text-white font-semibold text-xl p-1 rounded-t-lg">
    {children}
  </div>
);

export const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold mx-4 my-2">{children}</h3>
);

export const CardContent = ({ children }) => <div>{children}</div>;
