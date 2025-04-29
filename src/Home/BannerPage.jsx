import React, { Suspense, useState, useEffect } from "react";
import StatsChart from "./StatsChart";
import "./BannerPage.css";
import { useDashboard } from "../contexts/DashboardContext";




const BannerPage = () => {
  const { dashboardData, loading } = useDashboard(); // Assuming you have a custom hook to fetch dashboard data
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer;
    if (!loading && dashboardData) {
      // Calculate the total number of placements from dashboardData
      const totalPlaced = Object.values(
        dashboardData.yearOFPlacement || {}
      ).reduce((acc, value) => acc + value, 0);
      // Fallback value if totalPlaced is zero
      const finalCount = totalPlaced === 0 ? 0 : totalPlaced;
      let currentCount = 0;
      const duration = 1000; // animation duration in milliseconds (2 seconds)
      const intervalTime = 3; // update every 50ms
      const steps = duration / intervalTime;
      const increment = finalCount / steps;

      timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= finalCount) {
          currentCount = finalCount;
          clearInterval(timer);
        }
        setCount(Math.floor(currentCount));
      }, intervalTime);
    }
    return () => clearInterval(timer);
  }, [dashboardData, loading]);

  return (
    <div className="coverpage-container">
      <div className="home-cover-text-container">
        <div className="home-text-container">
          <div className="home-titles">
            <p className="home-title">
              It's <span className="span-home-title">Not Just</span> A Numbers
            </p>
            <p className="tag-line">
              See Successful Students{" "}
              <span className="span-home-title">Placements</span> Journey
            </p>
          </div>

          {dashboardData && (
            <div className="placement-card">
              <h1 className="student-count">
                {count}
                <span className="plus-sign">+</span>
              </h1>
              <p className="students-placed">Students Placed</p>
              <p className="counting">
                <span className="blinking">
                  &gt;&gt;&gt; Still Counting...!
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="stats-studentplaced-container">
          {dashboardData && (
              <StatsChart />
          )}

          <div
            className="video-wrapper"
            style={{ width: "400px", height: "225px" }}
          >
            <video
              width="100%"
              height="100%"
              controls
              poster="https://res.cloudinary.com/db2bpf0xw/image/upload/v1735634876/codegnan-thumbnail_gsscbz.webp"
              style={{ backgroundColor: "#000" }}
            >
              <source
                src="https://res.cloudinary.com/db2bpf0xw/video/upload/v1735634495/Placement_tt4kwi.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>

      <div className="image-container">
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/banner-girl_i195ik.webp"
          alt="Banner Girl"
          className="banner-girl"
          loading="lazy"
          width="400"
          height="300"
        />
      </div>

      {!dashboardData && !loading && (
        <p className="error-message">
          Placement data is currently unavailable.
        </p>
      )}
    </div>
  );
};

export default BannerPage;