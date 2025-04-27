import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PostLogin from "./PostLogin.jsx";
import PreLogin from "./PreLogin.jsx";
import { SidebarV } from "../Student/SidebarV.jsx";
import { decryptData } from "../../cryptoUtils.jsx";
import { Outlet } from "react-router-dom";
import { useStudent } from "../contexts/StudentProfileContext.jsx";

const Layout = ({ setIsAuthenticated }) => {
  const { studentDetails, profilePicture } = useStudent();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false); // Manage mobile view here
  const isLoggedIn = !!decryptData(sessionStorage.getItem("userType"));

  // Example userProfile for top nav (replace with your context data)
  const userProfile = {
    name: studentDetails?.name || "Guest",  // Use a fallback value if studentDetails is null/undefined
    avatarUrl: profilePicture || "/path/to/default-avatar.png",  // Use a default avatar if profilePicture is not available
  };
  

  // const handleToggleSidebar = () => {
  //   setIsMobileMenuOpen(!isMobileMenuOpen);
  //   setIsSidebarCollapsed(!isSidebarCollapsed);
  // };

  const handleToggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSidebarCollapsed(false)
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setIsLoggedOut(true);
    navigate("/", { replace: true });
  };

  // Handle window resize to determine mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 800);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Call initially

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen ">
      <div className="flex flex-grow overflow-hidden">
        {isLoggedIn && (
          <div
            hidden={location.pathname === "/conduct-exam" || location.pathname === "/conduct-exam/"}
          >
            <SidebarV
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              setIsAuthenticated={setIsAuthenticated}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              isMobileView={isMobileView} // Pass to SidebarV
              setIsMobileView={setIsMobileView}
              
            />
          </div>
        )}

        <div className="flex-grow overflow-auto bg-gray-100">
          <div hidden={location.pathname === "/conduct-exam" || location.pathname === "/conduct-exam/"}>
            {isLoggedIn ? (
              <PostLogin
                onToggleSidebar={handleToggleSidebar}
                userProfile={userProfile}
                onLogout={handleLogout}
                isMobileView={isMobileView} // Pass to PostLogin
                setIsMobileView={setIsMobileView}
              />
            ) : (
              <PreLogin />
            )}
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
