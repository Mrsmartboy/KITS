import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProgramManagerSignup from "./Signup/ProgramManagerSignup/ProgramManagerSignup.jsx";
import Home from "./Home/Home.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import StudentLogin from "./Login/StudentLogin.jsx";
import Admin from "./Login/Admin.jsx";
import AddJob from "./AddJob/AddJob.jsx";
import BDEDashboard from "./BDEDashboard/BDEDashboard.jsx";
import JobsList from "./JobsList/JobsList.jsx";
import StudentsApplied from "./StudentsApplied/StudentsApplied.jsx";
import BDEStudentsAppliedJobsList from "./BDEStudentsAppliedJobsList/BDEStudentsAppliedJobsList.jsx";
import StudentsList from "./StudentsList/StudentsList.jsx";
import EmailApplyJob from "./EmailApplyJob/EmailApplyJob.jsx";
import ForgotPassword from "./ForgotPassword/ForgotPassword.jsx";
import StudentProfileUpdateVV from "./StudentProfileUpdate/StudentProfileUpdateVV.jsx";
import Bdemanagement from "./Admin/Bdemanagement.jsx";
import ProgramManagement from "./Admin/ProgramManagement.jsx";
import StudentAttendanceData from "./programManager/StudentAttendanceData.jsx";
import MentorManagement from "./Admin/MentorManagement.jsx";
import Reports from "./Admin/Reports.jsx";
import AtsUpload from "./Ats/AtsUpload.jsx";
import AtsResult from "./Ats/AtsResult.jsx";
import AttendanceSystem from "./Mentor/AttendanceSystem.jsx";
import CompilerHome from "./Compiler/CompilerHome.jsx";
import MockInterviewHome from "./MockInterview/MockInterviewHome.jsx";
import CurriculumManagement from "./programManager/CurriculumManagement.jsx";
import Course from "./Mentor/Course.jsx";
import AttendanceTable from "./Mentor/AttendanceTable.jsx";
import MainReport from "./SuperAdmin/AttendanceReport/MainReport.jsx";
import StudentCurriculum from "./Curriculam/StudentCurriculum.jsx";
import ManageStudentsList from "./programManager/ManageStudentsList.jsx";
import MentorStudentData from "./Mentor/MentorStudentData.jsx";
import BatchScheduler from "./programManager/BatchScheduler.jsx";
import BatchForm from "./programManager/BatchForm.jsx";
import StudentDashboard from "./StudentProfile/StudentDashboard.jsx";
import ViewBatch from "./programManager/ViewBatch.jsx";
import MentorDashboard from "./Mentor/MentorDashboard.jsx";
import ProgramManagerDashboard from "./programManager/ProgramManagerDashboard.jsx";
import LeaveRequest from "./programManager/LeaveRequest.jsx";
import LiveClasses from "./programManager/LiveClasses.jsx";
import InstructorCompletion from "./programManager/InstructorCompletion.jsx";
import Maincomponent from "./programManager/ManagerSearchData/Maincomponent.jsx";
import LeaveRequestPage from "./StudentProfile/LeaveRequestPage.jsx";
import ExamDashboard from "./Student/Exams_module/students/ExamModule/ExamDashboard.jsx";
import MentorBatches from "./Mentor/MentorBatches.jsx";
import EnquiryForm from "./RequestForm/EnquiryForm.jsx";
import SubjectDetails from "./Curriculam/SubjectDetails.jsx";
import { ManagerExamDashboard } from "./programManager/Exams/ManagerExamDashboard.jsx";
import { SetExam } from "./programManager/Exams/SetExam.jsx";
import { ExamAnalysis } from "./Student/Exams_module/students/ExamAnalysis/ExamAnalysis";
import UploadQuestions from "./Mentor/UploadQuestions.jsx";
import { Parent } from "./Student/Exams_module/students/ExamModule/Parent.jsx";
import { ExamProvider } from "./Student/Exams_module/students/ExamModule/ExamContext.jsx";
import { ToastContainer } from "react-toastify";
import { Dashboard } from "./programManager/Performance/Dashboard.jsx";
import DailyPerformance from "./programManager/Performance/DailyPerformance.jsx";
import CodePlayground from "./Student/Codeplayground.jsx";
import { decryptData } from "../cryptoUtils.jsx";
import TestCaseCompiler from "./Mentor/TestCaseCompiler.jsx";
import { StudentReportsProvider } from "./contexts/StudentReportsContext.jsx";
import { ReportsDashboard } from "./Student/Reports_Module/ReportsDashboard.jsx";
import DailyReports from "./Student/Reports_Module/DailyReports.jsx";
import DailyExamReport from "./programManager/Performance/DailyExamReport.jsx";
import { MentorReportsDashboard } from "./Mentor/Performance/MentorReportsDashboard.jsx";
import MentorDailyExamCards from "./Mentor/Performance/MentorDailyExamCards.jsx";
import MentorDailyExamDetails from "./Mentor/Performance/MentorDailyExamDetails.jsx";
import Layout from "./Layout/Layout.jsx";
import BatchSchedulePage from "./programManager/BatchSchedulePage.jsx";
import JobViewer from "./JobsList/JobViewer.jsx";
import TesterHome from "./Tester/TesterHome";
import CodingComponent from "./Tester/CodingComponent.jsx";
import McqComponent from "./Tester/McqComponent.jsx";
import OnlineCompiler from "./Tester/OnlineCompiler";
import UploadInternQuestions from "./Mentor/UploadInternQuestions.jsx";
import JobsListManager from "./programManager/JobsListManager.jsx";
import ExamStatistics from "./Admin/ExamStatistics.jsx";
import TesterManagement from "./Admin/TesterManagement.jsx";
import InternProgressSummary from "./Admin/InternProgressSummary.jsx";
import UploadInternQuestionsNew from "./Tester/UploadInterQuestionsNew.jsx";
import MCQForm from "./Tester/MCQForm.jsx";
import CodingForm from "./Tester/CodingForm.jsx";
import AdminReportsDashboard from "./Admin/AdminReportsDashboard.jsx";
import AdminLiveClasses from "./Admin/AdminLiveClasses.jsx";
import AdminViewBatch from "./Admin/AdminViewBatch.jsx";
import AdminStudentAttendanceData from "./Admin/AdminStudentAttendanceData.jsx";
import AdminStudentsList from "./Admin/AdminStudentsList.jsx";
import CodePractice from "./CodePlayground/CodePractice.jsx";
import SubjectTopics from "./CodePlayground/SubjectTopics.jsx";
import UploadCodePracticeQuestions from "./Mentor/UploadCodePracticeQuestions.jsx";
import SubTopics from "./CodePlayground/SubTopics.jsx";
import SubTopicQuestions from "./CodePlayground/SubTopicQuestions.jsx";
import CodePracticePlayGround from "./CodePlayground/CodePracticePlayGround.jsx";
import CPOnlineCompiler from "./CodePlayground/OnlineCompiler.jsx";
import SubjectTopicsWithSubTopics from "./CodePlayground/SubjectTopics.jsx";
import NewOnlineCompiler from "./CodePlayground/NewOnlineCompiler.jsx";
import LeaderBoard from "./Student/LeaderBoard.jsx";
import NewAttendanceSystem from "./Mentor/NewAttendanceSystem.jsx";
import ManageLeaderBoard from "./programManager/ManageLeaderBoard.jsx";
import MentorLeaderBoard from "./Mentor/MentorLeaderBoard.jsx";
import { FlagsContext } from "./contexts/FlagsContext.jsx";
import FeatureFlagManagement from "./FeatureFlagManagement.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userType = decryptData(sessionStorage.getItem("userType")); // Changed to sessionStorage

  if (!userType) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!decryptData(sessionStorage.getItem("userType")) // Changed to sessionStorage
  );
  const { codePlaygroundStatus } = useContext(FlagsContext);
  useEffect(() => {
    // Listen for changes in sessionStorage
    const checkAuth = () => {
      setIsAuthenticated(!!decryptData(sessionStorage.getItem("userType")));
    };

    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);
  return (
    <div
      style={{
        overflow: "auto",
        height: "100vh",
        backgroundColor: "#f4f4f4",
      }}
      className="no-scrollbar"
    >
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div>
        <ExamProvider>
          <Routes>
            <Route path="/newfigma" element={<NewOnlineCompiler />} />
            <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate
                      to={
                        {
                          student_login_details: "/student-profile",
                          Mentors: "/mentor-dashboard",
                          BDE_data: "/jobs-dashboard",
                          Manager: "/manager-dashboard",
                          superAdmin: "/admin-dashboard",
                          super: "/admin-dashboard",
                          Testers: "/testing",
                        }[decryptData(sessionStorage.getItem("userType"))] || // Changed to sessionStorage
                        "/not-found"
                      }
                      replace
                    />
                  ) : (
                    <Home />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate
                      to={
                        {
                          student_login_details: "/student-profile",
                          Mentors: "/mentor-dashboard",
                          BDE_data: "/jobs-dashboard",
                          Manager: "/manager-dashboard",
                          superAdmin: "/admin-dashboard",
                          super: "/admin-dashboard",
                          Testers: "/testing",
                        }[decryptData(sessionStorage.getItem("userType"))] || // Changed to sessionStorage
                        "/not-found"
                      }
                      replace
                    />
                  ) : (
                    <StudentLogin setIsAuthenticated={setIsAuthenticated} />
                  )
                }
              />
              <Route
                path="/admin"
                element={
                  isAuthenticated ? (
                    <Navigate
                      to={
                        {
                          student_login_details: "/student-profile",
                          Mentors: "/mentor-dashboard",
                          BDE_data: "/jobs-dashboard",
                          Manager: "/manager-dashboard",
                          superAdmin: "/reports",
                          super: "/admin-dashboard",
                          Testers: "/testing",
                        }[decryptData(sessionStorage.getItem("userType"))] || // Changed to sessionStorage
                        "/not-found"
                      }
                      replace
                    />
                  ) : (
                    <Admin />
                  )
                }
              />
              <Route
                path="/forgotPassword"
                element={
                  isAuthenticated ? (
                    <Navigate
                      to={
                        {
                          student_login_details: "/student-profile",
                          Mentors: "/mentor-dashboard",
                          BDE_data: "/jobs-dashboard",
                          Manager: "/manager-dashboard",
                          superAdmin: "/reports",
                          super: "/admin-dashboard",
                          Testers: "/testing",
                        }[decryptData(sessionStorage.getItem("userType"))] || // Changed to sessionStorage
                        "/not-found"
                      }
                      replace
                    />
                  ) : (
                    <ForgotPassword />
                  )
                }
              />
              <Route path="/request-form" element={<EnquiryForm />} />
              <Route
                path="/addjob"
                element={
                  <ProtectedRoute
                    allowedRoles={["BDE_data", "company", "Manager"]}
                  >
                    <AddJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager-dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <ProgramManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leave-request"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <LeaveRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-classes"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <LiveClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course-completion"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <InstructorCompletion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studentsearch"
                element={
                  <ProtectedRoute
                    allowedRoles={["super", "superAdmin", "Python", "Java"]}
                  >
                    <Maincomponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studentdata"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "BDE_data", "Mentors"]}
                  >
                    <Maincomponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/set-exam"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <SetExam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bdes"
                element={
                  <ProtectedRoute allowedRoles={["superAdmin", "super"]}>
                    <Bdemanagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentors"
                element={
                  <ProtectedRoute allowedRoles={["superAdmin", "super"]}>
                    <MentorManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testers"
                element={
                  <ProtectedRoute
                    allowedRoles={["superAdmin", "super", "Python", "Java"]}
                  >
                    <TesterManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intern-progress"
                element={
                  <ProtectedRoute allowedRoles={["superAdmin", "super"]}>
                    <InternProgressSummary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <AttendanceSystem />
                  </ProtectedRoute>
                }
              />
              <Route path="/newattendance" element={<NewAttendanceSystem />} />
              <Route
                path="/mentor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <MentorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <Course />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor-batches"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <MentorBatches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendancedata"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <AttendanceTable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor-student-reports"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <AttendanceTable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studentattendance"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "Manager",
                      "BDE_data",
                      "super",
                      "superAdmin",
                      "Python",
                      "Java",
                    ]}
                  >
                    <StudentAttendanceData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/adminstudentattendance"
                element={
                  <ProtectedRoute allowedRoles={["Python", "Java"]}>
                    <AdminStudentAttendanceData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-enroll"
                element={
                  <ProtectedRoute
                    allowedRoles={["superAdmin", "Manager", "admin", "super"]}
                  >
                    <ProgramManagerSignup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/curriculum"
                element={
                  <ProtectedRoute allowedRoles={["super", "superAdmin"]}>
                    <CurriculumManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/program-managers"
                element={
                  <ProtectedRoute allowedRoles={["superAdmin", "admin"]}>
                    <ProgramManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "superAdmin",
                      "admin",
                      "super",
                      "Python",
                      "Java",
                    ]}
                  >
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "superAdmin",
                      "admin",
                      "super",
                      "Python",
                      "Java",
                    ]}
                  >
                    <AdminReportsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-live-classes"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "superAdmin",
                      "admin",
                      "super",
                      "Python",
                      "Java",
                    ]}
                  >
                    <AdminLiveClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance-report"
                element={
                  <ProtectedRoute allowedRoles={["super", "superAdmin"]}>
                    <MainReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs-dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "BDE_data",
                      "company",
                      "Manager",
                      "super",
                      "superAdmin",
                      "Python",
                      "Java",
                    ]}
                  >
                    <BDEDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs-manager"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <JobsListManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobslist"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <JobsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job/:jobId"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <JobViewer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <StudentCurriculum />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subject/:subjectName"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <SubjectDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leave-request-page"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <LeaveRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <ExamDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/codeplayground"
                element={
                  <ProtectedRoute
                    allowedRoles={["student_login_details", "Mentors"]}
                  >
                    <CodePlayground />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conduct-exam"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <Parent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-analysis"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <ExamAnalysis />
                  </ProtectedRoute>
                }
              />
              {codePlaygroundStatus && (
                <>
                  <Route
                    path="/code-playground"
                    element={
                      <ProtectedRoute allowedRoles={["student_login_details"]}>
                        <CodePractice />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/code-playground/:subjectname"
                    element={
                      <ProtectedRoute allowedRoles={["student_login_details"]}>
                        <SubjectTopicsWithSubTopics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/code-playground/:subjectname/:topicname"
                    element={
                      <ProtectedRoute allowedRoles={["student_login_details"]}>
                        <SubTopics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cparea"
                    element={
                      <ProtectedRoute allowedRoles={["student_login_details"]}>
                        <CodePracticePlayGround />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/code-playground/solve/:questionId"
                    element={
                      <ProtectedRoute allowedRoles={["student_login_details"]}>
                        <CPOnlineCompiler />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/code-playground/:subjectname/:topicname/:subtopic"
                    element={
                      <ProtectedRoute allowedRoles={["student_login_details"]}>
                        <SubTopicQuestions />
                      </ProtectedRoute>
                    }
                  />
                </>
              )}
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <LeaderBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compiler"
                element={
                  <ProtectedRoute
                    allowedRoles={["student_login_details", "Mentors", "super"]}
                  >
                    <CompilerHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock-interviews"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <MockInterviewHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-reports-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <StudentReportsProvider>
                      <ReportsDashboard />
                    </StudentReportsProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily-exam-reports"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <StudentReportsProvider>
                      <DailyReports />
                    </StudentReportsProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studentsapplied"
                element={
                  <ProtectedRoute
                    allowedRoles={["company", "BDE_data", "Manager", "super"]}
                  >
                    <StudentsApplied />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bdestudentsappliedjoblist/:jobId"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "BDE_data",
                      "Manager",
                      "super",
                      "superAdmin",
                    ]}
                  >
                    <BDEStudentsAppliedJobsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/managestudentslist"
                element={
                  <ProtectedRoute allowedRoles={["Manager", "BDE_data"]}>
                    <ManageStudentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manageleaderboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <ManageLeaderBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor-leaderboard"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <MentorLeaderBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentorstudentslist"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <MentorStudentData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testcasecompiler"
                element={
                  <ProtectedRoute allowedRoles={["Mentors"]}>
                    <TestCaseCompiler />
                  </ProtectedRoute>
                }
              />
              <Route path="/upload" element={<UploadQuestions />} />
              <Route
                path="/uploadcpq"
                element={<UploadCodePracticeQuestions />}
              />
              {/* <Route
                path="/test-upload"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <UploadInternQuestions />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/test-upload-new"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <UploadInternQuestionsNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testing"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <TesterHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testing/coding"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <CodingComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload/mcq"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <MCQForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload/coding"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <CodingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testing/mcq"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <McqComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testing/compiler"
                element={
                  <ProtectedRoute allowedRoles={["Testers"]}>
                    <OnlineCompiler />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/batchschedule"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <BatchScheduler />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/batch-schedule"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "Manager",
                      "super",
                      "superAdmin",
                      "Python",
                      "Java",
                    ]}
                  >
                    <BatchSchedulePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/createbatch"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <BatchForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-exam"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <ManagerExamDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students-performance-manager"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students-performance-manager/daily"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <DailyExamReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-statistics"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <ExamStatistics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feature-flags"
                element={
                  <ProtectedRoute allowedRoles={["superAdmin", "super"]}>
                    <FeatureFlagManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students-performance-manager/exam-day"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <DailyPerformance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students-performance-mentor"
                element={
                  <ProtectedRoute
                    allowedRoles={["Mentors", "super", "superAdmin"]}
                  >
                    <MentorReportsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students-performance-mentor/daily"
                element={
                  <ProtectedRoute
                    allowedRoles={["Mentors", "super", "superAdmin"]}
                  >
                    <MentorDailyExamCards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students-performance-mentor/exam-day"
                element={
                  <ProtectedRoute
                    allowedRoles={["Mentors", "super", "superAdmin"]}
                  >
                    <MentorDailyExamDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/viewbatch"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager", "super", "superAdmin"]}
                  >
                    <ViewBatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-view-batch"
                element={
                  <ProtectedRoute allowedRoles={["Python", "Java"]}>
                    <AdminViewBatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-profile"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <StudentProfileUpdateVV />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ats-upload"
                element={
                  <ProtectedRoute
                    allowedRoles={["student_login_details", "super"]}
                  >
                    <AtsUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ats-result"
                element={
                  <ProtectedRoute
                    allowedRoles={["student_login_details", "super"]}
                  >
                    <AtsResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studentslist"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "BDE_data",
                      "Manager",
                      "Mentors",
                      "super",
                      "superAdmin",
                      "Python",
                      "Java",
                    ]}
                  >
                    <StudentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-students-list"
                element={
                  <ProtectedRoute allowedRoles={["Python", "Java"]}>
                    <AdminStudentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/directapply/:student_id/:job_id"
                element={
                  <ProtectedRoute allowedRoles={["student_login_details"]}>
                    <EmailApplyJob />
                  </ProtectedRoute>
                }
              />
              {/* <Route path="/not-found" element={<NotFound />} /> */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ExamProvider>
      </div>
    </div>
  );
}
