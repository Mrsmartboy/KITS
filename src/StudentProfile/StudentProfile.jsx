import React, { useState } from 'react';
import axios from 'axios'
import Swal from 'sweetalert2/dist/sweetalert2.min.js';  
import './StudentProfile.css';
import {useStudentsData} from '../contexts/StudentsListContext';
import { useEdit } from '../contexts/EditContext';
import { useStudent } from '../contexts/StudentProfileContext';
import { decryptData } from '../../cryptoUtils.jsx';



const StudentProfile = () => {
    const {fetchStudentsData} = useStudentsData()
    const email=decryptData(localStorage.getItem("email"))
    const {edit, setEdit } = useEdit();
      const {  fetchStudentDetails } = useStudent();
    

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        mobileNumber: '',
        collegeUSNNumber: '',
        githubLink: '',
        arrears: '',
        qualification: '',
        department: '',
        password: '',
        cpassword: '',
        state: "",
        cityname: "",
        yearOfPassing: '',
        collegeName: '',
        tenthStandard: '',
        twelfthStandard: '',
        profilePic: '',
        resume: null,
        highestGraduationPercentage: ''
        });
    const [age, setAge] = useState('');
    const handleAgeChange = (e) => {
        const selectedDate = e.target.value;
        const calculatedAge = calculateAge(selectedDate);
        setAge(calculatedAge);
        setFormData({ ...formData, age: selectedDate });
    };
    const calculateAge = (selectedDate) => {
        const dob = new Date(selectedDate);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        const hasBirthdayOccuredThisYear = today.getMonth() > dob.getMonth() ||
            (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
        if (dob.getMonth() === 1 && dob.getDate() === 29) {
            const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            const birthYear = dob.getFullYear();
            const currentYear = today.getFullYear();
            if (isLeapYear(birthYear) && hasBirthdayOccuredThisYear && !isLeapYear(currentYear)) {
                age--; 
            }
        }
        return age;
    };
    const [skills, setSkills] = useState(['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'NodeJS', 'Reactjs', 'Angular', 'Vuejs', 'ML', 'Django', 'Spring Boot', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'TypeScript', 'Go', 'Rust', 'Kotlin', 'SQL', 'Shell Scripting', 'VB.NET', 'MATLAB', 'R', 'AWS', 'DevOps']);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [isOther, setIsOther] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const addSkill = () => {
      const updatedSkill=  newSkill.charAt(0).toUpperCase() + newSkill.slice(1)
        const skillToAdd = isOther ? updatedSkill : currentSkill;
        if (skillToAdd && !selectedSkills.includes(skillToAdd)) {
            setSelectedSkills([...selectedSkills, skillToAdd]);
            setCurrentSkill('');
            setIsOther(false);
            setNewSkill('');
            if (isOther && !skills.includes(skillToAdd)) {
                setSkills([...skills, skillToAdd]);
            }
        }
    };

    const removeSkill = (skill) => {
        const updatedSkills = selectedSkills.filter(item => item !== skill);
        setSelectedSkills(updatedSkills);
    };

    const handleSkillChange = (e) => {
        const value = e.target.value;
        setCurrentSkill(value);
        setIsOther(value === 'Other');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const fieldName = e.target.name;
        const file = e.target.files[0];

        let validTypes = [];
        let maxSize = 0;
        if (fieldName === 'resume') {
            validTypes = ['application/pdf'];
            maxSize = 100 * 1024; // 100 KB
        } else if (fieldName === 'profilePic') {
            validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            maxSize = 10 * 1024; // 10 KB
        }

        if (file) {
            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File Type',
                    text: fieldName === 'resume' ? 'Please upload a PDF document.' : 'Please upload an image file (JPEG, PNG, GIF).',
                });
                e.target.value = '';
                return;
            }

            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: fieldName === 'resume' ? 'Resume must be less than 100 KB.' : 'Profile picture must be less than 10 KB.',
                });
                e.target.value = '';
                return;
            }

            setFormData({
                ...formData,
                [fieldName]: file,
            });
        }
    };

   
    const handleArrearsChange = (e) => {
        const value = e.target.value === 'yes' ? true : false;
        setFormData({
            ...formData,
            arrears: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setEdit(true)

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        const graduationRegex = /^\d*\.?\d*$/;
     
        if (!passwordRegex.test(formData.password)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Password',
                text: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and be at least 6 characters long.',
            });
            return;
        }
    
        if (selectedSkills.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'No Skills Selected',
                text: 'Please select at least one skill.',
            });
            return;
        }
    
        if (formData.password !== formData.cpassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'Password and Confirm Password do not match.',
            });
            return;
        }
    
        if (!graduationRegex.test(formData.highestGraduationPercentage)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Percentage',
                text: 'Highest graduation percentage must be a valid number.',
            });
            return;
        }
    
        Swal.fire({
            title: 'Signing up...',
            text: 'Please wait while we process your registration',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/signup`,
                {
                    name: formData.name,
                    email: email,
                    password: formData.password,
                    cityName: formData.cityname,
                    department: formData.department,
                    yearOfPassing: formData.yearOfPassing,
                    state: formData.state,
                    collegeName: formData.collegeName,
                    qualification: formData.qualification,
                    mobileNumber: Number(formData.mobileNumber),
                    age: Number(age),
                    collegeUSNNumber: formData.collegeUSNNumber,
                    githubLink: formData.githubLink,
                    arrears: formData.arrears,
                    resume: formData.resume,
                    profilePic: formData.profilePic,
                    tenthStandard: Number(formData.tenthStandard),
                    twelfthStandard: Number(formData.twelfthStandard),
                    highestGraduationPercentage: Number(formData.highestGraduationPercentage),
                    studentSkills: selectedSkills,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
    
            await fetchStudentsData();
           await  fetchStudentDetails()
    
            Swal.fire({
                title: 'Profile Successfully Updated',
                icon: 'success',
            });
            setEdit(!edit);
        } catch (error) {
            console.error("Error during signup:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Unable to update profile. Please try again.',
            });
        }
    };
    
    return (
        <div className='student-profile-container'>
            <h1 style={{ color: "black" }} className='font-semibold text-3xl'>Student Profile</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="input-group">
                    <div className="form-group ">
                        <label>Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="name"
                            placeholder='Ex:Enter name'
                            value={formData.name}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of birth <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="date"
                            name="age"
                            placeholder='Ex:Enter your age'
                            value={formData.age}
                            onChange={handleAgeChange}
                            required
                        />
                        {/* Display calculated age */}
                        {age && (
                            <p>Your age: {age} years</p>
                        )}
                    </div>
                   
                </div>
               
                <div className="input-group">
                    <div className="form-group">
                        <label>New Password <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="password"
                            name="password"
                            placeholder='Ex:Ram@123'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="password"
                            name="cpassword"
                            placeholder='Ex:Ram@123'
                            value={formData.cpassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>WhatsApp Number <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="number"
                            name="mobileNumber"
                            placeholder='Ex:9999997654'
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Highest Qualification <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="qualification"
                            placeholder='Ex:Btech'
                            value={formData.qualification}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>College USN/ID Number <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="collegeUSNNumber"
                            placeholder='Ex:100002108F00'
                            value={formData.collegeUSNNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Github Link <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="githubLink"
                            placeholder='Ex:https://github.com/ram-saddist.com'
                            value={formData.githubLink}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>City Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="cityname"
                            placeholder='Ex:Vijayawada'
                            value={formData.cityname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>You are from which State <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="state"
                            placeholder='Ex:AndhraPradesh'
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>Department <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department <span style={{ color: 'red' }}>*</span></option>
                            <option value="CSE">CSE</option>
                            <option value="ISE">ISE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="CIVIL">CIVIL</option>
                            <option value="MECH">MECH</option>
                            <option value="AIML">AIML</option>
                            <option value="AIDS">AIDS</option>
                            <option value="CSD">CSD</option>
                            <option value="MBA">MBA</option>
                            <option value="MTECH CSE">MTECH CSE</option>
                            <option value="IoT">IoT</option>
                            <option value="BBA">BBA</option>
                            <option value="BCA">BCA</option>
                            <option value="BSC">BSC</option>
                            <option value="MCA">MCA</option>
                            <option value="MSC">MSC</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Highest Qualification Year of Passing <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="yearOfPassing"
                            placeholder='Ex:2019'
                            value={formData.yearOfPassing}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>10th Percentage <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="number"
                            name="tenthStandard"
                            placeholder='Ex:92'
                            value={formData.tenthStandard}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>12th Percentage <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="number"
                            name="twelfthStandard"
                            placeholder='Ex:92'
                            value={formData.twelfthStandard}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>Graduated College Name(PG/UG) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="collegeName"
                            placeholder='Ex:Codegnan'
                            value={formData.collegeName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Percentage(Highest Graduation) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="number"
                            name="highestGraduationPercentage"
                            placeholder='Ex:92'
                            value={formData.highestGraduationPercentage}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>Profile Picture (10 KB) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="file"
                            name="profilePic"
                            accept=".jpg,.jpeg,.png,.gif"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Resume (100KB - pdf) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="file"
                            name="resume"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                </div>


                <div className="input-group">
                <div>
                        <label>Skills: <span style={{ color: 'red' }}>*</span></label>
                        <select
                            id="skills"
                            name="skills"
                            value={currentSkill}
                            onChange={handleSkillChange}
                        >
                            <option value="">Select a skill</option>
                            {skills.map((skill, index) => (
                                <option key={index} value={skill}>{skill}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>

                        {isOther && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter a new skill"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                />
                            </div>
                        )}

                        <button type="button" className='add-skill' onClick={addSkill}>
                            Add Skill
                        </button>

                        <div className='selected-skills'>
                            {selectedSkills.map((skill, index) => (
                                <p key={index}>
                                    <span style={{ color: 'black' }}>{skill}</span>
                                    <button className='remove-skill' type='button' onClick={() => removeSkill(skill)}>X</button>
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Arrears <span style={{ color: 'red' }}>*</span></label>
                        <div className="radio-group">
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="arrearsYes"
                                    name="arrears"
                                    value="yes"
                                    checked={formData.arrears === true}
                                    onChange={handleArrearsChange}
                                    required
                                />
                                <label htmlFor="arrearsYes">Yes</label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="arrearsNo"
                                    name="arrears"
                                    value="no"
                                    checked={formData.arrears === false}
                                    onChange={handleArrearsChange}
                                    required
                                />
                                <label htmlFor="arrearsNo">No</label>
                            </div>
                        </div>
                    </div>
                </div>
                <button className='btn' type='submit'>Submit</button>
            </form>
        </div>
    );
};

export default StudentProfile;