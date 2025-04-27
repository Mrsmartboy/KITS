import React, { useState, useEffect } from "react";
import "./styles.css";

const CreateExamModal = ({ closeModal, apiEndpoint }) => {
  const [activeTab, setActiveTab] = useState("database"); // Current tab: "database" or "manual"
  const [examType, setExamType] = useState("MCQ"); // Selected Exam Type: "MCQ", "Coding", "Both"
  const [questions, setQuestions] = useState([]); // Dynamic question list from the database
  const [filteredQuestions, setFilteredQuestions] = useState([]); // Filtered based on exam type

  // Fetch questions dynamically from the backend API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/questions`); // Replace with your API endpoint
        const data = await response.json();
        setQuestions(data); // Populate questions with API response
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [apiEndpoint]);

  // Filter questions dynamically based on the selected Exam Type
  useEffect(() => {
    if (examType === "Both") {
      setFilteredQuestions(questions); // Show all questions for "Both"
    } else {
      const filtered = questions.filter((q) => q.type === examType);
      setFilteredQuestions(filtered); // Show questions specific to the exam type
    }
  }, [examType, questions]);

  // Switch between "Select from Database" and "Add Question Manually" tabs
  const handleTabSwitch = (tab) => setActiveTab(tab);

  // Handle Exam Type Change
  const handleExamTypeChange = (e) => setExamType(e.target.value);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header with Title and Close Button */}
        <div className="modal-header">
          <h3>Create Surprise Exam</h3>
          <button className="close-btn" onClick={closeModal}>
            &times;
          </button>
        </div>

        {/* Modal Form */}
        <form className="modal-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" placeholder="Enter exam title" />
          </div>

          <div className="form-group date-group">
            <div>
              <label>Start Date & Time</label>
              <input type="datetime-local" />
            </div>
            <div>
              <label>End Date & Time</label>
              <input type="datetime-local" />
            </div>
          </div>

          <div className="form-group">
            <label>Exam Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="examType"
                  value="MCQ"
                  checked={examType === "MCQ"}
                  onChange={handleExamTypeChange}
                />{" "}
                MCQ Only
              </label>
              <label>
                <input
                  type="radio"
                  name="examType"
                  value="Coding"
                  checked={examType === "Coding"}
                  onChange={handleExamTypeChange}
                />{" "}
                Coding Only
              </label>
              <label>
                <input
                  type="radio"
                  name="examType"
                  value="Both"
                  checked={examType === "Both"}
                  onChange={handleExamTypeChange}
                />{" "}
                Both
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Select Batches</label>
            <select>
              <option>Select batch</option>
              <option>Batch 1</option>
              <option>Batch 2</option>
            </select>
          </div>

          <div className="form-group">
            <label>Bonus Points</label>
            <input type="number" placeholder="Enter bonus points" />
          </div>

          <div className="form-group">
            <label>Questions</label>
            <div className="tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === "database" ? "active" : ""}`}
                onClick={() => handleTabSwitch("database")}
              >
                Select from Database
              </button>
            </div>

            {/* Dynamic Questions - Select from Database */}
            {activeTab === "database" && (
              <div className="question-list">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q) => (
                    <label key={q.id}>
                      <input type="checkbox" value={q.id} /> {q.question} ({q.type})
                    </label>
                  ))
                ) : (
                  <p>No questions available for the selected exam type.</p>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="create-btn">
            Create Exam
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
