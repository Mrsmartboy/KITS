import React, { useState } from "react";

function MockInterviewHome() {
  const [showInterview, setShowInterview] = useState(false);


  return (
    <div className="flex items-center justify-center px-8 py-4 mt-0 font-[inter]">
      {/* Bigger White Box (Rectangle 249) */}
      <div className="m-2 relative w-full bg-white shadow-lg rounded-lg p-12 flex flex-col items-center text-center">
        
        {/* Title */}
        <h1 className="text-4xl font-bold">
          <span className="text-[#19216f]">Advanced</span> 
          <span className="text-red-600"> AI MockInterview </span> 
          <span className="text-[#19216f]">Platform</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mt-3 text-lg">
          Sharpen your skills with real-time AI-driven interviews and get job-ready!
        </p>

        {/* Conditionally Show Image or Interview */}
        {!showInterview ? (
          <>
            {/* Image */}
            <img 
              src="/aimock.png" 
              alt="AI Mock Interview" 
              className="w-full max-w-2xl mt-8"
            />

            {/* Call to Action Button */}
            <button
              className="mt-8 bg-[#19216f] text-white text-lg font-medium px-8 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
              onClick={() => setShowInterview(true)}
            >
              Start Your Mock Interview
            </button>
          </>
        ) : (
          <div className="w-full  mt-8 shadow-2xl border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#19216f] text-white text-lg font-semibold p-3 flex justify-between items-center">
              <span>Mock Interview in Progress</span>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                onClick={() => setShowInterview(false)}
              >
                Close
              </button>
            </div>
            <iframe
              src="https://interview.framewise.ai/?comp_id=codegnan.com"
              title="Mock Interview"
              className="w-full h-[100vh] border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewHome;
