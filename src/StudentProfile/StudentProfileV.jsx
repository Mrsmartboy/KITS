import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import { FaMale, FaFemale } from 'react-icons/fa';
import { useStudentsData } from '../contexts/StudentsListContext';
import { useEdit } from '../contexts/EditContext';
import { useStudent } from '../contexts/StudentProfileContext';
import { decryptData } from '../../cryptoUtils.jsx';

const departmentList = [
  'CSE-AI & ML', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'CSE-Blockchain', 'CSE-Cyber Security',
  'CSE-Data Analytics', 'CSE', 'ECE-Embedded Systems', 'ECE-VLSI', 'MECH-Robotics', 'CSBS',
  'BSC-CSE', 'BSC-AI', 'BSC-CSCS', 'BSC-Data Science', 'BSC-Data Analytics', 'BSC-Physics',
  'BSC-Chemistry', 'BSC-Mathematics', 'BSC-Statistics', 'BSC-Zoology', 'BSC-Botany', 'BCA',
  'B.COM-Economics', 'B.COM-General', 'B.COM-Computer Application', 'B.COM-Finance',
  'B.COM-Banking', 'B.COM-Business Process', 'B.COM-Management', 'MCA', 'MSC', 'BBA',
];

const StudentProfileV = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const { fetchStudentsData } = useStudentsData();
  const email = decryptData(sessionStorage.getItem('email'));
  const { edit, setEdit } = useEdit();
  const { studentDetails, fetchStudentDetails } = useStudent();
  const [isDepartmentAdded, setIsDepartmentAdded] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [departments, setDepartments] = useState(departmentList);
  const [arrearsCount, setArrearsCount] = useState('');
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: studentDetails?.name || '',
    dob: studentDetails?.DOB || '',
    age: studentDetails?.age || '',
    gender: studentDetails?.gender || '',
    collegeUSNNumber: studentDetails?.collegeUSNNumber || '',
    githubLink: studentDetails?.githubLink || '',
    arrears: studentDetails?.arrears || false,
    arrearsCount: studentDetails?.ArrearsCount || '',
    qualification: studentDetails?.qualification || '',
    department: studentDetails?.department || '',
    password: '',
    cpassword: '',
    state: studentDetails?.state || '',
    cityname: studentDetails?.city || '',
    yearOfPassing: studentDetails?.yearOfPassing || '',
    collegeName: studentDetails?.collegeName || '',
    tenthStandard: studentDetails?.tenthStandard || '',
    tenthPassoutYear: studentDetails?.TenthPassoutYear || '',
    twelfthStandard: studentDetails?.twelfthStandard || '',
    twelfthPassoutYear: studentDetails?.TwelfthPassoutYear || '',
    profilePic: studentDetails?.profilePic || null,
    resume: studentDetails?.resume || null,
    highestGraduationPercentage: studentDetails?.highestGraduationpercentage || '',
  });

  const [errors, setErrors] = useState({
    name: '',
    age: '',
    gender: '',
    collegeUSNNumber: '',
    githubLink: '',
    qualification: '',
    department: '',
    password: '',
    cpassword: '',
    state: '',
    cityname: '',
    yearOfPassing: '',
    collegeName: '',
    tenthStandard: '',
    tenthPassoutYear: '',
    twelfthStandard: '',
    twelfthPassoutYear: '',
    highestGraduationPercentage: '',
    profilePic: '',
    resume: '',
  });

  const skills = [
    'HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'NodeJS', 'Reactjs', 'Angular', 'Vuejs',
    'ML', 'Django', 'Spring Boot', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'TypeScript', 'Go',
    'Rust', 'Kotlin', 'SQL', 'Shell Scripting', 'VB.NET', 'MATLAB', 'R', 'AWS', 'DevOps',
  ];
  const [selectedSkills, setSelectedSkills] = useState(studentDetails?.studentSkills || []);
  const [currentSkill, setCurrentSkill] = useState('');
  const [isOther, setIsOther] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const profileStatus = sessionStorage.getItem('profileStatus') === 'true';

  // Define required fields (excluding optional ones)
  const requiredFields = [
    'name', 'dob', 'gender', 'collegeUSNNumber', 'cityname', 'state',
    'tenthStandard', 'tenthPassoutYear', 'twelfthStandard', 'twelfthPassoutYear',
    'department', 'collegeName', 'arrears',
  ];

  // Calculate total required fields
  let totalFields = requiredFields.length; // 13 (including 'arrears')
  if (formData.arrears) totalFields += 1; // Add 'arrearsCount' if arrears is true
  if (!profileStatus) totalFields += 4; // Add 'password', 'cpassword', 'profilePic', 'resume' if profileStatus is false

  // Calculate progress based on filled required fields
  useEffect(() => {
    let filledFields = 0;

    // Count filled required fields
    requiredFields.forEach(field => {
      if (field !== 'arrears' && formData[field] !== '' && formData[field] !== null) {
        filledFields += 1;
      }
    });

    // Handle 'arrears' field (boolean, so always considered filled)
    filledFields += 1;

    // Handle 'arrearsCount' only if 'arrears' is true
    if (formData.arrears && formData.arrearsCount !== '' && formData.arrearsCount !== null) {
      filledFields += 1;
    }

    // Handle fields required only when profileStatus is false
    if (!profileStatus) {
      if (formData.password) filledFields += 1;
      if (formData.cpassword) filledFields += 1;
      if (formData.profilePic) filledFields += 1;
      if (formData.resume) filledFields += 1;
    }

    const calculatedProgress = Math.round((filledFields / totalFields) * 100);
    setProgress(calculatedProgress);
  }, [formData, profileStatus]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleCPasswordVisibility = () => setShowCPassword(!showCPassword);

  const handleArrearsChange = (value) => {
    const arrearsValue = value === 'yes' ? true : false;
    setFormData(prev => ({
      ...prev,
      arrears: arrearsValue,
      arrearsCount: arrearsValue ? prev.arrearsCount : 0,
    }));
    if (!arrearsValue) {
      setArrearsCount(0);
    }
    setErrors(prev => ({ ...prev, arrears: '' }));
  };

  const handleArrearsCountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setArrearsCount(value);
      setFormData(prev => ({ ...prev, arrearsCount: value }));
    }
  };

  const handleDOBChange = (e) => {
    const selectedDate = e.target.value;
    const calculatedAge = calculateAge(selectedDate);

    setFormData(prev => ({
      ...prev,
      dob: selectedDate,
      age: calculatedAge,
    }));

    setErrors(prev => ({
      ...prev,
      age: calculatedAge >= 18 ? '' : 'You must be at least 18 years old.',
      dob: '',
    }));
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateName = (name) => {
    return /^[a-zA-Z\s]+$/.test(name) ? '' : 'Name must contain only letters and spaces.';
  };

  const validateCollegeUSNNumber = (usn) => {
    return /^[a-zA-Z0-9]{1,50}$/.test(usn) ? '' : 'USN must be alphanumeric characters.';
  };

  const validateGithubLink = (link) => {
    if (!link) return '';
    return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9._-]+$/.test(link)
      ? ''
      : 'Invalid GitHub link. Please ensure it follows the format: https://github.com/username';
  };

  const validatePassword = (password) => {
    if (!password && !profileStatus) return 'Password is required.';
    if (!password) return '';
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return passwordRegex.test(password)
      ? ''
      : 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and be at least 6 characters long.';
  };

  const validateYearOfPassing = (year) => {
    if (!year) return '';
    return /^\d{4}$/.test(year) ? '' : 'Year of passing must be 4 digits.';
  };

  const validatePercentage = (percentage) => {
    if (!percentage) return '';
    return /^\d{2}$/.test(percentage) ? '' : 'Percentage must be 2 digits.';
  };

  const validateInput = (value) => {
    if (!value) return '';
    return /^[a-zA-Z0-9\s]*$/.test(value) ? '' : 'Input must not contain special characters.';
  };

  const validatePassoutYear = (year) => {
    return /^\d{4}$/.test(year) ? '' : 'Year must be exactly 4 digits.';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let errorMessage = '';
    if (profileStatus && (name === 'password' || name === 'cpassword')) {
      errorMessage = '';
    } else {
      switch (name) {
        case 'gender':
          errorMessage = value ? '' : 'Please select a gender.';
          break;
        case 'name':
          errorMessage = validateName(value);
          break;
        case 'collegeUSNNumber':
          errorMessage = validateCollegeUSNNumber(value);
          break;
        case 'githubLink':
          errorMessage = validateGithubLink(value);
          break;
        case 'password':
          errorMessage = validatePassword(value);
          break;
        case 'cpassword':
          errorMessage = validatePassword(value);
          if (value !== formData.password) {
            errorMessage = 'Password and Confirm Password do not match.';
          }
          break;
        case 'tenthPassoutYear':
        case 'twelfthPassoutYear':
          errorMessage = validatePassoutYear(value);
          break;
        case 'tenthStandard':
        case 'twelfthStandard':
          errorMessage = validatePercentage(value);
          break;
        case 'highestGraduationPercentage':
          errorMessage = validatePercentage(value);
          break;
        case 'yearOfPassing':
          errorMessage = validateYearOfPassing(value);
          break;
        case 'cityname':
        case 'state':
        case 'qualification':
        case 'collegeName':
          errorMessage = validateInput(value);
          break;
        default:
          break;
      }
    }

    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleFileChange = (e) => {
    const fieldName = e.target.name;
    const file = e.target.files[0];

    let validTypes = [];
    let maxSize = 10 * 1024;

    if (fieldName === 'resume') {
      validTypes = ['application/pdf'];
      maxSize = 100 * 1024;
    } else if (fieldName === 'profilePic') {
      validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      maxSize = 10 * 1024;
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

      setFormData(prev => ({ ...prev, [fieldName]: file }));
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setCurrentSkill(value);
    setIsOther(value === 'Other');
  };

  const addSkill = () => {
    const updatedSkill = newSkill.charAt(0).toUpperCase() + newSkill.slice(1).toLowerCase();
    const skillToAdd = isOther ? updatedSkill : currentSkill;
    if (skillToAdd && !selectedSkills.includes(skillToAdd)) {
      setSelectedSkills(prev => [...prev, skillToAdd]);
      setCurrentSkill('');
      setIsOther(false);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(item => item !== skill));
  };

  const addDepartment = () => {
    const updatedDepartment = newDepartment.charAt(0).toUpperCase() + newDepartment.slice(1);
    if (updatedDepartment && !departments.includes(updatedDepartment)) {
      setDepartments(prev => [...prev, updatedDepartment]);
      setFormData(prev => ({ ...prev, department: updatedDepartment }));
      setNewDepartment('');
      setIsDepartmentAdded(true);
    }
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, department: value }));
    setIsOther(value === 'Others');
    setErrors(prev => ({ ...prev, department: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEdit(true);

    const newErrors = {
      name: validateName(formData.name),
      gender: formData.gender ? '' : 'Please select a gender.',
      collegeUSNNumber: validateCollegeUSNNumber(formData.collegeUSNNumber),
      githubLink: validateGithubLink(formData.githubLink),
      password: !profileStatus ? validatePassword(formData.password) : '',
      cpassword: !profileStatus && formData.password !== formData.cpassword ? 'Password and Confirm Password do not match.' : '',
      yearOfPassing: validateYearOfPassing(formData.yearOfPassing),
      tenthPassoutYear: validatePassoutYear(formData.tenthPassoutYear),
      twelfthPassoutYear: validatePassoutYear(formData.twelfthPassoutYear),
      tenthStandard: validatePercentage(formData.tenthStandard),
      twelfthStandard: validatePercentage(formData.twelfthStandard),
      highestGraduationPercentage: validatePercentage(formData.highestGraduationPercentage),
      age: formData.age >= 18 ? '' : 'You must be at least 18 years old.',
      state: validateInput(formData.state),
      cityname: validateInput(formData.cityname),
      qualification: validateInput(formData.qualification),
      collegeName: validateInput(formData.collegeName),
      department: formData.department ? '' : 'Please select a department.',
      profilePic: !profileStatus && !formData.profilePic ? 'Profile picture is required.' : '',
      resume: !profileStatus && !formData.resume ? 'Resume is required.' : '',
    };

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    Swal.fire({
      title: 'Submitting...',
      text: 'Please wait while we process your registration',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const dataToSend = {
        name: formData.name,
        email: email,
        gender: formData.gender,
        dob: formData.dob,
        cityName: formData.cityname,
        department: formData.department,
        yearOfPassing: formData.yearOfPassing || null,
        state: formData.state,
        collegeName: formData.collegeName,
        qualification: formData.qualification || null,
        age: formData.age ? Number(formData.age) : calculateAge(formData.dob),
        collegeUSNNumber: formData.collegeUSNNumber,
        githubLink: formData.githubLink || null,
        arrears: formData.arrears,
        arrearsCount: formData.arrears ? Number(arrearsCount) : 0,
        tenthStandard: Number(formData.tenthStandard),
        tenthPassoutYear: formData.tenthPassoutYear,
        twelfthStandard: Number(formData.twelfthStandard),
        twelfthPassoutYear: formData.twelfthPassoutYear,
        highestGraduationPercentage: formData.highestGraduationPercentage ? Number(formData.highestGraduationPercentage) : null,
        studentSkills: selectedSkills.length > 0 ? selectedSkills : null,
        profileStatus: true,
      };

      if (!profileStatus) {
        dataToSend.password = formData.password;
        dataToSend.profilePic = formData.profilePic;
        dataToSend.resume = formData.resume;
      }

      const response = profileStatus
        ? await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/signup`,
            dataToSend,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          )
        : await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/signup`,
            dataToSend,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );

      if (!profileStatus) {
        sessionStorage.setItem('profileStatus', 'true');
      }

      if (formData.resume && !profileStatus) {
        const resumeFormData = new FormData();
        resumeFormData.append('resume', formData.resume);
        resumeFormData.append('student_id', decryptData(sessionStorage.getItem('student_id')));

        try {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
            resumeFormData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        } catch (error) {
          console.error('Error sending resume to ATS API:', error);
        }
      }

      await fetchStudentsData();
      await fetchStudentDetails();

      Swal.fire({
        title: 'Profile Successfully Updated',
        icon: 'success',
      });
      setEdit(!edit);
    } catch (error) {
      console.error('Error during signup:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Unable to update profile. Please try again.',
      });
    }
  };

  useEffect(() => {
    if (!studentDetails) return;

    setFormData({
      name: studentDetails.name || '',
      dob: studentDetails.DOB || '',
      age: studentDetails.age || '',
      gender: studentDetails.gender && ['Male', 'Female'].includes(studentDetails.gender) ? studentDetails.gender : '',
      collegeUSNNumber: studentDetails.collegeUSNNumber || '',
      githubLink: studentDetails.githubLink || '',
      arrears: studentDetails.arrears === 'true',
      arrearsCount: studentDetails.ArrearsCount || '',
      qualification: studentDetails.qualification || '',
      department: studentDetails.department || '',
      password: '',
      cpassword: '',
      state: studentDetails.state || '',
      cityname: studentDetails.city || '',
      yearOfPassing: studentDetails.yearOfPassing || '',
      collegeName: studentDetails.collegeName || '',
      tenthStandard: studentDetails.tenthStandard || '',
      tenthPassoutYear: studentDetails.TenthPassoutYear || '',
      twelfthStandard: studentDetails.twelfthStandard || '',
      twelfthPassoutYear: studentDetails.TwelfthPassoutYear || '',
      profilePic: studentDetails.profilePic || null,
      resume: studentDetails.resume || null,
      highestGraduationPercentage: studentDetails.highestGraduationpercentage || '',
    });

    setArrearsCount(studentDetails.ArrearsCount || '');
    setSelectedSkills(studentDetails.studentSkills || []);
  }, [studentDetails]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Progress Bar (Fixed Horizontal on Mobile/Tablet) */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[#999999] text-xs font-medium">Start</span>
          <div className="flex-1 mx-2">
            <div className="relative w-full h-2 bg-[#E1E1E1] rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-[#00007F] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 bg-[#00007F] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-semibold"
                style={{ left: `calc(${progress}% - 12px)` }}
              >
                {progress}%
              </div>
            </div>
          </div>
          <span className="text-[#999999] text-xs font-medium">Completed</span>
        </div>
      </div>

      <div className="text-[#00007F] font-semibold text-2xl leading-tight mb-8 mt-12 md:mt-0 text-center">
        Student Profile
      </div>

      <div className="w-full max-w-7xl bg-white border border-[#E1E1E1] shadow-md rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-6">
        {/* Progress Bar (Vertical on Desktop) */}
        <div className="hidden md:flex w-[10%] justify-center">
          <div className="flex flex-col items-center relative w-16 h-full">
            <span className="text-[#999999] text-xs mb-3">Start</span>
            <div className="relative w-2 flex-grow rounded-full bg-[#E1E1E1] overflow-visible">
              <div
                className="absolute top-0 left-0 w-full bg-[#00007F] rounded-full transition-all duration-300"
                style={{ height: `${progress}%` }}
              >
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `calc(100% - 19px)` }}>
                  <div className="w-9 h-9 bg-[#00007F] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[#999999] text-xs mt-3">Completed</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="w-full md:w-[90%] flex flex-col gap-8">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.name ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
            </div>

            {/* DOB + Age */}
            <div className="flex items-end gap-4">
              <div className="flex flex-col gap-2 w-[45%]">
                <label className="text-[#00007F] font-medium text-lg">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleDOBChange}
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.dob ? 'border-red-500' : 'border-[#00007F]'}`}
                    required
                  />
                </div>
                {errors.dob && <span className="text-red-500 text-sm">{errors.dob}</span>}
              </div>
              <div className="flex flex-col gap-2 w-[35%]">
                <label className="text-[#00007F] font-medium text-lg">Your Age</label>
                <input
                  type="text"
                  value={formData.age}
                  readOnly
                  placeholder="Your age"
                  className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg bg-gray-100"
                />
                {errors.age && <span className="text-red-500 text-sm">{errors.age}</span>}
              </div>
              <span className="text-[#666666] text-base mb-3">(Years)</span>
            </div>

            {/* Password and Confirm Password */}
            {!profileStatus && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                      className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.password ? 'border-red-500' : 'border-[#00007F]'}`}
                      required
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEye : faEyeSlash}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] cursor-pointer"
                      onClick={togglePasswordVisibility}
                    />
                  </div>
                  {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCPassword ? 'text' : 'password'}
                      name="cpassword"
                      value={formData.cpassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.cpassword ? 'border-red-500' : 'border-[#00007F]'}`}
                      required
                    />
                    <FontAwesomeIcon
                      icon={showCPassword ? faEye : faEyeSlash}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] cursor-pointer"
                      onClick={toggleCPasswordVisibility}
                    />
                  </div>
                  {errors.cpassword && <span className="text-red-500 text-sm">{errors.cpassword}</span>}
                </div>
              </>
            )}

            {/* Gender Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <label className="text-[#00007F] font-medium text-lg">
                  Your Gender <span className="text-red-500">*</span>
                </label>
                <div className="w-1.5 h-1.5 bg-[#EC5F70] rounded-full"></div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'gender', value: 'Male' } })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.gender === 'Male' ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                >
                  <FaMale className="w-6 h-6" />
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'gender', value: 'Female' } })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.gender === 'Female' ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                >
                  <FaFemale className="w-6 h-6" />
                  Female
                </button>
              </div>
              {errors.gender && <span className="text-red-500 text-sm">{errors.gender}</span>}
            </div>

            {/* Highest Qualification */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">Highest Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="Enter your Highest Qualification"
                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
              />
              {errors.qualification && <span className="text-red-500 text-sm">{errors.qualification}</span>}
            </div>

            {/* College USN/ID Number */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                College USN/ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="collegeUSNNumber"
                value={formData.collegeUSNNumber}
                onChange={handleChange}
                placeholder="Enter your College USN/ID Number"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.collegeUSNNumber ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.collegeUSNNumber && <span className="text-red-500 text-sm">{errors.collegeUSNNumber}</span>}
            </div>

            {/* Github Link */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">Github Link</label>
              <input
                type="url"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                placeholder="Enter your Github link"
                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
              />
              {errors.githubLink && <span className="text-red-500 text-sm">{errors.githubLink}</span>}
            </div>

            {/* City Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                City Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cityname"
                value={formData.cityname}
                onChange={handleChange}
                placeholder="Select City"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.cityname ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.cityname && <span className="text-red-500 text-sm">{errors.cityname}</span>}
            </div>

            {/* State */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter your State"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.state ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.state && <span className="text-red-500 text-sm">{errors.state}</span>}
            </div>

            {/* 10th Percentage */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                10th Percentage <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tenthStandard"
                value={formData.tenthStandard}
                onChange={handleChange}
                placeholder="Enter your 10th Percentage"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.tenthStandard ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.tenthStandard && <span className="text-red-500 text-sm">{errors.tenthStandard}</span>}
            </div>

            {/* 10th Passout Year */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                10th Passout Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tenthPassoutYear"
                value={formData.tenthPassoutYear}
                onChange={handleChange}
                placeholder="Enter your 10th Passout Year"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.tenthPassoutYear ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.tenthPassoutYear && <span className="text-red-500 text-sm">{errors.tenthPassoutYear}</span>}
            </div>

            {/* 12th Percentage */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                12th Percentage <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="twelfthStandard"
                value={formData.twelfthStandard}
                onChange={handleChange}
                placeholder="Enter your 12th Percentage"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.twelfthStandard ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.twelfthStandard && <span className="text-red-500 text-sm">{errors.twelfthStandard}</span>}
            </div>

            {/* 12th Passout Year */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                12th Passout Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="twelfthPassoutYear"
                value={formData.twelfthPassoutYear}
                onChange={handleChange}
                placeholder="Enter your 12th Passout Year"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.twelfthPassoutYear ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.twelfthPassoutYear && <span className="text-red-500 text-sm">{errors.twelfthPassoutYear}</span>}
            </div>

            {/* Department Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleDepartmentChange}
                  className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none ${errors.department ? 'border-red-500' : 'border-[#00007F]'}`}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="Others">Others</option>
                </select>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] text-lg">▼</span>
              </div>
              {isOther && !isDepartmentAdded && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  />
                  <button
                    type="button"
                    onClick={addDepartment}
                    className="px-4 py-3 bg-[#00007F] text-white font-medium text-sm rounded-lg hover:bg-[#000066]"
                  >
                    Add
                  </button>
                </div>
              )}
              {errors.department && <span className="text-red-500 text-sm">{errors.department}</span>}
            </div>

            {/* Highest Qualification Year */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">Highest Qualification Year of Passing</label>
              <input
                type="text"
                name="yearOfPassing"
                value={formData.yearOfPassing}
                onChange={handleChange}
                placeholder="Enter your Qualification Year"
                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
              />
              {errors.yearOfPassing && <span className="text-red-500 text-sm">{errors.yearOfPassing}</span>}
            </div>

            {/* Graduated College Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Graduated College Name (PG/UG) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="Enter your Graduated College Name"
                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.collegeName ? 'border-red-500' : 'border-[#00007F]'}`}
                required
              />
              {errors.collegeName && <span className="text-red-500 text-sm">{errors.collegeName}</span>}
            </div>

            {/* Graduation Passout Year */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">Graduation Passout Year</label>
              <input
                type="text"
                name="yearOfPassing"
                value={formData.yearOfPassing}
                onChange={handleChange}
                placeholder="Enter your Graduation Passout Year"
                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
              />
              {errors.yearOfPassing && <span className="text-red-500 text-sm">{errors.yearOfPassing}</span>}
            </div>

            {/* Profile Picture and Resume */}
            {!profileStatus && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    Profile Picture (10KB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="profilePic"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg ${errors.profilePic ? 'border-red-500' : 'border-[#00007F]'}`}
                    required
                  />
                  {errors.profilePic && <span className="text-red-500 text-sm">{errors.profilePic}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    Resume (100KB - pdf) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg ${errors.resume ? 'border-red-500' : 'border-[#00007F]'}`}
                    required
                  />
                  {errors.resume && <span className="text-red-500 text-sm">{errors.resume}</span>}
                </div>
              </>
            )}

            {/* Percentage (Highest Graduation) */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">Percentage (Highest Graduation)</label>
              <input
                type="text"
                name="highestGraduationPercentage"
                value={formData.highestGraduationPercentage}
                onChange={handleChange}
                placeholder="Enter your Percentage"
                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
              />
              {errors.highestGraduationPercentage && <span className="text-red-500 text-sm">{errors.highestGraduationPercentage}</span>}
            </div>

            {/* Skills Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">Skills</label>
              <div className="relative">
                <select
                  name="skills"
                  value={currentSkill}
                  onChange={handleSkillChange}
                  className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none"
                >
                  <option value="">Select a skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] text-lg">▼</span>
              </div>
              {isOther && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter a new skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={addSkill}
                className="mt-2 px-4 py-3 bg-[#00007F] text-white font-medium text-sm rounded-lg hover:bg-[#000066]"
              >
                Add Skill
              </button>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSkills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm">
                    <span className="text-[#666666]">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-red-500 font-bold text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrears */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Arrears <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleArrearsChange('yes')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.arrears === true ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleArrearsChange('no')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.arrears === false ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                >
                  No
                </button>
              </div>
              {formData.arrears === true && (
                <div className="mt-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    Number of Arrears <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="arrearsCount"
                    value={arrearsCount}
                    onChange={handleArrearsCountChange}
                    placeholder="Enter number of arrears"
                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                    required
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="col-span-1 sm:col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                disabled={Object.values(errors).some(error => error !== '')}
                className={`w-full sm:w-1/4 py-3 bg-[#00007F] text-white font-medium text-base rounded-lg hover:bg-[#000066] transition-colors ${Object.values(errors).some(error => error !== '') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileV;