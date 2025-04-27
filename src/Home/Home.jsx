import React from "react";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { AppBar } from "@mui/material";
import Dashboard from "./Dashboard";
import InfoBanner from "./InfoBanner";
import TeamPage from "./TeamPage";
import RotatingCarousel from "./RotatingCarousel";
import TestimonialsV from "./TestimonialsV";
import CourseQuerySection from "./CourseQuerySection";
import Collaboration from "./Collaboration";
import BannerPage from "./BannerPage";
import Footer from "../Footer/Footer";
import KitsCollaboration from "./KitsCollaboration";
import SuccessStories from "./StudentSuccess";

export default function Home() {
  return (
    <div className="mt-16">
      <a
        href="https://codegnan.com/job-accelerator-program/"
        target="accelerate-program"
        className="anchor-app-bar"
      >
        <AppBar
          sx={{
            backgroundColor: "#132EE0",
            transition: "top 0.3s",
            textDecoration: "none",
            boxShadow: "none",
            border: "none",
          }}
          className="scroll-container"
          position="static"
        >
          <p className="home-scroll-text">
            <span className="home-new">New</span>" Codegnan's Job Accelerator
            Program (JAP) offers a
            <span className="home-100-days"> 100-days</span> intensive training
            "
            <FontAwesomeIcon icon={faArrowRight} className="home-arrow" />
          </p>
        </AppBar>
      </a>
      <BannerPage />
      <InfoBanner />
      <TestimonialsV />

      <RotatingCarousel />
      <KitsCollaboration/>
      <SuccessStories/>
      <CourseQuerySection />
      <Collaboration />
      <TeamPage />
      <Footer />
    </div>
  );
}
