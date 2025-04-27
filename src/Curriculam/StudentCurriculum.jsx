import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../contexts/StudentProfileContext";
import { FaStar } from "react-icons/fa";

const SubjectMappings = {
  PFS: ["Python", "Flask", "Frontend", "SoftSkills", "MySQL", "Aptitude"],
  JFS: ["Java", "AdvancedJava", "Frontend", "SoftSkills", "MySQL", "Aptitude"],
  DA: ["Python", "MySQL", "SoftSkills", "Aptitude","Statistics","Data Analytics"], 
  DS: ["Python","MySQL", "SoftSkills", "Aptitude","Statistics","Data Analytics","Machine Learning","Deep Learning"],
  C:["C"],
  DSA:["DSA"]
};

const Subjects = [
  { name: "Python", description: "Learn Python programming from basics to advanced.", image: "/course_logos/python.svg" },
  { name: "Java", description: "Master Java programming concepts with practical examples.", image: "/course_logos/java.svg" },
  { name: "AdvancedJava", description: "Deep dive into advanced Java programming concepts.", image: "/course_logos/advancedjava.svg" },
  { name: "Frontend", description: "Build dynamic and responsive UI using modern frontend technologies.", image: "/course_logos/frontend.svg" },
  { name: "MySQL", description: "Learn database management and SQL queries with MySQL.", image: "/course_logos/sql.svg" },
  { name: "Flask", description: "Master web development using the Flask framework in Python.", image: "/course_logos/flask.svg" },
  { name: "SoftSkills", description: "Enhance your communication and teamwork skills.", image: "/course_logos/softskills.svg" },
  { name: "Aptitude", description: "Sharpen your logical reasoning and problem-solving skills.", image: "/course_logos/Aptitude.svg" },
  { name: "Statistics", description: "Understand data distributions, probability, and statistical methods.", image: "/course_logos/statistics.png" },
  { name: "Machine Learning", description: "Build intelligent systems that learn from data using ML algorithms.", image: "/course_logos/machinelearning.png" },
  { name: "Deep Learning", description: "Explore neural networks and deep learning frameworks for AI.", image: "/course_logos/deeplearning.png" },
  { name: "Data Science", description: "Explore data science concepts and tools to derive insights.", image: "/course_logos/datascience.svg" },
  { name: "Data Analytics", description: "Learn how to analyze data and make data-driven decisions.", image: "/course_logos/dataanalytics.svg" },
  { name: "C", description: "Learn the basics and advanced concepts of the C programming language.", image: "/course_logos/C.svg" },
  { name: "DSA", description: "Master fundamental and advanced concepts of Data Structures and Algorithms using the C programming language.", image: "/course_logos/datastructures.svg" }
];

const StudentCurriculum = () => {
  const { studentDetails } = useStudent();
  const navigate = useNavigate();
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    if (studentDetails?.BatchNo) {
      const batchPrefix = studentDetails.BatchNo.split("-")[0];
      const subjectsForBatch = SubjectMappings[batchPrefix] || [];
      const filtered = Subjects.filter(subject => subjectsForBatch.includes(subject.name));
      setFilteredSubjects(filtered);
    }
  }, [studentDetails]);

  const handleSubjectClick = (subject) => {
    navigate(`/subject/${subject.name.toLowerCase().replace(/ /g, "-")}`, { state: { subject } });
  };

  return (
    <div className="bg-[#F3F3F3] flex flex-col items-center lg:px-10 lg:py-7 px-4 py-3 mt-0">
      <div>
        <h1 className="text-[20px] sm:text-[24px] leading-[50px] font-semibold text-[#19216F] font-['Inter'] text-center">Student Curriculum</h1>
        <p className="text-xl text-center">Explore your learning modules and resources</p>
      </div>
      <div className="bg-[#19216F] rounded-lg p-3 md:p-10 md:pt-16 lg:p-10 lg:pt-20 lg:pb-10 py-20 w-full max-w-full mt-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-6">
    {filteredSubjects.map((subject, index) => (
      <div
        key={index}
        className="bg-white rounded-lg shadow-lg p-6 relative space-y-6 cursor-pointer transition-transform transform hover:scale-105"
        onClick={() => handleSubjectClick(subject)}
      >
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <img
            alt={`${subject.name} logo`}
            className="w-24 h-24 rounded-full"
            src={subject.image}
          />
        </div>
        <div className="mt-12 text-center space-y-4">
          <div className="flex justify-center mb-2 space-x-1">
            {[...Array(5)].map((_, index) => (
              <FaStar key={index} className="text-yellow-500" />
            ))}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{subject.name}</h2>
          <button className="mt-4 bg-[#19216F] text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 w-full">
            Know More....
          </button>
        </div>
      </div>
    ))}
  </div>
</div>


    </div>
  );
};

export default StudentCurriculum;