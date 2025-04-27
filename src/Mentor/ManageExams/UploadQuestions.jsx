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
    <div className="upload-section bg-transparent shadow-md rounded-lg p-8 mx-auto max-w-2xl">
     
      <h3 className="text-2xl text-center font-semibold text-blue-800 mb-6">
        Upload Questions
      </h3>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => handleDownloadTemplate("mcq")}
          className="w-48 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-md"
        >
          Download MCQ Template
        </button>
        <button
          onClick={() => handleDownloadTemplate("code")}
          className="w-48 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-md"
        >
          Download Coding Template
        </button>
      </div>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        ref={fileInputRef} // Reference for resetting input
        className="block w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
      />
      <button
        onClick={handleProcessFile}
        className="block w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
        disabled={loading}
      >
        {loading ? "Processing..." : "Process and Upload File"}
      </button>
    </div>
  );
};

export default UploadQuestions;
