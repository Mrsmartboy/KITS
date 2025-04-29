import React, { useState, useEffect } from 'react';
import { FaMale, FaFemale } from 'react-icons/fa';

const StudentProfileUpdateNew = () => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        age: '',
        gender: '',
        github: '',
        state: '',
        city: '',
        usn: '',
        qualification: '',
        college: '',
        passoutYear: '',
        department: '',
        qualYear: '',
        percentage: '',
        skills: '',
        tenthPercentage: '',
        tenthYear: '',
        twelfthPercentage: '',
        twelfthYear: '',
        arrears: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);

    const totalFields = 19; // Excluding age, which is auto-calculated

    // Calculate progress based on filled fields
    useEffect(() => {
        const filledFields = Object.keys(formData).filter(
            key => key !== 'age' && formData[key] !== ''
        ).length;
        const calculatedProgress = Math.round((filledFields / totalFields) * 100);
        setProgress(calculatedProgress);
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleDobChange = (e) => {
        const birthDate = new Date(e.target.value);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }
        setFormData(prev => ({
            ...prev,
            dob: e.target.value,
            age: calculatedAge >= 0 ? calculatedAge : ''
        }));
        setErrors(prev => ({ ...prev, dob: '' }));
    };

    const handleGenderSelect = (gender) => {
        setFormData(prev => ({ ...prev, gender }));
        setErrors(prev => ({ ...prev, gender: '' }));
    };

    const handleArrearsSelect = (arrears) => {
        setFormData(prev => ({ ...prev, arrears }));
        setErrors(prev => ({ ...prev, arrears: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.dob) newErrors.dob = 'Date of Birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.arrears) newErrors.arrears = 'Please select if you have arrears';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        // Simulate form submission
        setTimeout(() => {
            console.log('Form submitted:', formData);
            setIsSubmitting(false);
        }, 1000);
    };

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
                Student Registration
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
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your name"
                                className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.name ? 'border-red-500' : 'border-[#00007F]'}`}
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        {/* DOB + Age */}
                        <div className="flex items-end gap-4">
                            <div className="flex flex-col gap-2 w-[45%]">
                                <label className="text-[#00007F] font-medium text-lg">Date of Birth</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleDobChange}
                                        className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${errors.dob ? 'border-red-500' : 'border-[#00007F]'}`}
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
                            </div>
                            <span className="text-[#666666] text-base mb-3">(Years)</span>
                        </div>

                        {/* Gender Field */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1">
                                <label className="text-[#00007F] font-medium text-lg">Your Gender</label>
                                <div className="w-1.5 h-1.5 bg-[#EC5F70] rounded-full"></div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleGenderSelect('Male')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.gender === 'Male' ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                                >
                                    <FaMale className="w-6 h-6" />
                                    Male
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleGenderSelect('Female')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.gender === 'Female' ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                                >
                                    <FaFemale className="w-6 h-6" />
                                    Female
                                </button>
                            </div>
                            {errors.gender && <span className="text-red-500 text-sm">{errors.gender}</span>}
                        </div>

                        {/* Github Link */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Github Link</label>
                            <input
                                type="url"
                                name="github"
                                value={formData.github}
                                onChange={handleInputChange}
                                placeholder="Enter your Github link"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* State Dropdown */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">State</label>
                            <div className="relative">
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none"
                                >
                                    <option value="">Select State</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                </select>
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] text-lg">▼</span>
                            </div>
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Select City"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* College USN/ID Number */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">College USN/ID Number</label>
                            <input
                                type="text"
                                name="usn"
                                value={formData.usn}
                                onChange={handleInputChange}
                                placeholder="Enter your College USN/ID Number"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* Highest Qualification */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Highest Qualification</label>
                            <input
                                type="text"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleInputChange}
                                placeholder="Enter your Highest Qualification"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* Graduated College Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Graduated College Name (PG/UG)</label>
                            <input
                                type="text"
                                name="college"
                                value={formData.college}
                                onChange={handleInputChange}
                                placeholder="Enter your Graduated College Name"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* Graduation Passout Year */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Graduation Passout Year</label>
                            <input
                                type="text"
                                name="passoutYear"
                                value={formData.passoutYear}
                                onChange={handleInputChange}
                                placeholder="Enter your Graduation Passout Year"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* Department Dropdown */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Department</label>
                            <div className="relative">
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none"
                                >
                                    <option value="">Select Department</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="IT">IT</option>
                                    <option value="MECH">Mechanical</option>
                                    <option value="CIVIL">Civil</option>
                                    <option value="Other">Other</option>
                                </select>
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] text-lg">▼</span>
                            </div>
                        </div>

                        {/* Highest Qualification Year */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Highest Qualification Year of Passing</label>
                            <input
                                type="text"
                                name="qualYear"
                                value={formData.qualYear}
                                onChange={handleInputChange}
                                placeholder="Enter your Qualification Year"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* Percentage */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Percentage (Highest Graduation)</label>
                            <input
                                type="text"
                                name="percentage"
                                value={formData.percentage}
                                onChange={handleInputChange}
                                placeholder="Enter your Percentage"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* Skills Dropdown */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Skills</label>
                            <div className="relative">
                                <select
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none"
                                >
                                    <option value="">Select Skills</option>
                                    <option value="Python">Python</option>
                                    <option value="Java">Java</option>
                                    <option value="React">React</option>
                                    <option value="Node.js">Node.js</option>
                                    <option value="C++">C++</option>
                                </select>
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] text-lg">▼</span>
                            </div>
                        </div>

                        {/* 10th Percentage */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">10th Percentage</label>
                            <input
                                type="text"
                                name="tenthPercentage"
                                value={formData.tenthPercentage}
                                onChange={handleInputChange}
                                placeholder="Enter your 10th Percentage"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* 10th Passout Year */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">10th Passout Year</label>
                            <input
                                type="text"
                                name="tenthYear"
                                value={formData.tenthYear}
                                onChange={handleInputChange}
                                placeholder="Enter your 10th Passout Year"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* 12th Percentage */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">12th Percentage</label>
                            <input
                                type="text"
                                name="twelfthPercentage"
                                value={formData.twelfthPercentage}
                                onChange={handleInputChange}
                                placeholder="Enter your 12th Percentage"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* 12th Passout Year */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">12th Passout Year</label>
                            <input
                                type="text"
                                name="twelfthYear"
                                value={formData.twelfthYear}
                                onChange={handleInputChange}
                                placeholder="Enter your 12th Passout Year"
                                className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            />
                        </div>

                        {/* Arrears */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00007F] font-medium text-lg">Arrears</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleArrearsSelect('Yes')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.arrears === 'Yes' ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleArrearsSelect('No')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 w-full border rounded-lg text-[#00007F] font-medium text-sm ${formData.arrears === 'No' ? 'bg-[#00007F] text-white' : 'bg-white border-[#00007F]'}`}
                                >
                                    No
                                </button>
                            </div>
                            {errors.arrears && <span className="text-red-500 text-sm">{errors.arrears}</span>}
                        </div>

                        {/* Submit Button */}
                        <div className="col-span-1 sm:col-span-2 flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full sm:w-1/4 py-3 bg-[#00007F] text-white font-medium text-base rounded-lg hover:bg-[#000066] transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileUpdateNew;