import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./CourseQuerySection.css";

const CourseQuerySection = () => {
  
  useEffect(() => {
    const lazyBackgrounds = document.querySelectorAll(".lazy-background");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyBg = entry.target;
            lazyBg.style.backgroundImage = `url(${lazyBg.dataset.src})`;
            observer.unobserve(lazyBg);
          }
        });
      });

      lazyBackgrounds.forEach((bg) => observer.observe(bg));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyBackgrounds.forEach((bg) => {
        bg.style.backgroundImage = `url(${bg.dataset.src})`;
      });
    }
  }, []);

  return (
    <div className="query-section">
      <div
        className="query-background lazy-background"
        data-src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849453/question-bg_pwlqgo.webp"
      >
        <div className="query-content">
          <h1>Still have questions regarding courses?</h1>
          <p>
            Talk to our team and get support in identifying the right tech
            career course for you. Our team will answer your questions regarding
            courses, fees, batch details, and more.
          </p>
          <Link to="/request-form" className="request-callback">
            <button className="callback-button-query">
              <img
                src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/call_ea4ffs.webp"
                alt="call"
                className="call"
                width="50" 
                height="50"
              />
              Request A Callback
            </button>
          </Link>
        </div>
        <img
          src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849457/student_hhy6rh.webp"
          alt="Student"
          className="student-img"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default CourseQuerySection;
