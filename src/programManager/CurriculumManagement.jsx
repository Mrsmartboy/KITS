import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";

import {
  FaUpload,
  FaFileExcel,
  FaUser,
  FaDownload,
} from "react-icons/fa";

const CurriculumManagement = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [dayOrder, setDayOrder] = useState("");
  const [topic, setTopic] = useState("");
  // const [topicsToCover, setTopicsToCover] = useState([]);
  const [curriculumData, setCurriculumData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [filterSubject, setFilterSubject] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showExcelUploadTab, setShowExcelUploadTab] = useState(false);
  const [excelData,setExcelData] = useState([])
  const [subTopics, setSubTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleDownloadTemplate = () => {
    const templateData = [
      {
        subject: "Python",
        dayOrder: "Day-1",
        topic: "Python Introduction",
        subTopics:"Programming Language,Data Types",
        // topicsToCover: "Data Types, int, float",
       
      },
    ];
  
    // Create a worksheet and a workbook
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  
    // Write the workbook to a buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Curriculum_Template.xlsx");
  };
  
 
  const fetchCurriculumData = useCallback( async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/syllabus`);
      if (response.status === 200 && response.data?.data) {
        const formattedData = response.data.data.map((item) => ({
          ...item,
        }));
        setCurriculumData(formattedData);
        setFilteredData(formattedData.filter((data) => data.subject));
        setShowTable(true);
      } else {
        setCurriculumData([]);
        setFilteredData([]);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch curriculum data. Please try again later.",
      });
    }
  },[]);

  useEffect(() => {
    fetchCurriculumData();
  }, [fetchCurriculumData]);



  const handleFilterChange = (subject) => {
    setFilterSubject(subject);
    if (subject) {
      const filtered = curriculumData.filter((data) => data.subject === subject);
      setFilteredData(filtered);
    } else {
      setFilteredData(curriculumData);
    }
  };

  const handleAddTopic = async () => {
    if (!selectedSubject.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Subject",
        text: "Please select a subject.",
      });
      return;
    }
    if (!dayOrder.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Day Order",
        text: "Please enter a valid Day Order.",
      });
      return;
    }
    if (!topic.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Topic",
        text: "Please enter a valid Topic.",
      });
      return;
    }
    if (subTopics.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Topics/Subtopics",
        text: "Please add at least one topic and one subtopic.",
      });
      return;
    }
    

    const newCurriculum = {
      subject: selectedSubject,
      dayOrder,
      topic,
      // topicsToCover,
      subTopics, 
    };
    
    try {
      setIsSubmitting(true);
      Swal.fire({
        title: "Adding Curriculum",
        text: "Please wait while we add the curriculum...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/syllabus`, newCurriculum);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Curriculum Added",
          text: "The curriculum has been added successfully!",
        });
        fetchCurriculumData();
        setCurriculumData((prevData) => [...prevData, { ...newCurriculum }]);
        setShowTable(true);
        setSelectedSubject("");
        setDayOrder("");
        setTopic("");
        setSubTopics([])
        // setTopicsToCover([]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Add",
          text: "Failed to add curriculum. Please try again.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the curriculum. Please try again later.",
      });
    }finally {
      setIsSubmitting(false); 
    }
  
  };

  const subjects = [
   "C","Python","DS-C",


  ];

  const handleAddSubTopicToList = (newSubTopic) => {
    if (newSubTopic.trim() !== "") {
      setSubTopics((prevSubTopics) => [...prevSubTopics, newSubTopic]);
    }
  };
  

  const handleExcelUploadClick = () => {
    setShowExcelUploadTab(!showExcelUploadTab);
  };

  const handleExcelUpload = async (e) => {
    const fileInput = document.getElementById("excelUpload"); // Get file input
    const file = e.target.files[0];
  
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please choose a file to upload.",
      });
      return;
    }
  
    const fileExtension = file.name.split(".").pop().toLowerCase();
  
    if (!["xlsx", "xls", "csv"].includes(fileExtension)) {
      Swal.fire({
        title: "Invalid File Type",
        text: "Only Excel or CSV files are supported.",
        icon: "error",
      });
      fileInput.value = ""; // Reset file input
      return;
    }
  
    try {
      const processExcelData = (rows, headers) => {
        let errors = []; // Store validation errors
        let extractedData = [];
        let expectedDayOrder = 1; // Track expected incrementing order
  
        rows.slice(1).forEach((row, index) => {
          const rowNum = index + 2; // Excel row starts from 2
          const subject = row[headers.indexOf("subject")]?.toString().trim();
          let rawDayOrder = row[headers.indexOf("dayorder")]?.toString().trim();
  
          // Reject raw numbers (e.g., "1", "2", "3") directly
          if (/^\d+$/.test(rawDayOrder)) {
            errors.push(`❌ Row ${rowNum}: Invalid Day Order "${rawDayOrder}". It should be in format "Day-1", "Day-2", etc.`);
          }
  
          // Ensure valid "Day-" format
          if (!/^Day-\d+$/.test(rawDayOrder)) {
            errors.push(`❌ Row ${rowNum}: Invalid Day Order "${rawDayOrder}". Use format "Day-1", "Day-2", etc.`);
          } else {
            // Extract number part from "Day-X" and ensure order follows sequential pattern
            const dayNumber = parseInt(rawDayOrder.replace("Day-", ""), 10);
            
            if (dayNumber !== expectedDayOrder) {
              errors.push(
                `❌ Row ${rowNum}: Incorrect sequence. Expected "Day-${expectedDayOrder}", but found "${rawDayOrder}".`
              );
            } else {
              expectedDayOrder++; // Increment for next row
            }
          }
  
          // Validate Subject
          if (!subjects.includes(subject)) {
            errors.push(`❌ Row ${rowNum}: Invalid Subject "${subject}". Allowed: ${subjects.join(", ")}`);
          }
  
          // If no errors, add to extracted data
          if (errors.length === 0) {
            extractedData.push({
              subject,
              dayOrder: rawDayOrder,
              topic: row[headers.indexOf("topic")]?.toString() || "",
              subTopics: row[headers.indexOf("subtopics")]
                ? row[headers.indexOf("subtopics")].split(",").map((item) => item.trim())
                : [],
            });
          }
        });
  
        // Show error messages and reset file input if errors exist
        if (errors.length > 0) {
          Swal.fire({
            title: "Data Validation Errors",
            html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">${errors.join("<br>")}</div>`,
            icon: "error",
          });
          fileInput.value = ""; // Reset file input
          return;
        }
  
        setExcelData(extractedData);
        Swal.fire({
          title: "File Uploaded Successfully",
          text: `${extractedData.length} rows processed.`,
          icon: "success",
        });
      };
  
      if (fileExtension === "csv") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csvContent = event.target.result;
          const parsedData = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
          });
  
          if (parsedData.data.length > 0) {
            const headers = Object.keys(parsedData.data[0]).map((h) => h.toLowerCase().trim());
            processExcelData(parsedData.data.map(Object.values), headers);
          } else {
            Swal.fire({
              title: "Invalid CSV File",
              text: "The file is empty or missing headers.",
              icon: "error",
            });
            fileInput.value = ""; // Reset file input
          }
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = new Uint8Array(event.target.result);
          const workbook = XLSX.read(content, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
          if (rows.length > 1) {
            const headers = rows[0].map((header) => header?.toLowerCase().trim() || "");
            processExcelData(rows, headers);
          } else {
            Swal.fire({
              title: "Invalid Excel File",
              text: "The file is empty or missing headers.",
              icon: "error",
            });
            fileInput.value = ""; // Reset file input
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `An error occurred: ${error.message}`,
      });
      fileInput.value = ""; // Reset file input
    }
  };
  
  
  
  
  
  const handleSubmitExcel = async () => {
    if (excelData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No File Uploaded",
        text: "Please upload an Excel file before submitting.",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/syllabus`, excelData);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "File Uploaded Successfully",
          text: "The file has been uploaded and is being processed.",
        });
        await fetchCurriculumData()
  
        // Reset the file input field after successful submission
        const fileInput = document.getElementById("excelUpload");
        if (fileInput) {
          fileInput.value = ""; // Reset file input
        }
  
        // Clear the excelData state
        setExcelData([]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "There was an issue uploading the file. Please try again.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while uploading the file. Please try again.",
      });
    }finally {
      setIsSubmitting(false); 
    }
  };
  

  return (
    <div >
    <div className="p-6 max-w-6xl mx-auto mt-0">
       <h2 className="text-2xl font-bold text-center text-indigo-600 mb-8">
        Curriculum Management
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <button
        onClick={handleExcelUploadClick}
        className={`px-6 py-2 border rounded-md transition duration-300 text-lg font-medium flex items-center gap-2 ${
          !showExcelUploadTab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
        >
           <FaUser />
          Manual Entry
        </button>

        <button
          onClick={handleExcelUploadClick}
          className={`px-6 py-2 border rounded-md transition duration-300 text-lg font-medium flex items-center gap-2 ${
            showExcelUploadTab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
           <FaFileExcel />
          Excel Upload
        </button>
       
      </div>

      {!showExcelUploadTab?( <>
     
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-indigo-600 mb-4">Select Subject</h3>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Choose a Technology Subject:
        </label>
        <select
          id="subject"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Select a Technology Subject --</option>
          {subjects.map((subject, index) => (
            <option key={index} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-indigo-600 mb-4">Add Curriculum Details</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="dayOrder" className="block text-sm font-medium text-gray-700 mb-2">
              Day Order:
            </label>
            <input
              id="dayOrder"
              type="text"
              value={dayOrder}
              onChange={(e) => setDayOrder(e.target.value)}
              placeholder="Day Order (e.g., Day-1)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic:
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g., Intro to Python)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex-1  min-w-[200px]">
          <label htmlFor="subTopic" className="block text-sm font-medium text-gray-700 mb-2">
            Subtopics
          </label>
          <input
           id="subTopic"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                handleAddSubTopicToList(e.target.value.trim());
                e.target.value = "";
              }
            }}
            placeholder="Press Enter to Add"
            className="w-full p-3 border rounded-lg"
          />
        </div>

          
    

        {subTopics.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-600 mb-2">Subtopics:</h4>
          <ul className="list-disc list-inside text-gray-800">
            {subTopics.map((subTopic, index) => (
              <li key={index}>{subTopic}</li>
            ))}
          </ul>
        </div>
      )}

          <div className="mt-6">
          <button
          onClick={handleAddTopic}
          className={`px-6 py-3 rounded-lg transition ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Add"}
        </button>

          </div>
        </div>

   

      </div>

      {showTable && curriculumData.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-indigo-600 mb-4">Curriculum Data</h3>

          <div className="mb-4">
            <label htmlFor="filterSubject" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Subject:
            </label>
            <select
              id="filterSubject"
              value={filterSubject }
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Show All Subjects --</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
  <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
    <table className="min-w-full bg-white">
      <thead>
        <tr className="bg-indigo-600 text-white">
          <th className="py-3 px-4 text-left">Subject</th>
          <th className="py-3 px-4 text-left">Day Order</th>
          <th className="py-3 px-4 text-left">Topic</th>
          <th className="py-3 px-4 text-left">SubTopics</th>
          {/* <th className="py-3 px-4 text-left">Topics to Cover</th> */}
        </tr>
      </thead>
      <tbody>
        {filteredData.map((data, index) => (
          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
            <td className="py-3 px-4 border">{data.subject}</td>
            <td className="py-3 px-4 border">{data.DayOrder}</td>
            <td className="py-3 px-4 border">{data.Topics}</td>
            <td className="py-3 px-4 border">
              <ul className="list-disc list-inside">
                {(data.SubTopics || []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </td>
            
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        </div>
      )}
      </>):(<div className="bg-white shadow-md rounded-lg p-6 mb-4">
         
                  <div className="flex justify-center gap-4 mb-4 text-center items-center">

                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      onClick={handleDownloadTemplate}
                    >
                      <FaDownload /> Download Template
                    </button>
                  </div>
                
          <h3 className="text-xl font-semibold text-indigo-600 mb-4">Upload Excel</h3>
          <div className="flex items-center border border-gray-300 rounded-md p-2">
          <FaUpload className="text-black mr-2" />
          <input
            id="excelUpload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            className="flex-1 px-2 py-1 text-gray-800 outline-none"
          />
        </div>
        <button
        onClick={handleSubmitExcel}
        className={`px-6 py-3 rounded-lg transition mt-2 ${
          isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        } text-white`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Add"}
      </button>

      </div>)}
          

    </div>
    </div>
  );
};

export default CurriculumManagement;
