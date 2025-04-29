import React, { useState } from "react";
import { useDashboard } from "../contexts/DashboardContext";

const SuccessStories = () => {
  const { dashboardData, loading, error } = useDashboard();

  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [collegePage, setCollegePage] = useState(1);

  const companiesPerPage = 7;
  const collegesPerPage = 5;

  if (loading) {
    return <p className="text-center text-lg font-[Afacad]">Loading data...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-lg font-[Afacad] text-red-600">
        Error loading data: {error.message}
      </p>
    );
  }

  const { companiesList = {}, collegesList = {} } = dashboardData || {};

  // Filter functions from old code
  const filterCompanies = (query) =>
    Object.entries(companiesList).filter(([company]) =>
      company.toLowerCase().includes(query.toLowerCase())
    );

  const filterColleges = (query) =>
    Object.entries(collegesList).filter(([college]) =>
      college.toLowerCase().includes(query.toLowerCase())
    );

  // Pagination data
  const currentCompanies = filterCompanies(companySearchQuery).slice(
    (companyPage - 1) * companiesPerPage,
    companyPage * companiesPerPage
  );

  const currentColleges = filterColleges(collegeSearchQuery).slice(
    (collegePage - 1) * collegesPerPage,
    collegePage * collegesPerPage
  );

  const totalCompanyPages = Math.ceil(
    filterCompanies(companySearchQuery).length / companiesPerPage
  );
  const totalCollegePages = Math.ceil(
    filterColleges(collegeSearchQuery).length / collegesPerPage
  );

  // Pagination renderer from old code, adapted for Tailwind styling
  const renderPagination = (currentPage, totalPages, setPage) => {
    const visiblePages = [];

    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) {
      visiblePages.push(i);
    }

    return (
      <div className="flex justify-end px-4 mt-4 font-['Inter'] text-sm md:text-base mb-10">
        <button
          className={`flex items-center gap-1 px-2 py-1 ${
            currentPage === 1
              ? "text-[#0C1BAA] font-semibold cursor-not-allowed"
              : "hover:text-[#0C1BAA]"
          }`}
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          {"< "}Prev
        </button>

        <button
          className={`px-2 py-1 ${
            currentPage === 1
              ? "text-[#0C1BAA] font-semibold"
              : "hover:text-[#0C1BAA]"
          }`}
          onClick={() => setPage(1)}
        >
          1
        </button>

        {visiblePages[0] > 2 && <span className="px-2 py-1">...</span>}

        {visiblePages.map(
          (page) =>
            page !== 1 &&
            page !== totalPages && (
              <button
                key={page}
                className={`px-2 py-1 ${
                  page === currentPage
                    ? "text-[#0C1BAA] font-semibold"
                    : "hover:text-[#0C1BAA]"
                }`}
                onClick={() => setPage(page)}
              >
                {page}
              </button>
            )
        )}

        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
          <span className="px-2 py-1">...</span>
        )}

        {totalPages > 1 && (
          <button
            className={`px-2 py-1 ${
              currentPage === totalPages
                ? "text-[#0C1BAA] font-semibold"
                : "hover:text-[#0C1BAA]"
            }`}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </button>
        )}

        <button
          className={`flex items-center gap-1 px-2 py-1 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "hover:text-[#0C1BAA]"
          }`}
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
        >
          Next {" >"}
        </button>
      </div>
    );
  };

  return (
    <div className=" mx-auto px-10 py-8 font-[Afacad] relative bg-[#f3f4f6]">
      <h2 className="text-2xl md:text-3xl lg:text-[43px] font-semibold text-[#020031] mb-10 text-center">
        Our Students Success Stories
      </h2>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-24 min-h-[500px]">
        {/* Companies Section */}
        <div className="flex flex-col h-full">
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search Company Name..."
              className="w-full p-2 border rounded-lg"
              value={companySearchQuery}
              onChange={(e) => setCompanySearchQuery(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-[100%] mx-auto border rounded-xl">
            <table className="w-full border-collapse table-fixed shadow-[0px_4px_4px_0px_#00000040] min-h-[400px]">
              <thead>
                <tr className="bg-[#00007F] text-white">
                  <th className="p-2 text-left font-semibold text-sm md:text-base lg:text-lg w-2/3">
                    Company Name
                  </th>
                  <th className="p-2 text-left font-semibold text-sm md:text-base lg:text-lg w-2/3">
                    Students Placed
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCompanies.map(([company, count], index) => (
                  <tr
                    key={company}
                    className={`border-b h-20 ${
                      index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#EDEDED]"
                    }`}
                  >
                    <td className="p-2 text-sm md:text-base w-2/3 overflow-hidden text-ellipsis">
                      {company}
                    </td>
                    <td className="p-2 font-semibold text-sm md:text-base w-2/3">
                      {count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCompanyPages > 1 &&
            renderPagination(companyPage, totalCompanyPages, setCompanyPage)}
        </div>

        {/* Colleges Section */}
        <div className="hidden lg:grid place-items-center">
          <img
            src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1745658096/succes_jf6uoa.png"
            alt="Students celebrating success"
            className="rounded-[20px] object-contain w-[100%] max-h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
