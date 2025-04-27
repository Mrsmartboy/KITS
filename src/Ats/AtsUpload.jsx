import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { decryptData } from '../../cryptoUtils.jsx';


const AtsUpload = () => {
  const [fileName, setFileName] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State for loading status
  const navigate = useNavigate();
  const std_id= decryptData(sessionStorage.getItem('student_id'))


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const fileInput = formData.get('resume');
    
    // Append student ID to the form data
    formData.append('std_id', std_id);
  
    if (!fileInput) {
      Swal.fire({
        icon: 'warning',
        title: 'No Resume Uploaded',
        text: 'Please upload your resume before analyzing.',
        confirmButtonColor: '#6366F1', // Indigo color for confirm button
      });
      return;
    }
  
    setIsAnalyzing(true); // Set loading status to true
  
    try {
      // API call to upload the resume
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      // Success response
      Swal.fire({
        icon: 'success',
        title: 'Upload Successful',
      }).then(() => {
        // Navigate to results page with analysis data
        navigate('/ats-result', { state: { analysis: response.data } });
      });
  
      setResponseMessage('Your resume has been successfully analyzed!');
    } catch (error) {
      // Error handling
      console.error('Error uploading resume:', error);
  
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'An error occurred while uploading the resume.',
        confirmButtonColor: '#E53E3E',
      });
    } finally {
      setIsAnalyzing(false); // Reset loading status
    }
  };
  

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Section */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white p-6 lg:p-10">
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            <span className="block">AI-Powered</span>
            <span className="block text-yellow-300">Resume Analysis</span>
          </h1>
          <p className="text-sm md:text-base lg:text-xl font-light max-w-md mx-auto">
            Get detailed insights and improvement suggestions for your resume with our advanced ATS analysis system.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-6 lg:p-10">
        <div className="bg-white shadow-2xl rounded-xl p-6 md:p-8 w-full max-w-lg">
          <h2 className="text-xl md:text-2xl font-bold text-gray-700 text-center mb-4 lg:mb-6">
            Upload Your Resume
          </h2>
          <form id="uploadForm" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6 md:space-y-8">
            <div
              className="border-dashed border-4 border-gray-300 rounded-lg p-6 md:p-10 text-center cursor-pointer hover:border-indigo-600 transition duration-300"
              onClick={() => document.getElementById('resume').click()}
            >
              <i className="fas fa-cloud-upload-alt text-4xl md:text-5xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 font-medium">Click or drag your resume here</p>
              <p className="text-gray-500 text-sm">(Only PDF format supported)</p>
              <input
                type="file"
                id="resume"
                name="resume"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="mt-4 text-gray-700 font-semibold text-sm md:text-base">
                {fileName || 'No file selected'}
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition duration-300 shadow-lg ${
                isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-700 text-white'
              }`}
              disabled={isAnalyzing} // Disable button during analysis
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'} {/* Show status */}
            </button>
          </form>
          {responseMessage && (
            <div
              id="responseMessage"
              className="mt-4 md:mt-6 text-center text-gray-700 bg-gray-100 p-4 rounded-lg border border-gray-300 text-sm md:text-base"
            >
              {responseMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsUpload;
