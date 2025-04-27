import React from "react";
import CountdownTimer from "./CountdownTimer";
import NumberedNavigation from "./NumberedNavigation";

export const NavigationCoding = ({ safeSubmit }) => {
  return (
    <div className="rounded-xl flex flex-col mr-2 w-full md:w-auto">
      <CountdownTimer safeSubmit={safeSubmit} />
      <NumberedNavigation />
    </div>
  );
};


