import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-modal";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import Swal from "sweetalert2/dist/sweetalert2.min.js";
import { useStudent } from "../contexts/StudentProfileContext";
import { useEdit } from "../contexts/EditContext";
import StudentProfileV from "../StudentProfile/StudentProfileV";
import AtsResult from "../Ats/AtsResult";
import { decryptData } from '../../cryptoUtils.jsx';
import { AiOutlineEye } from "react-icons/ai"; 


import { FaUserCircle, FaEdit, FaUserAlt, FaGraduationCap, FaFileUpload, FaFileAlt, FaUserEdit, FaCamera } from "react-icons/fa";
import Cameraicon from "./CameraIcon.jsx";

// For accessibility (required by react-modal)
Modal.setAppElement("#root");

export default function StudentProfileUpdateVV() {
  const { studentDetails, loading, profilePicture, fetchStudentDetails } = useStudent();
  const { edit, setEdit } = useEdit();
  // Resume states
  const [file, setFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [updatingResume, setUpdatingResume] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();

  // ATS Score states
  const [resumeScore, setResumeScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [resumeScoreData, setResumeScoreData] = useState(null);

  // Modal states
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);

  // For convenience
  const resumeId = decryptData(sessionStorage.getItem("id"));
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // This is called when a new file is selected from the file picker
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedProfilePic(file);
      // Optionally, upload immediately or show a "Save" button
      uploadProfilePic(file);
    }
  };

  // Example: Upload the new profile picture to your server
  const uploadProfilePic = async (file) => {
    try {
      setUploadingPic(true);
      const formData = new FormData();
      formData.append("profilePic", file);
      formData.append("studentId", studentDetails.studentId);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/pic`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Profile Picture Updated!",
        });
        // Optionally, re-fetch the student data to show the new picture immediately
        // or manually update your local state/context
        await fetchStudentDetails()
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Reduce the image below 20KB.",
      });
    } finally {
      setUploadingPic(false);
    }
  };

  // 1) Fetch Resume
  const fetchResume = useCallback(async () => {
    if (!studentDetails?.studentId) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
        {
          params: { resumeId },
          responseType: "blob",
        }
      );
      const contentType = response.headers["content-type"];
      if (contentType.includes("application/pdf")) {
        const pdfUrl = URL.createObjectURL(response.data);
        setResumeUrl(pdfUrl);
      } else {
        console.error("Unsupported file type:", contentType);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      setResumeUrl(null);
    }
  }, [resumeId, studentDetails]);

  // 2) Update Resume
  const updateResume = async (e) => {
    e.preventDefault();
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "No File Selected",
        text: "Please select a file before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("student_id", decryptData(sessionStorage.getItem("student_id")));

    setUpdatingResume(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updateresume`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );



      if (response.status === 200) {
        Swal.fire({
          title: "Resume Updated Successfully",
          icon: "success",
        });
        fetchResume();
        setFile(null);
        e.target.reset();
      }
    } catch (error) {
      console.error("Error updating resume:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an issue updating your resume. Please try again later.",
      });
    } finally {
      setUpdatingResume(false);
    }
  };

  // 3) Fetch Resume Score
  const fetchResumeScore = async () => {
    // Ensure the resume is fetched first
    await fetchResume();

    if (!studentDetails?.studentId) {
      Swal.fire({
        icon: "error",
        title: "Student ID Missing",
        text: "Your student ID is not available. Please try again later.",
      });
      return;
    }

    setScoreLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
        {
          params: { student_id: resumeId },
        }
      );
      if (response.status === 200) {
        const score = response.data.Resume_data.ats_score;
        setResumeScore(score);
        setResumeScoreData(response.data.Resume_data);
        setScoreModalOpen(true);

        Swal.fire({
          title: "Resume Score Retrieved",
          text: `Your ATS Resume Score is ${score}/100`,
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error fetching resume score:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Retrieve Score",
        text: "There was an issue fetching your resume score. Please try again later.",
      });
    } finally {
      setScoreLoading(false);
    }
  };

  // 4) On Mount => Fetch Resume
  useEffect(() => {
    if (studentDetails?.studentId && resumeId) {
      fetchResume();
    }
  }, [studentDetails, resumeId, fetchResume]);

  // Loading or Edit mode
  if (!studentDetails || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading student details...</p>
      </div>
    );
  }
  if (edit) {
    return <StudentProfileV />;
  }

  // 5) Render
  return (
    <div className="mt-0 bg-[##F3F3F3] lg:px-8 lg:py-8 px-5 py-5 flex flex-col font-[inter]">
      {/* ===================== MAIN CARD ===================== */}
      <div className="bg-white rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)]  w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[20%_35%_30%_10%] gap-4 w-full">
          {/* Profile Section */}
          <div className="relative flex flex-col items-center justify-center border-b-2 xl:border-b-0 xl:border-r-2 border-[#E7E7E7] py-4">
            {/* Mobile Edit Button (only shown below xl) */}
            <button
              onClick={() => setEdit(true)}
              className="absolute top-2 right-2 xl:hidden w-[70px] h-[29px] bg-[#19216f] text-white text-[14px] font-medium rounded-[2px] shadow-md hover:shadow-lg transition-transform hover:scale-105 flex items-center justify-center z-10"
            >
              <FaEdit className="mr-1" /> Edit
            </button>

            <div className="relative w-32 h-32 sm:w-[149px] sm:h-[149px]">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  onClick={() => setProfileModalOpen(true)}
                  className="rounded-full object-cover w-full h-full cursor-pointer transition-transform hover:scale-105"
                />
              ) : (
                <div
                  onClick={() => setProfileModalOpen(true)}
                  className="bg-[#D9D9D9] w-full h-full rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                >
                  <FaUserCircle className="text-gray-300 w-3/4 h-3/4" />
                </div>
              )}
              <label
                htmlFor="profilePicInput"
                className="absolute bottom-0 right-0  text-white rounded-full p-2 cursor-pointer "
              >
                {uploadingPic ? (
                  <span className="text-xs">Uploading...</span>
                ) : (
                  <Cameraicon className="w-5 h-5" />
                )}
              </label>
              <input
                type="file"
                id="profilePicInput"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePicChange}
                disabled={uploadingPic}
              />
            </div>
            <div className="text-center mt-4">
              <p className="text-xl sm:text-[24px] leading-tight font-semibold text-black">
                {studentDetails.name || "Full Name"}
              </p>
              <p className="text-sm sm:text-[14px] font-medium text-black">
                ID: {studentDetails.studentId || "N/A"}
              </p>
            </div>
          </div>

          <div className="xl:contents">
            <div className="flex flex-col xl:contents items-start sm:flex-row sm:items-center gap-4 w-full sm:col-span-3"></div>

            {/* Personal Information */}
            <div className="space-y-4 p-0 sm:p-5">
              <div className="text-lg sm:text-xl font-bold text-[#19216f] flex items-center gap-2">
                <img src="./studentProfile/personalinfo.svg" alt="personal" className="w-6 h-6" />
                <span>Personal Information</span>
              </div>
              <table className="text-black text-xs sm:text-[14px] w-full">
                <tbody>
                  {[
                    { label: "Student ID", value: studentDetails?.studentId },
                    { label: "Batch No", value: studentDetails?.BatchNo },
                    { label: "Email ID", value: studentDetails?.email },
                    { label: "Age", value: studentDetails?.age },
                    { label: "State", value: studentDetails?.state },
                    { label: "Phone", value: studentDetails?.studentPhNumber },
                    {label:"Parent No", value: studentDetails?.parentNumber},
                    {
                      label: "Github",
                      value: studentDetails?.githubLink ? (
                        <a href={studentDetails.githubLink} className="text-blue-500 hover:underline break-all">
                          {studentDetails.githubLink}
                        </a>
                      ) : "N/A"
                    },
                    {
                      label: "Skills",
                      value: studentDetails?.studentSkills?.length ? studentDetails.studentSkills.join(", ") : "N/A"
                    },
                    ...(studentDetails?.arrears === "true" ? [
                      { label: "Arrears", value: "Yes" },
                      { label: "Arrears Count", value: studentDetails?.ArrearsCount }
                    ] : [])
                  ].map((item, index) => (
                    <tr key={index}>
                      <td className="font-semibold pr-2 py-1 sm:pr-3 sm:py-2 w-1/3">{item.label}</td>
                      <td className="pr-2 py-1 sm:pr-3 sm:py-2">:</td>
                      <td className="py-1 sm:py-2 break-words">{item.value || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Academic Information */}
            <div className="space-y-4 p-0 sm:p-5">
              <div className="text-lg sm:text-xl font-bold text-[#19216f] flex items-center gap-2">
                <img src="./studentProfile/academic.svg" alt="academic" className="w-6 h-6" />
                <span>Academic Information</span>
              </div>
              <table className="text-black text-xs sm:text-[14px] w-full">
                <tbody>
                  {[
                    { label: "College", value: studentDetails?.collegeName },
                    { label: "USN", value: studentDetails?.collegeUSNNumber },
                    { label: "Department", value: studentDetails?.department },
                    { label: "Qualification", value: studentDetails?.qualification },
                    { label: "10th Percentage", value: studentDetails?.tenthStandard, suffix: "%" },
                    { label: "12th Percentage", value: studentDetails?.twelfthStandard, suffix: "%" },
                    { label: "Graduation %", value: studentDetails?.highestGraduationpercentage, suffix: "%" },
                    { label: "Passout Year", value: studentDetails?.yearOfPassing }
                  ].map((item, index) => (
                    <tr key={index}>
                      <td className="font-semibold pr-2 py-1 sm:pr-3 sm:py-2 w-1/3">{item.label}</td>
                      <td className="pr-2 py-1 sm:pr-3 sm:py-2">:</td>
                      <td className="py-1 sm:py-2 break-words">
                        {item.value ? `${item.value}${item.suffix || ""}` : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Button (shown only on xl+) */}
            <div className="hidden xl:flex items-start justify-center sm:justify-end p-0 sm:p-5">
              <button
                onClick={() => setEdit(true)}
                className="w-[70px] h-[29px] bg-[#19216f] text-white text-[16px] font-medium rounded-[2px] shadow-md hover:shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6   w-full mx-auto px-1 py-6">

  {/* Upload Resume */}
  <div className="bg-white rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-5 flex flex-col w-full min-h-[143px]">
  <div className="flex items-center gap-2 mb-4">
    <FaFileUpload className="text-[#19216f] text-xl" />
    <h3 className="text-lg font-semibold text-[#19216f]">Upload Resume</h3>
  </div>

  <form onSubmit={updateResume} className="flex flex-col xl:flex-row ">
    <input
      type="file"
      className="flex-1 text-sm text-gray-700 border border-gray-300 bg-gray-50 p-2 cursor-pointer"
      onChange={(e) => setFile(e.target.files[0])}
    />
    <button
      type="submit"
      disabled={updatingResume}
      className={`flex items-center justify-center gap-2 bg-[#19216f] text-white px-2 py-2 shadow-md hover:shadow-lg transition-transform hover:scale-105 ${
        updatingResume ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <FaFileUpload />
      {updatingResume ? "Updating..." : "Upload"}
    </button>
  </form>
</div>


  {/* Resume + Score */}
  <div className="flex flex-col xl:flex-row w-full bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]  rounded-md min-h-[143px]">
  {/* Resume Card */}
  <div className="bg-white shadow-md p-5 flex flex-col w-full xl:w-2/3 rounded-t-xl xl:rounded-l-xl xl:rounded-r-none ">
  {/* Top line: Icon + Title */}
  <div className="flex items-center gap-2 mb-4">
    <FaFileAlt className="text-[#19216f] text-xl" />
    <h3 className="text-lg font-semibold text-[#19216f]">Your Resume</h3>
  </div>

  {/* Bottom line: Buttons */}
  <div className="flex flex-col sm:flex-row gap-2">
    <button
      onClick={() => setModalIsOpen(true)}
      disabled={!resumeUrl}
      className={`flex items-center gap-1 border border-[#19216f] text-[#19216f] text-[14px] font-semibold px-2 py-1 rounded-md hover:bg-[#19216f] hover:text-white transition-transform hover:scale-105 ${
        resumeUrl ? "" : "opacity-50 cursor-not-allowed"
      }`}
    >
      View Resume <AiOutlineEye size={20} />
    </button>

    <button
      onClick={fetchResumeScore}
      className={`flex items-center gap-1 border border-[#19216f] text-[#19216f] text-[14px] font-semibold px-1 py-1 rounded-md hover:bg-[#19216f] hover:text-white transition-transform hover:scale-105 ${
        scoreLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {scoreLoading ? "Fetching..." : "View Resume Score"} <AiOutlineEye size={20} />
    </button>
  </div>
</div>


  {/* Score Card */}
  <div className="bg-[#19216f] text-white shadow-md p-4 flex flex-col items-center justify-center w-full xl:w-1/3 xl:rounded-r-md xl:rounded-l-none">
    <span className="font-semibold text-[18px]">ATS Resume Score</span>
    <span className="text-sm font-bold text-center">
      {resumeScore !== null ? `${resumeScore}/100` : "Check Your Resume Score"}
    </span>
  </div>
</div>

</div>



      {/* =============== Resume Preview Modal =============== */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Resume Preview</h2>
          <button
            onClick={() => setModalIsOpen(false)}
            className="text-red-500 text-xl font-bold"
          >
            ✖
          </button>
        </div>
        <div
          className="h-[70vh] overflow-auto border rounded-md shadow-lg"
          style={{ maxHeight: "70vh" }}
        >
          {resumeUrl && (
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
              <Viewer fileUrl={resumeUrl} plugins={[pdfPlugin]} />
            </Worker>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={scoreModalOpen}
        onRequestClose={() => setScoreModalOpen(false)}
        className="bg-white p-8 rounded-xl shadow-2xl max-w-5xl w-full mx-auto overflow-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "12px",
          padding: "15px",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Resume Score Analysis</h2>
          <button
            onClick={() => setScoreModalOpen(false)}
            className="text-red-500 text-2xl font-bold hover:scale-110 transition-transform"
          >
            ✖
          </button>
        </div>
        <div className="overflow-y-auto max-h-[75vh] p-4">
          {resumeScoreData ? (
            <AtsResult analysis={resumeScoreData} />
          ) : (
            <p className="text-center text-gray-500">
              No resume score data available.
            </p>
          )}
        </div>
      </Modal>

      {/* =============== Profile Picture Preview Modal =============== */}
      <Modal
        isOpen={profileModalOpen}
        onRequestClose={() => setProfileModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="flex justify-end">
          <button
            onClick={() => setProfileModalOpen(false)}
            className="text-red-500 text-2xl font-bold"
          >
            ✖
          </button>
        </div>
        <div className="flex justify-center items-center">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile Large"
              className="max-w-full max-h-[80vh] rounded"
            />
          ) : (
            <p>No profile picture available.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
