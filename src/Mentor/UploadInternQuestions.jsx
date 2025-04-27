import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { decryptData } from "../../cryptoUtils";

const UploadInternQuestions = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);
  const cancelRef = useRef(false); // To track cancellation
  const testerId = decryptData(sessionStorage.getItem("Testers"));

  const resetFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to split array into chunks
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const handleProcessFile = async () => {
    if (!file) {
      return Swal.fire({
        icon: "error",
        title: "No File Selected",
        text: "Please select an Excel file to upload.",
      });
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload an Excel file (.xlsx or .xls).",
      });
    }

    setLoading(true);
    cancelRef.current = false; // Reset cancellation flag
    try {
      // Read Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

          // Drop entirely empty rows
          const cleanedData = jsonData.filter((row) =>
            Object.values(row).some((val) => val !== "" && val !== undefined)
          );
          if (cleanedData.length === 0) {
            resetFile();
            return Swal.fire({
              icon: "error",
              title: "No Valid Data",
              text: "No valid data found in the Excel file.",
            });
          }

          // Filter only mcq_test and code_test
          const allowed = ["mcq_test", "code_test"];
          const validQuestions = cleanedData.filter((r) =>
            allowed.includes((r.Question_Type || "").toLowerCase())
          );
          const skipped = cleanedData.filter(
            (r) => !allowed.includes((r.Question_Type || "").toLowerCase())
          );

          if (skipped.length > 0) {
            const list = skipped
              .map(
                (q) =>
                  `• [${q.Question_Type || "N/A"}] ${
                    q.Subject || "No Subject"
                  } (Q${q.Question_No || "?"})`
              )
              .join("<br>");
            await Swal.fire({
              icon: "warning",
              title: "Some Questions Skipped",
              html: `Only <b>'code_test'</b> and <b>'mcq_test'</b> will be uploaded.<br><br>Skipped:<br>${list}`,
              width: 600,
            });
          }

          if (validQuestions.length === 0) {
            resetFile();
            return Swal.fire({
              icon: "error",
              title: "No Valid Questions",
              text: "There are no 'code_test' or 'mcq_test' questions to upload.",
            });
          }

          // Confirm upload
          const confirm = await Swal.fire({
            icon: "info",
            title: "Confirm Upload",
            text: `You are about to upload ${validQuestions.length} question(s) in batches of 50. Proceed?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Upload",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
          });
          if (!confirm.isConfirmed) {
            setLoading(false);
            return;
          }

          // Prepare payload with internId
          const payload = validQuestions.map((q) => ({
            internId: testerId,
            ...q,
          }));

          // Split into batches of 50
          const batchSize = 50;
          const batches = chunkArray(payload, batchSize);
          setProgress({ current: 0, total: batches.length });

          // Show progress UI
          Swal.fire({
            title: "Uploading Questions...",
            html: `<div>Progress: <span id="progress-text">0/${batches.length}</span> completed</div>
                   <div class="progress-bar-container">
                     <div id="progress-bar" style="width: 0%; height: 20px; background-color: #3085d6;"></div>
                   </div>`,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: "Cancel Upload",
            didOpen: () => {
              Swal.getCancelButton().onclick = () => {
                cancelRef.current = true;
                Swal.close();
              };
            },
          });

          let successfulUploads = 0;
          const failedBatches = [];

          // Process each batch
          for (let i = 0; i < batches.length; i++) {
            if (cancelRef.current) {
              break; // Exit if user cancels
            }

            try {
              const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-upload-questions`,
                batches[i],
                {
                  headers: { "Content-Type": "application/json" },
                }
              );

              if (response.data.success) {
                successfulUploads += batches[i].length;
                setProgress((prev) => ({ ...prev, current: i + 1 }));
                // Update progress UI
                const progressPercent = ((i + 1) / batches.length) * 100;
                Swal.getHtmlContainer().querySelector(
                  "#progress-text"
                ).textContent = `${i + 1}/${batches.length}`;
                Swal.getHtmlContainer().querySelector(
                  "#progress-bar"
                ).style.width = `${progressPercent}%`;
              } else {
                failedBatches.push({ batch: i + 1, error: response.data.message });
              }
            } catch (err) {
              failedBatches.push({ batch: i + 1, error: err.message });
            }
          }

          // Close progress UI
          Swal.close();

          // Handle results
          if (cancelRef.current) {
            Swal.fire({
              icon: "info",
              title: "Upload Cancelled",
              text: `Upload was cancelled. ${successfulUploads} question(s) were uploaded.`,
            });
          } else if (failedBatches.length === 0) {
            resetFile();
            Swal.fire({
              icon: "success",
              title: "Upload Successful",
              text: `Successfully uploaded ${successfulUploads} question(s).`,
            });
          } else {
            const errorDetails = failedBatches
              .map((fb) => `Batch ${fb.batch}: ${fb.error}`)
              .join("<br>");
            resetFile();
            Swal.fire({
              icon: "warning",
              title: "Partial Upload",
              html: `Uploaded ${successfulUploads} question(s).<br><br>Failed batches:<br>${errorDetails}`,
              width: 600,
            });
          }
        } catch (err) {
          console.error("Processing error:", err);
          resetFile();
          Swal.fire({
            icon: "error",
            title: "Processing Error",
            text: err.message || "Something went wrong while processing the file.",
          });
        } finally {
          setLoading(false);
          setProgress({ current: 0, total: 0 });
        }
      };

      reader.onerror = () => {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "File Read Error",
          text: "Failed to read the Excel file.",
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setLoading(false);
      console.error("Upload error:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: err.message || "Something went wrong.",
      });
    }
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
    <div className="flex flex-col items-center justify-center mt-4 font-[inter]">
      <h1 className="text-3xl font-bold mb-8">Manage Exams</h1>
      <div className="w-full px-4 flex flex-col items-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-xl w-full">
          <h3 className="text-2xl text-center font-semibold mb-6">
            Upload Testing Questions
          </h3>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <button
              onClick={() => handleDownloadTemplate("mcq")}
              disabled={loading}
              className="w-full sm:w-60 bg-[#0368FF] text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-60 text-[15px]"
            >
              Download MCQ Template
            </button>
            <button
              onClick={() => handleDownloadTemplate("code")}
              disabled={loading}
              className="w-full sm:w-60 bg-[#0368FF] text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-60 text-[15px]"
            >
              Download Coding Template
            </button>
          </div>

          <div className="flex items-center justify-center mb-6">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={loading}
              className="block w-full text-sm text-gray-900
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer border border-gray-300 rounded-lg disabled:opacity-60"
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleProcessFile}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-60"
            >
              {loading ? "Processing..." : "Upload File"}
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Inline progress display */}
      {progress.total > 0 && (
        <div className="mt-4 text-center">
          <p>
            Progress: {progress.current}/{progress.total} batches completed
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadInternQuestions;