import React from "react";
import { useNavigate } from "react-router-dom";

const PreHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white shadow-sm px-4 md:px-6 py-2 flex justify-between items-center">
      {/* Left Logos */}

      <div className="flex items-center ">
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/codegnan-logo_qxnxrq.webp"
          alt="Codegnan Logo"
          className="cursor-pointer ml-2 md:ml-10 w-24 md:w-32" // slightly bigger
          onClick={() => navigate("/")}
        />
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1745658094/logo_s2toqb.png"
          alt="KITS Badge"
          className="cursor-pointer  md:ml-10 w-24 md:w-32" // slightly bigger
        />

      </div>

      {/* Right Links */}
      <div className="flex items-center gap-2 md:gap-4 mr-2 md:mr-10">
        <a
          href="/login"
          className="bg-[#D6002F] text-white px-3 py-1 text-sm md:px-4 md:py-1.5 md:text-lg rounded-md font-semibold"
        >
          Login
        </a>
      </div>
    </div>
  );
};

export default PreHeader;
