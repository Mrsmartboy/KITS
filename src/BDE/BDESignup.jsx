import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BDE.css';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';  
import axios from 'axios';

export default function BDELogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [cpasswordError, setCPasswordError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setCPasswordError('');

    // Validation
    let isValid = true;

    if (username.length < 3 || !isValidName(username)) {
      setNameError('Name must be at least three characters long and contain only letters.');
      isValid = false;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!isValidPassword(password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least six characters long.');
      isValid = false;
    }

    if (password !== cpassword) {
      setCPasswordError('Password and confirm passwords are not matching.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // If all validations pass, submit the data
    if(isValid){
      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/bdesignup`, { username, password, email })
          .then((response) => {
            if (response.status === 201) {
              Swal.fire({
                title: "SignUp Successful",
                icon: "success"
              });
              // Redirect to dashboard or another page
              navigate("/bdelogin");
          } 
            
          });
      } catch (error) {
        // Handle error
        Swal.fire({
          icon: "error",
          title: "Something went wrong!!!",
          text: "Please check the fields again"
        });
      }
    }
  };

  // Function to validate email format
  const isValidEmail = (value) => {
    // Regex pattern for email validation
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value);
  };

  // Function to validate name format
  const isValidName = (value) => {
    // Regex pattern for name validation (minimum three characters, only letters)
    const pattern = /^[a-zA-Z ]{3,}$/;
    return pattern.test(value);
  };

  // Function to validate password format
  const isValidPassword = (value) => {
    // Regex pattern for password validation (at least one uppercase, one lowercase, one number, at least six characters)
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return pattern.test(value);
  };

  return (
    <div className="login-container">
      <h1 style={{ color: "black" }}>BDE SignUp</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text" required
            placeholder="Name of BDE"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {nameError && <p style={{ color: 'red' }}>{nameError}</p>}
        </div>
        <div>
          <label>Email address</label>
          <input
            type="email" required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
        </div>

        <div>
          <label>Password</label>
          <input
            type="password" required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            type="password" required
            placeholder="Confirm Password"
            value={cpassword}
            onChange={(e) => setCPassword(e.target.value)}
          />
          {cpasswordError && <p style={{ color: 'red' }}>{cpasswordError}</p>}
        </div>
        <div className='forgot'>
          <button className="btn">Signup</button>
          {/* <Link className='forgot-password'>Forgot password?</Link> */}
        </div>
      </form>
      <div className='bottom-div'>
        <span style={{ color: "black" }}>Don't have an account? </span>
        <Link style={{ fontWeight: "bold" }} to="/bdelogin">Login Here</Link>
      </div>

    </div>
  );
}
