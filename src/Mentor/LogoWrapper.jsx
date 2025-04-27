import React from "react";

const LogoWrapper = ({ children, logoSrc, altText }) => {
  return (
    <div className="relative w-full h-full">
      {children}
      <div className="fixed bottom-[10px] right-[10px] z-50">
        <img
          src="logo.png"
          alt={altText}
          className="w-20 h-20 md:w-28 md:h-28 lg:w-28 lg:h-28 object-contain"
        />
      </div>
    </div>
  );
};

export default LogoWrapper;
