import React, { useState } from "react";
import { FaBars, FaChevronDown, FaPowerOff } from "react-icons/fa";
import { decryptData } from "../../cryptoUtils";

const PostLogin = ({
  onToggleSidebar,
  userProfile,
  onLogout,
  isMobileView,
}) => {

  const userType = decryptData(sessionStorage.getItem("userType"));

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="w-full flex items-center justify-between px-4 bg-white text-black h-[73px] shadow font-[inter] z-50 relative">
      {/* Left: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        {isMobileView && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md bg-[#19216f] text-white"
          >
            <FaBars size={20} />
          </button>
        )}
        <div className="flex items-center ">
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/codegnan-logo_qxnxrq.webp"
          alt="Codegnan Logo"
          className="cursor-pointer h-12 sm:h-20  md:ml-10 w-24 md:w-36 " // slightly bigger
          onClick={() => navigate("/")}
        />
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1745658094/logo_s2toqb.png"
          alt="KITS Badge"
          className="cursor-pointer -mt-3 h-12 sm:h-20   md:-ml-2 w-24 md:w-36" // slightly bigger
        />

      </div>
      </div>

      {/* Right: User Info */}
      {userType === "student_login_details" && (
        <div className="flex items-center gap-3 w-full justify-end relative pr-7">
          {userProfile && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <span className="text-base sm:text-lg  font-medium hidden sm:block">
                  {userProfile.name}
                </span>
                <img
                  src={userProfile.avatarUrl || "https://via.placeholder.com/40"}
                  alt="User Avatar"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gray-300"
                />
                <FaChevronDown size={16} className="block" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md py-2 w-48 z-50">
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
      )}

      {/* Optional: Enable for manager type */}
      {/* {userType === "Manager" && <NotificationDrawer />} */}
    </nav>
  );
};

export default PostLogin;
