import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PreLogin = ({ onToggleSidebar, userProfile, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is either /login or /admin
  const hideLoginButton = location.pathname === "/login" || location.pathname.startsWith("/admin");
  return (
    <div className="fixed w-full h-16 bg-white flex items-center justify-between px-4 z-50 pl-10 pr-10">
      {/* Logo Section */}
      <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate("/")}>
        <div className="flex items-center">
          <img
            src="/images/codegnan-destination.png"
            alt="Codegnan Logo"
            className="h-14 sm:h-10 w-auto object-contain align-middle"
          />
          <img
            src="/images/kits_logo.png"
            alt="KITS Logo"
            className="h-10  sm:h-10 -mt-2 ml-4 w-auto object-contain align-middle"
          />
        </div>
      </div>
  
      {/* Login Button */}
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
}  

export default PreLogin;