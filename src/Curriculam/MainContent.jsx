import React, { useState, useEffect } from "react";
// import Notes from "./Notes"; // Import Notes Component
// import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
// import { FaStar, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MainContent = ({ selectedContent, curriculumData }) => {
  const navigate = useNavigate();
  // const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  // const [isDiscussionFormOpen, setIsDiscussionFormOpen] = useState(false);
  // const [discussionTitle, setDiscussionTitle] = useState("");
  // const [discussionDescription, setDiscussionDescription] = useState("");
  // const [rating, setRating] = useState(0);
  // const [hoverRating, setHoverRating] = useState(0);
  const [filteredCurriculum, setFilteredCurriculum] = useState([]);

  // **Filter Duplicate SubTopics Function**
  const filterDuplicateSubTopics = (curriculumData) => {
    const futurePrevSubTopics = new Set();
    const filteredCurriculum = [];

    for (let i = curriculumData.length - 1; i >= 0; i--) {
      const item = curriculumData[i];

      if (item.PreviousSubTopics && item.PreviousSubTopics.length > 0) {
        item.PreviousSubTopics.forEach((prev) => {
          futurePrevSubTopics.add(prev.subTopic.trim().toLowerCase());
        });
      }

      const filteredSubTopics = item.SubTopics.filter(
        (sub) => !futurePrevSubTopics.has(sub.subTopic.trim().toLowerCase())
      );

      filteredCurriculum.unshift({ ...item, SubTopics: filteredSubTopics });
    }

    return filteredCurriculum;
  };

  useEffect(() => {
    if (curriculumData) {
      setFilteredCurriculum(filterDuplicateSubTopics(curriculumData));
    }
  }, [curriculumData]);

  // Function to Get Embed URL for YouTube & Google Drive Videos
 // Function to Get Embed URL for YouTube & Google Drive Videos
 const getEmbedUrl = (videoUrl) => {
  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${url.searchParams.get("v")}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
    }
    if (url.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
    }
    if (url.hostname.includes("drive.google.com")) {
      const fileId = url.pathname.split("/d/")[1]?.split("/")[0];
      return fileId
        ? `https://drive.google.com/file/d/${fileId}/preview?modestbranding=1&rel=0&showinfo=0&fs=0`
        : videoUrl;
    }
    return videoUrl;
  } catch (error) {
    console.error("Invalid video URL:", videoUrl);
    return "";
  }
};


  

  // const submitRating = () => {
  //   Swal.fire({
  //     icon: "success",
  //     title: `Thank you for rating ${rating} stars!`,
  //     showConfirmButton: false,
  //     timer: 1500,
  //   });
  //   setRating(0);
  //   setIsRatingModalOpen(false);
  // };

  // const handleDiscussionSubmit = (e) => {
  //   e.preventDefault();

  //   if (!discussionTitle.trim() || !discussionDescription.trim()) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Missing Fields",
  //       text: "Please fill in both the title and description before submitting.",
  //     });
  //     return;
  //   }

  //   Swal.fire({
  //     icon: "success",
  //     title: "Discussion Submitted!",
  //     text: "Your discussion has been successfully posted.",
  //     showConfirmButton: false,
  //     timer: 1500,
  //   });

  //   setIsDiscussionFormOpen(false);
  //   setDiscussionTitle("");
  //   setDiscussionDescription("");
  // };

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-50 to-indigo-100 p-6 overflow-y-auto h-screen">
    {/* Page Header */}
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => navigate('/courses')}
        className="px-4 py-2 text-white bg-indigo-700 rounded-full shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-105"
      >
        ← Back to Courses
      </button>
  
      <h1 className="text-3xl font-extrabold text-indigo-900">Session Overview</h1>
    </div>
  
    {/* Main Content Section */}
    <h1 className="text-4xl font-bold text-indigo-800 mb-6">
      {selectedContent?.Topics || "Select a Topic"}
    </h1>
  
    {/* Video Section */}
    {selectedContent?.VideoUrl ? (
      <div className="rounded-3xl overflow-hidden shadow-2xl bg-black">
        <iframe
          src={getEmbedUrl(selectedContent.VideoUrl)}
          className="w-full h-[650px] rounded-lg"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms"
        ></iframe>
      </div>
    ) : (
      <p className="text-lg text-gray-600 italic">No video available for this topic.</p>
    )}
  
    {/* Description Section */}
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
      {(selectedContent?.SubTopics?.length > 0 || selectedContent?.PreviousSubTopics?.length > 0) && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-indigo-700 mb-3">SubTopics Covered:</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            {selectedContent.SubTopics?.map((sub, index) => (
              <li key={index} className="text-lg">{sub.subTopic}</li>
            ))}
            {selectedContent.PreviousSubTopics?.map((prev, index) => (
              <li key={`prev-${index}`} className="text-lg text-gray-500">
                {prev.subTopic} (Previous)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  
    {/* Discussion Form Modal */}
    {/* {isDiscussionFormOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative">
          <button
            onClick={() => setIsDiscussionFormOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ask a Doubt</h2>
          <form onSubmit={handleDiscussionSubmit}>
            <input
              type="text"
              placeholder="Enter your question title..."
              className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 mb-4"
              value={discussionTitle}
              onChange={(e) => setDiscussionTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Describe your doubt..."
              className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
              value={discussionDescription}
              onChange={(e) => setDiscussionDescription(e.target.value)}
              required
            ></textarea>
            <button
              type="submit"
              className="mt-6 w-full px-4 py-3 bg-indigo-700 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-transform transform hover:scale-105"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    )} */}
  
    {/* Rating Modal */}
    {/* {isRatingModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
          <button
            onClick={() => setIsRatingModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Rate your session:</h2>
          <div className="flex justify-center items-center mb-8 space-x-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="text-4xl focus:outline-none transform transition-transform hover:scale-125"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                {star <= (hoverRating || rating) ? (
                  <FaStar className="text-yellow-500" />
                ) : (
                  <FaRegStar className="text-gray-400" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={submitRating}
            className="w-full px-4 py-3 bg-indigo-700 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-transform transform hover:scale-105"
          >
            Submit Rating
          </button>
        </div>
      </div>
    )} */}
  </div>
  
  );
};

export default MainContent;
   