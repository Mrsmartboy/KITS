import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PreLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is either /login or /admin
  const hideLoginButton = location.pathname === "/login" || location.pathname.startsWith("/admin");

  return (
    <div className="fixed w-full h-16 bg-white flex items-center justify-between px-4 z-50">
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
      {!hideLoginButton && (
        <button
          className="p-1 bg-[#ED1334] text-white ml-1 font-serif font-medium text-md rounded-lg shadow-lg hover:bg-[#132EE0] hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out pr-4 pl-4"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      )}
    </div>
  );
};

export default PreLogin;
