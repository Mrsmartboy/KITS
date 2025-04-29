import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostLogin from "./PostLogin.jsx";
import PreLogin from "./PreLogin.jsx";
import { SidebarV } from "../Student/SidebarV.jsx";
import { decryptData } from "../../cryptoUtils.jsx";
import { Outlet } from "react-router-dom";
import { useStudent } from "../contexts/StudentProfileContext.jsx";

const Layout = ({ setIsAuthenticated }) => {
  const { studentDetails, profilePicture } = useStudent();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const isLoggedIn = !!decryptData(sessionStorage.getItem("userType"));

  const userProfile = {
    name: studentDetails?.name || "Guest",
    avatarUrl: profilePicture || "/path/to/default-avatar.png",
  };

  const handleToggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSidebarCollapsed(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 800);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Define routes where the sidebar should be hidden
  const hideSidebarPaths = [
    "/conduct-exam",
    "/code-playground/solve/",
  ];

  // Check if the current pathname starts with any hideSidebarPaths
  const shouldHideSidebar = hideSidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="flex flex-col h-screen ">
      <div className="flex flex-grow overflow-hidden">
        {isLoggedIn && (
          <div hidden={shouldHideSidebar}>
            <SidebarV
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              setIsAuthenticated={setIsAuthenticated}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              isMobileView={isMobileView}
              setIsMobileView={setIsMobileView}
            />
          </div>
        )}

<div
  className="flex-grow overflow-auto"
  style={{
    backgroundImage: "url('/bgimage.png')",
    backgroundRepeat: "repeat",
    backgroundColor: "#EDF2FF"
  }}
>


          <div hidden={shouldHideSidebar}>
            {isLoggedIn ? (
              <PostLogin
                onToggleSidebar={handleToggleSidebar}
                userProfile={userProfile}
                onLogout={handleLogout}
                isMobileView={isMobileView}
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