import React, { useState } from 'react';
import './ApplyJob.css';

const ApplyJob = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        qualification: '',
        department: '',
        password:'',
        cpassword:'',
        state:"",
        cityname:"",
        yearOfPassing: '',
        collegeName: '',
        resume: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            resume: e.target.files[0],
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        // Clear form fields after submission
        setFormData({
            name: '',
            email: '',
            whatsapp: '',
            qualification: '',
            department: '',
            password:'',
            cpassword:'',
            yearOfPassing: '',
            collegeName: '',
            resume: null,
        });
    };

    return (
        <div className='apply-job-container'>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="input-group">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder='Name of the Student'
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder='Working EmailID'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder='Password'
                            value={formData.passowrd}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="cpassword"
                            placeholder='Confirm Password'
                            value={formData.cpassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>WhatsApp Number</label>
                        <input
                            type="text"
                            name="whatsapp"
                            placeholder='Mobile Number'
                            value={formData.whatsapp}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Highest Qualification</label>
                        <input
                            type="text"
                            name="qualification"
                            placeholder='Qualification'
                            value={formData.qualification}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>City Name</label>
                        <input
                            type="text"
                            name="cityname"
                            placeholder='City'
                            value={formData.cityname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>You are from which State </label>
                        <input
                            type="text"
                            name="state"
                            placeholder='State'
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>Department</label>
                        <input
                            type="text"
                            name="department"
                            placeholder='Which Branch'
                            value={formData.department}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Highest Qualification Year of Passing (Qualification)</label>
                        <input
                            type="text"
                            name="yearOfPassing"
                            placeholder='Year of Passing'
                            value={formData.yearOfPassing}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>College Name</label>
                        <input
                            type="text"
                            name="collegeName"
                            placeholder='College Name'
                            value={formData.collegeName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Resume</label>
                        <input
                            type="file"
                            name="resume"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                </div>
                <button className='btn'>Apply</button>
            </form>

        </div>
    );
};

export default ApplyJob;
