import React from "react";
import { Search } from "lucide-react";

const StudentSearch = ({ onSearch }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by name or ID"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StudentSearch;
