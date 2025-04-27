import React from "react";
import SectionSwitcher from "./SectionSwitcher";
import { McqPanel } from "./McqPanel";

export const DisplayMCQ = () => {
  return (
    <div
      className="w-full ml-2 p-4 bg-white rounded-xl shadow-[0px_4px_12px_0px_rgba(3,104,255,0.15)] overflow-y-auto "
      style={{ maxHeight: "700px" }}
    >
      <div className="max-w-xl ml-10">
        <SectionSwitcher />
      </div>
      <McqPanel />
    </div>
  );
};
