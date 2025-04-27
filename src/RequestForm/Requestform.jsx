import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import axios from 'axios';
import { IndiaStatesCities } from '../IndiaStatesCities/IndiaStatesCities';
import './RequestForm.css';
// import cartoonStudent from '../images/cartoon_student.webp';

const RequestForm = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifying,setIsVerifying] = useState(false)

  const email = watch("email");
  const selectedState = watch("state");

  const qualifications = [
    { value: "graduation_completed", label: "Graduation (Completed)" },
    { value: "graduation_ongoing", label: "Graduation (Ongoing)" },
    { value: "post_graduation_completed", label: "Post Graduation (Completed)" },
    { value: "post_graduation_ongoing", label: "Post Graduation (Ongoing)" },
  ];

  const states = Object.keys(IndiaStatesCities)
    .sort((a, b) => a.localeCompare(b))
    .map(stateKey => ({
      value: stateKey,
      label: stateKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
    }));

  useEffect(() => {
    if (selectedState) {
      const cities = IndiaStatesCities[selectedState] || [];
      setCityOptions(cities.map(city => ({ value: city, label: city })));
    } else {
      setCityOptions([]);
    }
  }, [selectedState]);

  const onSubmit = async (data) => {
    if (!otpSent) {
      alert("Please send the OTP before submitting the form.");
      return;
    }

    if (!isOtpVerified) {
      alert("Please verify your email before submitting the form.");
      return;
    }

    try {
       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/requestform`, data);
      alert("Successful! Our career expert will be in touch with you.");
    } catch (error) {
      console.error('Error submitting form:', error);
      alert("Failed to submit the form. Please try again later.");
    }
  };
  const sendOtp = async () => {
    if (!email) {
      alert("Please enter a valid email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(  `${import.meta.env.VITE_BACKEND_URL}/api/v1/callrequest`, { email });
      setOtpSent(true);
      alert("OTP sent successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to send OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    setIsVerifying(true);
   
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/verifyotp`, { email, otp:parseInt(otp) });
      setIsOtpVerified(true);
      alert("OTP verified successfully!");
    } catch (error) {
      console.error(error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8 request-form-container'>
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl space-y-8 md:space-y-0 md:space-x-8">

        <div className="flex justify-center items-center w-full md:w-1/3">
          <div className="bg-gray-100 p-6 rounded-lg w-full max-w-4xl mx-auto mb-4">
            <h2 className="text-center text-2xl font-bold mb-6">Talk to Our Career Expert</h2>
            <form onSubmit={handleSubmit(onSubmit)}>

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-0">Name</label>
                <input 
                  type="text" 
                  {...register("name", { required: "Name is required" })} 
                  className="w-full p-1 border border-gray-300 rounded-md" 
                  placeholder="Enter your name" 
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-0">Email</label>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    {...register("email", { required: "Email is required" })} 
                    className="flex-1 p-1 border border-gray-300 rounded-md" 
                    placeholder="Enter your email" 
                  />
                  <button 
                    type="button" 
                    onClick={sendOtp} 
                    className={`p-1 text-white ${!email || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} rounded-md`}
                    disabled={!email || isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {otpSent && (
                <div className="mb-3">
                  <label className="block text-gray-700 font-medium mb-0">OTP</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      className="flex-1 p-1 border border-gray-300 rounded-md" 
                      placeholder="Enter OTP" 
                    />
                    <button 
                      type="button" 
                      onClick={verifyOtp} 
                      className={`p-2 text-white ${!otp || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} rounded-md`}
                      disabled={!otp || isSubmitting}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-0">Mobile Number</label>
                <input 
                  type="number" 
                  {...register("phnumber", { required: "Mobile number is required" })} 
                  className="w-full p-1 border border-gray-300 rounded-md" 
                  placeholder="Enter your mobile number" 
                />
                {errors.phnumber && <p className="text-red-500 text-sm mt-1">{errors.phnumber.message}</p>}
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-0">Qualification</label>
                <Select 
                  options={qualifications} 
                  onChange={(selectedOption) => setValue("qualification", selectedOption.value, { shouldValidate: true })} 
                  placeholder="Select your qualification" 
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-0">State</label>
                <Select 
                  options={states} 
                  onChange={(selectedOption) => setValue("state", selectedOption.value, { shouldValidate: true })} 
                  placeholder="Select your state" 
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-0">City</label>
                <Select 
                  options={cityOptions} 
                  onChange={(selectedOption) => setValue("city", selectedOption.value, { shouldValidate: true })} 
                  placeholder="Select your city" 
                  isDisabled={!cityOptions.length} 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-500 text-[#ffffff] font-semibold p-1 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        <div className='w-full md:w-1/3 hidden md:block'>
          <img src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/cartoon_student_grm5dl.webp" alt="Cartoon Student" className="w-4/3 h-auto" />
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
