import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadQuestions = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleProcessFile = async () => {
    if (!file) {
      toast.error("Please select an Excel file to upload.");
      return;
    }
  
    if (
      file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      file.type !== "application/vnd.ms-excel"
    ) {
      toast.error("Invalid file type. Please upload an Excel file.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/uploadquestions`,
          jsonData,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.success) {
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
          }
          toast.success("File uploaded and processed successfully.");
        } else {
          toast.error(`Failed to upload file: ${response.data.message}`);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("An error occurred while processing the file.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      toast.error("Error reading the file. Please try again.");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = (type) => {
    const fileName =
      type === "mcq" ? "Final_Mcq_Template.xlsx" : "Final_Code_Template.xlsx";
    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center  mt-4 font-[inter]">
      <h1 className="text-3xl font-bold mb-8">Manage exams</h1>

      {/* Center the card with some padding */}
      <div className="w-full px-4 flex flex-col items-center justify-center">
        {/* Card container */}
        <div className="bg-white rounded-lg p-8 shadow-[0px_4px_20px_0px_#0362F326] max-w-xl w-full">
          <h3 className="text-2xl text-center font-semibold text-black mb-6">
            Upload Questions
          </h3>

          {/* Buttons in a responsive row */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <button
              onClick={() => handleDownloadTemplate("mcq")}
              className="w-full sm:w-60 bg-[#0368FF] text-white py-2 rounded-md hover:bg-blue-600 transition text-[15px]"
            >
              Download MCQ Template
            </button>
            <button
              onClick={() => handleDownloadTemplate("code")}
              className="w-full sm:w-60 bg-[#0368FF] text-white py-2 rounded-md hover:bg-blue-600 transition text-[15px]"
            >
              Download Coding Template
            </button>
          </div>

          {/* File input */}
          <div className="flex items-center justify-center mb-6">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-900
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         cursor-pointer border border-gray-300 rounded-lg"
            />
          </div>

          {/* Upload button */}
          <button
            onClick={handleProcessFile}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload File"}
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UploadQuestions;
