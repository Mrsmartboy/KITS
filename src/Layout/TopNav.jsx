import React, { useState } from "react";
import { FaBars, FaChevronDown, FaPowerOff } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TopNav = ({ onToggleSidebar, userProfile, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-4 bg-white text-black h-16 shadow">
      {/* Left: Hamburger & Logo */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-md bg-black text-white"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars size={20} />
        </button>
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/codegnan-logo_qxnxrq.webp"
          alt="Codegnan Logo"
          className="max-w-[150px] max-h-[50px] object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-2">
        {userProfile && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <span className="text-xl font-medium hidden sm:block">
                {userProfile.name}
              </span>
              <img
                src={userProfile.avatarUrl || "https://via.placeholder.com/32"}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <FaChevronDown />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md py-2 w-48">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  <FaPowerOff className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
