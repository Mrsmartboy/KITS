import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FiAlertCircle } from "react-icons/fi";

const DynamicExamCard = ({
  title,
  percentage,
  score,
  correct,
  incorrect,
  total,
  status,
  color,
  showStats = true,
  showButton = true,
  showIcon = false,
  onViewReport,
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animate the percentage when the component mounts
  useEffect(() => {
    let start = 0;
    const duration = 2000; // Animation duration in milliseconds (1 second)
    const increment = percentage / (duration / 20); // Increment per frame

    const animate = () => {
      start += increment;
      if (start >= percentage) {
        setAnimatedPercentage(percentage);
        return;
      }
      setAnimatedPercentage(start);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [percentage]);

  return (
    <div className="w-full h-[150px] bg-[#EFF0F7] border-2 border-white shadow-[0px_2px_8px_rgba(19,46,224,0.2)] rounded-[15px] flex p-1 gap-1 font-[inter]">
      {/* Left: White Card */}
      <div className="relative w-[160px] h-full bg-white rounded-[13px] shadow-[0px_2px_8px_rgba(19,46,224,0.2)] flex-shrink-0">
        {/* Title */}
        <div className="absolute top-[14px] left-[50%] -translate-x-1/2 text-[10px] font-medium text-black leading-[12px] whitespace-nowrap">
          {title}
        </div>

        {/* Semi-Circle with Animation */}
        <div className="absolute top-[44px] left-[50%] -translate-x-1/2 w-[91px] h-[91px] flex items-center justify-center">
          <CircularProgressbar
            value={animatedPercentage}
            strokeWidth={4.05}
            circleRatio={0.7}
            styles={buildStyles({
              rotation: 0.65,
              strokeLinecap: "round",
              pathColor: color,
              trailColor: "#B4B4B4",
              pathTransition: "none", // Disable default transition to use our custom animation
            })}
          />
        </div>

        {/* Percentage */}
        <div
          className="absolute top-[70.87px] left-[50%] -translate-x-1/2 text-[12px] font-medium leading-[15px]"
          style={{ color }}
        >
          {Math.round(animatedPercentage)}%
        </div>

        {/* Score */}
        <div className="absolute top-[87.08px] left-[57.21px] text-[8px] font-medium leading-[10px] text-[#777777]">
          Score:
        </div>
        <div className="absolute top-[87.08px] left-[86.06px] text-[8px] font-medium leading-[10px] text-[#4A4A4A]">
          {score}
        </div>
      </div>

      {/* Right: Info + Button */}
      <div className="relative flex-1 h-full flex flex-col justify-evenly overflow-hidden">
        {status ? (
          <div className="flex flex-col justify-center items-center h-full text-center px-2">
            <span className="text-[12px] font-medium leading-[15px] text-[#9A9A9A] whitespace-nowrap">
              {status}
            </span>
            {showIcon && (
              <FiAlertCircle className="text-[#828181] w-[14px] h-[14px] mt-2" />
            )}
          </div>
        ) : (
          <>
            {/* Info Container */}
            {showStats && (
              <div className="px-6 flex flex-col gap-2 text-[10px] font-medium leading-[12px] text-[#353535]">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="text-black">: {total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correct</span>
                  <span className="text-black">: {correct}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incorrect</span>
                  <span className="text-black">: {incorrect}</span>
                </div>
              </div>
            )}

            {/* Button Container */}
            {showButton && (
              <div className="px-2 pb-2">
                <div
                  onClick={onViewReport}
                  className="w-full bg-[#19216F] h-[20px] rounded-[2.5px] flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-[8.1px] font-medium leading-[10px] whitespace-nowrap ">
                    View Detailed Report
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DynamicExamCard;