import React, { useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ExamContext } from "./ExamModule/ExamContext";
import { useNavigate } from "react-router-dom";

/**
 * Basic deterrents:
 *  - Disable right-click
 *  - Disable copy, cut, paste
 *  - Block common DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J)
 *  - Block page reload (F5, Ctrl+R)
 *  - Prevent back navigation
 *  - Warn on tab switch
 *  - (No pointer lock used here)
 */
const ExamSecurityWrapper = ({ children }) => {
  const { handleSubmit } = useContext(ExamContext);
  const navigate = useNavigate();
  useEffect(() => {
    // 1) Disable Right-Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warn("Right-click is disabled!");
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 2) Disable Copy/Cut/Paste
    const handleCopy = (e) => {
      e.preventDefault();
      toast.warn("Copy is disabled!");
    };
    const handleCut = (e) => {
      e.preventDefault();
      toast.warn("Cut is disabled!");
    };
    const handlePaste = (e) => {
      e.preventDefault();
      toast.warn("Paste is disabled!");
    };
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    // 3) Block DevTools, Reload, Possibly PrintScreen
    const handleKeyDown = (e) => {
      // 1) Block reload: F5 or Ctrl/Cmd + R
      if (
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        toast.error("Reload is disabled during the exam!");
      }
      if (e.key === "esc") {
        e.preventDefault();
        toast.error("Reload is disabled during the exam!");
      }

      // 2) Block DevTools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Cmd+Shift+I/J
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["i", "j"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
      }

      // === NEW: Also block Cmd+Option+I or Ctrl+Alt+I ===
      // e.altKey corresponds to the Option key on Mac
      if ((e.metaKey || e.ctrlKey) && e.altKey) {
        e.preventDefault();
        toast.error("Opening DevTools is not allowed!");
      }

      // 3) Attempt to block screenshots
      //    - Windows "PrintScreen" key
      if (e.key === "PrintScreen") {
        e.preventDefault();
        toast.error("Screenshots are not allowed!");
      }

      //    - Mac "Cmd+Shift+3" or "Cmd+Shift+5" if recognized
      if (e.metaKey && e.shiftKey) {
        e.preventDefault();
        toast.error("Screenshots are not allowed!");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // 4) Warn on Tab Switch / Visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Get the current warn count from localStorage (defaulting to 0)
        let warnCount = parseInt(localStorage.getItem("warnCount") || "0", 10);
        warnCount++;
        localStorage.setItem("warnCount", warnCount);

        if (warnCount < 3) {
          toast.error(
            `Warning: You switched tabs ${warnCount} time${
              warnCount > 1 ? "s" : ""
            }!`
          );
        } else {
          toast.error(
            "You have switched tabs too many times. Your exam will now be submitted."
          );
          handleSubmit();
          navigate("/exam-dashboard");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5) Prevent back navigation
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.error("Navigating back is disabled!");
    };
    window.addEventListener("popstate", handlePopState);

    // 6) Prevent page unload (closing tab, etc.)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);

      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);

      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <ToastContainer />
      {children}
    </>
  );
};

export default ExamSecurityWrapper;
