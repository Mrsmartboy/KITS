import React from "react";

function CompilerHome() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-100 min-h-screen flex flex-col items-center justify-center">
       
        
      <div className="mt-10 w-full h-[900px] md:w-5/5">
        <iframe
          src="https://www.scorpai.site/"
          title="Code Quest Login"
          className="w-full h-full rounded-lg shadow-lg border border-gray-200"
          allowFullScreen
        ></iframe>
      </div>

        {/* Card 1: Total Questions Solved */}
       

      <footer className="mt-20 text-center">
        <p className="text-gray-600 text-sm">
          Built with 💻 and ❤️ by Codegnan. © 2025 All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default CompilerHome;
