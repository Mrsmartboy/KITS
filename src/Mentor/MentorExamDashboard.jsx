import React, { useState, useEffect } from "react";
import ManageExams from "./ManageExams/ManageExams";
import Reports from "./Reports/MentorReports";

const MentorExamDashboard = () => {
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "manageExams"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const renderContent = () => {
    if (activeTab === "manageExams") {
      return <ManageExams />;
    }
    if (activeTab === "reports") {
      return <Reports />;
    }
    return null;
  };

  return (
    <div className="font-afacad flex flex-col min-h-screen bg-gradient-to-b from-[#dae2f2] via-[#e4edff] to-white">
      {/* Header with Navigation */}
      <header className="py-4 bg-[#ffffff] shadow-md flex flex-col items-center justify-center px-6 sm:px-10">
        <nav className="hidden sm:flex space-x-4">
          <button
            className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              activeTab === "manageExams"
                ? "bg-[#2b7eff] text-white shadow-lg"
                : "bg-[#dae2f2] text-[#002378] hover:bg-[#e4edff] hover:shadow-md"
            }`}
            onClick={() => setActiveTab("manageExams")}
          >
            Manage Exams
          </button>
          <button
            className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              activeTab === "reports"
                ? "bg-[#2b7eff] text-white shadow-lg"
                : "bg-[#dae2f2] text-[#002378] hover:bg-[#e4edff] hover:shadow-md"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
        </nav>
        {/* Mobile Menu Button */}
        <button
          className="sm:hidden block text-[#002378] focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                menuOpen
                  ? "M6 18L18 6M6 6l12 12" // X icon
                  : "M4 6h16M4 12h16M4 18h16" // Hamburger icon
              }
            />
          </svg>
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="sm:hidden bg-[#ffffff] shadow-md px-6 py-4">
          <button
            className={`block w-full text-left px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              activeTab === "home"
                ? "bg-[#2b7eff] text-white shadow-lg"
                : "bg-[#dae2f2] text-[#002378] hover:bg-[#e4edff] hover:shadow-md"
            }`}
            onClick={() => {
              setActiveTab("home");
              setMenuOpen(false);
            }}
          >
            Home
          </button>
          <button
            className={`block w-full text-left px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              activeTab === "manageExams"
                ? "bg-[#2b7eff] text-white shadow-lg"
                : "bg-[#dae2f2] text-[#002378] hover:bg-[#e4edff] hover:shadow-md"
            }`}
            onClick={() => {
              setActiveTab("manageExams");
              setMenuOpen(false);
            }}
          >
            Manage Exams
          </button>
          <button
            className={`block w-full text-left px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              activeTab === "reports"
                ? "bg-[#2b7eff] text-white shadow-lg"
                : "bg-[#dae2f2] text-[#002378] hover:bg-[#e4edff] hover:shadow-md"
            }`}
            onClick={() => {
              setActiveTab("reports");
              setMenuOpen(false);
            }}
          >
            Reports
          </button>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow p-4">{renderContent()}</main>
    </div>
  );
};

export default MentorExamDashboard;
