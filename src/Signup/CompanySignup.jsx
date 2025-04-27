import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CompanySignup = () => {
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    city: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let formIsValid = true;
    const newErrors = {};

    // Name validation
    if (companyData.name.trim().length < 3 || /[^a-zA-Z\s]/.test(companyData.name)) {
      newErrors.name = 'Name must be at least 3 characters long and contain only letters';
      formIsValid = false;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(companyData.email)) {
      newErrors.email = 'Invalid email address';
      formIsValid = false;
    }

    // Password validation
    if (companyData.password.length < 6 || !/\d/.test(companyData.password)) {
      newErrors.password = 'Password must be at least 6 characters long and contain at least one digit';
      formIsValid = false;
    }

    if (companyData.password !== companyData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      formIsValid = false;
    }

    // Mobile number validation
    if (!/^\d{10}$/.test(companyData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits long';
      formIsValid = false;
    }

    // City validation
    if (companyData.city === '') {
      newErrors.city = 'City name must not be empty';
      formIsValid = false;
    }

    if (formIsValid) {
      // Submit the form
      axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/companysignup`, companyData)
        .then(response => {
          if (response.status === 200) {
            alert("Company Signup Successful")
            navigate('/login');
          }
        })
        .catch(error => {
          console.error('Error sending data:', error);
        });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className='student-signup-parent'>
      <form onSubmit={handleSubmit} className='form-student-signup'>
        <div>
          <input type="text" placeholder='Company name' name="name" value={companyData.name} onChange={handleChange} required />
          {errors.name && <p style={{color: 'red'}}>{errors.name}</p>}
        </div>
        
        <div>
          <input type="email" placeholder='EmailID' name="email" value={companyData.email} onChange={handleChange} required />
          {errors.email && <p style={{color: 'red'}}>{errors.email}</p>}
        </div>
        <div>
          <input type="password" placeholder='Password' name="password" value={companyData.password} onChange={handleChange} required />
          {errors.password && <p style={{color: 'red'}}>{errors.password}</p>}
        </div>
        <div>
          <input type="password" placeholder='Confirm Password' name="confirmPassword" value={companyData.confirmPassword} onChange={handleChange} required />
          {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
        </div>
        <div>
          <input type="tel" placeholder='Mobile Number' name="mobileNumber" value={companyData.mobileNumber} onChange={handleChange} required />
          {errors.mobileNumber && <p style={{color: 'red'}}>{errors.mobileNumber}</p>}
        </div>
        <div>
          <input type="text" placeholder='City' name="city" value={companyData.city} onChange={handleChange} required />
          {errors.city && <p style={{color: 'red'}}>{errors.city}</p>}
        </div>
        <button className='btn'>Register</button>
        <div className='login-here'>
          <p>Already have an account?<Link style={{fontWeight:"bold"}} to="/login">Login Here</Link> </p>
        </div>
      </form>
    </div>
  );
};

export default CompanySignup;
