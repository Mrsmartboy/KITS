import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaPlusSquare,
  FaLayerGroup,
  FaSearch,
  FaUsers,
  FaSchool,
  FaBook,
  FaChartBar,
  FaBriefcase,
  FaChalkboardTeacher,
  FaBookOpen,
  FaTachometerAlt,
  FaUserCheck,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { FaGears } from "react-icons/fa6";
import { FlagsContext } from "../contexts/FlagsContext.jsx";

import { useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useStudent } from "../contexts/StudentProfileContext";
import { decryptData } from "../../cryptoUtils.jsx";
import { CourseIcon } from "../Icons/StudentsIcons.jsx";
import { ExamReportsIcon } from "../Icons/StudentsIcons.jsx";
import { CodePlayGroundIcon } from "../Icons/StudentsIcons.jsx";
import { JobsListIcon } from "../Icons/StudentsIcons.jsx";
import { MockInterviewIcon } from "../Icons/StudentsIcons.jsx";
import { ProfileIcon } from "../Icons/StudentsIcons.jsx";
import { ExamIcon } from "../Icons/StudentsIcons.jsx";
import { LeaveRequestIcon } from "../Icons/StudentsIcons.jsx";

import {
  BatchScheduleIcon,
  CreateBatchIcon,
  ManageJobLIstIcon,
  ScheduleExamIcon,
  StudentAttendanceIcon,
  StudentDataLogoIcon,
  StudentEnrollmentIcon,
  ManagerDashboardIcon,
  ScheduleListIcon,
  StudentDataIcon,
  StudentsPerformance,
} from "../Icons/ManagerIcons.jsx";

import {
  MentorDashboardIcon,
  CoursesIcon,
  AttendanceIcon,
  StudentListIcon,
  MentorStudentDataIcon,
  TestCaseCompilerIcon,
  StudentPerformanceIcon,
} from "../Icons/MentorIcons.jsx";
import { Upload } from "lucide-react";
import { faGear } from "@fortawesome/free-solid-svg-icons";

export const SidebarV = ({
  isCollapsed,
  setIsCollapsed,
  setIsAuthenticated,
  setIsMobileMenuOpen,
  isMobileMenuOpen,
  isMobileView,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { codePlaygroundStatus, loading } = useContext(FlagsContext);
  // --- 1) Use our context to get student info + pic
  const { studentDetails, profilePicture } = useStudent();

  //  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const userType = decryptData(sessionStorage.getItem("userType"));
  const profileStatus = sessionStorage.getItem("profileStatus");

  const handleNavigation = (path) => {
    const restrictedPaths = [
      "/jobslist",
      "/courses",
      "/exam-dashboard",
      "/exam-repors",
      "/exam-reports-dashboard",
      "/mock-interviews",
      "/leave-request-page",
    ];
    if (profileStatus === "false" && restrictedPaths.includes(path)) {
      Swal.fire({
        title: "Profile Incomplete!",
        text: "Please update your profile first to access this feature.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const roleDisplayNames = {
    student_login_details: "STUDENT",
    Mentors: "MENTOR",
    BDE_data: "BDE",
    Manager: "MANAGER",
    admin: "ADMIN",
    superAdmin: "ADMIN",
  };

  // 3) We no longer need local fetchProfilePicture or effect,
  //    because the context handles that.

  // We do create a local "userProfile" object for convenience
  const userProfile = {
    avatarUrl: profilePicture,
    name: studentDetails?.name,
    id: studentDetails?.studentId,
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setIsLoggedOut(true);
    navigate("/", { replace: true });
  };

  const getMenuItems = (userType, handleLogout) => {
    switch (userType) {
      case "student_login_details":
        const studentItems = [
          { label: "Profile", path: "/student-profile", icon: ProfileIcon },
          { label: "Exams", path: "/exam-dashboard", icon: ExamIcon },
          {
            label: "Exam Reports",
            path: "/daily-exam-reports",
            icon: ExamReportsIcon,
          },
          {
            label: "Mock Interviews",
            path: "/mock-interviews",
            icon: MockInterviewIcon,
          },
          { label: "Leaderboard", path: "/leaderboard", icon: FaChartBar },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
        if (codePlaygroundStatus) {
          studentItems.splice(4, 0, {
            label: "Code Playground",
            path: "/code-playground",
            icon: CodePlayGroundIcon,
          });
        }
        return studentItems;
      case "super":
        return [
          {
            label: "Dashboards",
            items: [
              {
                label: "Admin Dashboard",
                path: "/admin-dashboard",
                icon: FaChartBar,
              },
              {
                label: "Manage Dashboard",
                path: "/manager-dashboard",
                icon: FaTachometerAlt,
              },
            ],
          },
          {
            label: "Students",
            items: [
              {
                label: "Students List",
                path: "/studentslist",
                icon: FaUsers,
              },
              {
                label: "Student Enrollment",
                path: "/student-enroll",
                icon: StudentEnrollmentIcon,
              },
              {
                label: "Student Attendance",
                path: "/studentattendance",
                icon: StudentAttendanceIcon,
              },
              {
                label: "Students Performance",
                path: "/students-performance-manager",
                icon: StudentPerformanceIcon,
              },
              {
                label: "Student Search",
                path: "/studentsearch",
                icon: FaSearch,
              },
            ],
          },
          {
            label: "Exams",
            items: [
              {
                label: "Exam Statistics",
                path: "/exam-statistics",
                icon: FaChartBar,
              },
            ],
          },
          {
            label: "Code Playground",
            items: [
              {
                label: "Leaderboard",
                path: "/manageleaderboard",
                icon: FaChartBar,
              },
            ],
          },
          {
            label: "Feature's Settings",
            path: "/feature-flags",
            icon: FaGears,
          },
          {
            label: "Logout",
            action: handleLogout,
            icon: FaSignOutAlt,
          },
        ];

      case "Testers":
        return [
          {
            label: "Testing Questions",
            path: "/testing",
            icon: FaChartBar,
          },

          // { label: "Test Upload", path: "/test-upload", icon: FaBook },
          { label: "Create Questions", path: "/test-upload-new", icon: FaBook },

          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];

      case "superAdmin":
        return [
          {
            label: "Dashboards",
            items: [
              {
                label: "Admin Dashboard",
                path: "/admin-dashboard",
                icon: FaChartBar,
              },
              {
                label: "Manage Dashboard",
                path: "/manager-dashboard",
                icon: FaTachometerAlt,
              },
            ],
          },
          {
            label: "Management",
            items: [
              {
                label: "Mentors",
                path: "/mentors",
                icon: FaChalkboardTeacher,
              },
              {
                label: "Program Managers",
                path: "/program-managers",
                icon: FaSchool,
              },
            ],
          },
          {
            label: "Students",
            items: [
              {
                label: "Students List",
                path: "/studentslist",
                icon: FaUsers,
              },
              {
                label: "Student Enrollment",
                path: "/student-enroll",
                icon: StudentEnrollmentIcon,
              },
              {
                label: "Student Attendance",
                path: "/studentattendance",
                icon: StudentAttendanceIcon,
              },
              {
                label: "Students Performance",
                path: "/students-performance-manager",
                icon: StudentPerformanceIcon,
              },
              {
                label: "Leaderboard",
                path: "/manageleaderboard",
                icon: FaChartBar,
              },
              {
                label: "Student Search",
                path: "/studentsearch",
                icon: FaSearch,
              },
            ],
          },
          {
            label: "Exams",
            items: [
              {
                label: "Exam Statistics",
                path: "/exam-statistics",
                icon: FaChartBar,
              },
            ],
          },
          {
            label: "Curriculum",
            path: "/curriculum",
            icon: FaBookOpen,
          },
          {
            label: "Logout",
            action: handleLogout,
            icon: FaSignOutAlt,
          },
        ];

      case "Mentors":
        return [
          {
            label: "Mentor Dashboard",
            path: "/mentor-dashboard",
            icon: MentorDashboardIcon,
          },
          { label: "Courses", path: "/course", icon: CoursesIcon },
          { label: "Attendance", path: "/attendance", icon: AttendanceIcon },
          {
            label: "Student List",
            path: "/mentorstudentslist",
            icon: StudentListIcon,
          },
          {
            label: "Student Data",
            path: "/studentdata",
            icon: MentorStudentDataIcon,
          },
          {
            label: "Leaderboard",
            path: "/mentor-leaderboard",
            icon: FaChartBar,
          },

          {
            label: "Students Performance",
            path: "/students-performance-mentor",
            icon: StudentPerformanceIcon,
          },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      case "Manager":
        return [
          {
            label: "Manager Dashboard",
            path: "/manager-dashboard",
            icon: ManagerDashboardIcon,
          },
          {
            label: "Students List",
            path: "/managestudentslist",
            icon: ScheduleListIcon,
          },
          {
            label: "Student Data",
            path: "/studentdata",
            icon: StudentDataIcon,
          },
          {
            label: "Leaderboard",
            path: "/manageleaderboard",
            icon: FaChartBar,
          },

          {
            label: "Exam Statistics",
            path: "/exam-statistics",
            icon: FaChartBar,
          },
          {
            label: "Student Enrollment",
            path: "/student-enroll",
            icon: StudentEnrollmentIcon,
          },
          {
            label: "Student Attendance",
            path: "/studentattendance",
            icon: StudentAttendanceIcon,
          },
          {
            label: "Batch Schedule",
            path: "/batchschedule",
            icon: BatchScheduleIcon,
          },
          {
            label: "Create Batch",
            path: "/createbatch",
            icon: CreateBatchIcon,
          },
          {
            label: "Scheduling Exam",
            path: "/create-exam",
            icon: ScheduleExamIcon,
          },
          {
            label: "Students performance",
            path: "/students-performance-manager",
            icon: StudentsPerformance,
          },
          { label: "Logout", action: handleLogout, icon: FaSignOutAlt },
        ];
      default:
        return [];
    }
  };

  const allMenuItems = getMenuItems(userType, handleLogout);
  const menuItems = allMenuItems.filter((item) => item.label !== "Logout");
  const logoutItem = allMenuItems.find((item) => item.label === "Logout");

  const isLoggedIn =
    !!decryptData(sessionStorage.getItem("userType")) && !isLoggedOut;
  if (!isLoggedIn) {
    // Not logged in => show top bar with login button
    return (
      <div hidden={location.pathname === "/subject/python"}>
        <div className="w-full h-16 bg-white flex items-center justify-between px-4">
          <img
            src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/codegnan-logo_qxnxrq.webp"
            alt="Codegnan Logo"
            className="logo cursor-pointer"
            width="150"
            height="150"
            onClick={() => navigate("/")}
          />
          <button
            className="p-1 bg-pink-500 text-white ml-1 font-serif font-medium text-md rounded-lg shadow-lg hover:bg-pink-600 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const MenuItem = ({ icon: Icon, label, path, action, items }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const isActive = location.pathname === path;
    const navigate = useNavigate();

    // Determine the color based on active and hover states
    const iconColor = isActive ? "#19216F" : isHovered ? "#19216F" : "white";

    const handleClick = () => {
      if (items) {
        // Toggle sub-menu if items exist
        setIsSubMenuOpen(!isSubMenuOpen);
      } else if (action) {
        action();
      } else {
        handleNavigation(path);
      }
    };

    return (
      <div>
        <button
          className={classNames(
            "flex items-center gap-3 px-4 py-2 my-2 text-sm font-medium rounded-md transition-colors w-full font-[inter]",
            {
              "bg-[#F4F4F4] text-[#19216F] font-semibold rounded-md": isActive,
              "text-[#ffffff] hover:bg-[#F4F4F4] hover:text-[#19216F] font-semibold":
                !isActive,
            }
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
          {Icon && <Icon color={iconColor} size={18} />}
          <span
            className={classNames({
              hidden: isCollapsed,
              block: !isCollapsed,
            })}
          >
            {label}
          </span>
          {items && !isCollapsed && (
            <span className="ml-auto">
              {isSubMenuOpen ? (
                <FaChevronUp color={iconColor} size={14} />
              ) : (
                <FaChevronDown color={iconColor} size={14} />
              )}
            </span>
          )}
        </button>
        {items && isSubMenuOpen && !isCollapsed && (
          <div className="ml-6">
            {items.map((subItem, index) => (
              <MenuItem
                key={index}
                icon={subItem.icon}
                label={subItem.label}
                path={subItem.path}
                action={subItem.action}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Sidebar */}
      {isMobileView ? (
        <div className="flex flex-col h-screen">
          {/* Sidebar */}
          <div
            className={classNames(
              "fixed inset-y-0 left-0 z-40 bg-[#19216F] text-[#ffffff] font-bold transition-all duration-300 flex flex-col h-screen overflow-y-auto font-[inter]",
              isCollapsed ? "w-16" : "w-64",
              {
                "translate-x-0": isMobileMenuOpen,
                "-translate-x-full": !isMobileMenuOpen,
              }
            )}
          >
            <button
              className="mt-4 mb-2 flex items-center justify-center text-white focus:outline-none mx-auto"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed && <FaBars size={24} />}
            </button>

            {!isCollapsed && (
              <div className="flex flex-row items-end justify-end">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className=" mr-5 mt-1 mb-2 text-white focus:outline-none font-light"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            )}

            {/* User Profile */}
            {userType === "student_login_details" && (
              <div className="flex flex-col items-center justify-center w-full pt-5 bg-[#19216F]">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className=" h-16 bg-gray-300 rounded-full" />
                )}
                <div className="mt-2 text-center">
                  <h2 className="font-medium text-base">{userProfile.name}</h2>
                  <p className="text-sm opacity-90">ID: {userProfile.id}</p>
                </div>
                <div className="w-[100%] h-[5px] bg-[#D9D9D9] mt-[12px]"></div>
              </div>
            )}

            {/* Menu Items */}
            <div className="flex-grow flex flex-col space-y-2 w-full mt-2 px-2">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  action={item.action}
                  items={item.items}
                />
              ))}
            </div>

            {/* Logout */}
            {logoutItem && (
              <div className="px-2 pb-4 mt-auto ml-4 align-bottom">
                <button
                  className="flex items-center gap-3 px-1 py-2 text-sm font-semibold rounded-md transition-colors w-full bg-[#19216F] text-white hover:bg-white hover:text-[#19216F]"
                  onClick={logoutItem.action}
                >
                  <logoutItem.icon size={18} />
                  <span
                    className={classNames({
                      hidden: isCollapsed,
                      block: !isCollapsed,
                    })}
                  >
                    {logoutItem.label}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Overlay for Mobile */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      ) : (
        // Desktop Sidebar and Main Content
        <div className="flex flex-col h-screen">
          <div className="flex flex-grow overflow-hidden relative">
            <div
              className={classNames(
                "bg-[#19216F] text-white font-bold transition-all duration-300 flex flex-col overflow-y-auto",
                isCollapsed ? "w-16" : "w-64",
                isMobileMenuOpen ? "block" : "hidden md:block"
              )}
            >
              <button
                className="mt-4 mb-2 flex items-center justify-center text-white focus:outline-none mx-auto"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed && <FaBars size={24} />}
              </button>

              {!isCollapsed && (
                <div className="flex flex-row items-end justify-end">
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className=" mr-6 mb-2 text-white focus:outline-none font-light"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
              )}

              {/* Content of the sidebar */}
              <div className="flex-grow flex flex-col justify-between h-[93%]">
                {/* User Profile - Only show when sidebar is expanded */}
                {!isCollapsed && userType === "student_login_details" && (
                  <div className="flex flex-col items-center justify-center w-full bg-[#19216F] font-[inter]">
                    {userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-full" />
                    )}
                    <div className="mt-2 text-center">
                      <h2 className="font-medium text-base">
                        {userProfile.name}
                      </h2>
                      <p className="text-sm font-medium opacity-90">
                        ID: {userProfile.id}
                      </p>
                    </div>
                    <div className="w-[100%] h-[5px] bg-[#D9D9D9] mt-[12px]"></div>
                  </div>
                )}
                {/* Menu items */}
                <div className="flex-grow flex flex-col mt-4 px-1">
                  {menuItems.map((item, idx) => (
                    <MenuItem
                      key={idx}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      action={item.action}
                      items={item.items}
                    />
                  ))}
                </div>
                {/* Logout at the bottom */}
                {logoutItem && (
                  <div className="px-2 pb-4 mt-auto align-bottom">
                    <button
                      className={classNames(
                        "flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full",
                        "bg-[#19216F] text-white hover:bg-[#F4F4F4] hover:text-[#19216F]"
                      )}
                      onClick={logoutItem.action}
                    >
                      <logoutItem.icon size={18} />
                      {!isCollapsed && <span>{logoutItem.label}</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile overlay if the sidebar is open */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black opacity-50 z-30"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
