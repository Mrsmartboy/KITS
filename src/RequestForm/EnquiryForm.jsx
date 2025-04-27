import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const EnquiryForm = () => {
  const [formData, setFormData] = useState({
    SingleLine: "",
    Email: "",
    PhoneNumber_countrycodeval: "+91",
    PhoneNumber_countrycode: "",
    Dropdown: "",
    Dropdown1: "",
  });

  const [countryCodes, setCountryCodes] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch country codes on component mount
  useEffect(() => {
    axios
      .get("https://restcountries.com/v3.1/all")
      .then((response) => {
        const countryList = response.data
          .map((country) => {
            const countryCode = `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;
            return {
              value: countryCode,
              label: `${country.name.common} (${countryCode})`,
              cca3: country.cca3,
            };
          })
          .filter((country) => country.value && country.value !== "undefined")
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountryCodes(countryList);
        setFormData((prevState) => ({
          ...prevState,
          PhoneNumber_countrycodeval: countryList.find((c) => c.value === "+91")?.value || "+91",
        }));
      })
      .catch((error) => console.error("Error fetching country codes:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Full Name: Alphabets and spaces only
    if (!formData.SingleLine.trim()) {
      newErrors.SingleLine = "Full Name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.SingleLine.trim())) {
      newErrors.SingleLine = "Full Name must contain only letters and spaces.";
    }

    // Email validation
    if (!formData.Email.trim()) {
      newErrors.Email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = "Invalid email format.";
    }

    // Country code validation
    if (!formData.PhoneNumber_countrycodeval) {
      newErrors.PhoneNumber_countrycodeval = "Country code is required.";
    }

    // Phone number: Exactly 10 digits
    if (!formData.PhoneNumber_countrycode.trim()) {
      newErrors.PhoneNumber_countrycode = "Phone number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.PhoneNumber_countrycode.trim())) {
      newErrors.PhoneNumber_countrycode = "Phone number must be exactly 10 digits.";
    }

    // Course validation
    if (!formData.Dropdown || formData.Dropdown === "-Select-") {
      newErrors.Dropdown = "Please select a course.";
    }

    // Location validation
    if (!formData.Dropdown1 || formData.Dropdown1 === "-Select-") {
      newErrors.Dropdown1 = "Please select a location.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("SingleLine", formData.SingleLine);
        formDataToSend.append("Email", formData.Email);
        formDataToSend.append("PhoneNumber_countrycodeval", formData.PhoneNumber_countrycodeval);
        formDataToSend.append("PhoneNumber_countrycode", formData.PhoneNumber_countrycode);
        formDataToSend.append("Dropdown", formData.Dropdown);
        formDataToSend.append("Dropdown1", formData.Dropdown1);
        formDataToSend.append("Dropdown5", formData.Dropdown1);
        formDataToSend.append("zf_referrer_name", "");
        formDataToSend.append("zf_redirect_url", "");
        formDataToSend.append("zc_gad", "");

        console.log("FormData payload:", [...formDataToSend]);

        await fetch(
          "https://forms.zohopublic.in/codegnan/form/RequestForm/formperma/evL8hf7qScDONAR02QE0_9JRP7LZYG9nDYhaQoDhkRs/htmlRecords/submit",
          {
            method: "POST",
            body: formDataToSend,
            mode: "no-cors",
          }
        );

        Swal.fire({
          title: "Success!",
          text: "Our Team will contact you soon!!",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });

        setFormData({
          SingleLine: "",
          Email: "",
          PhoneNumber_countrycodeval: "+91",
          PhoneNumber_countrycode: "",
          Dropdown: "",
          Dropdown1: "",
        });
        setErrors({});
      } catch (error) {
        console.error("Submission error:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to submit the form. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849445/login-bg_mn4squ.webp')",
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl space-y-8 md:space-y-0 md:space-x-8">
        <div className="flex justify-center items-center w-full md:w-1/2">
          <img
            src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849448/login-cartoon_znh33j.webp"
            alt="Cartoon logo"
            className="w-full max-w-lg"
          />
        </div>
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Request Form
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <style>
              {`
                select {
                  transition: all 0.3s ease-in-out;
                }
                select:focus {
                  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
                }
                select option {
                  padding: 8px;
                }
                select::-webkit-scrollbar {
                  width: 8px;
                }
                select::-webkit-scrollbar-thumb {
                  background-color: #3b82f6;
                  border-radius: 4px;
                }
                select {
                  scrollbar-width: thin;
                  scrollbar-color: #3b82f6 #e5e7eb;
                }
              `}
            </style>

            <div>
              <label
                htmlFor="SingleLine"
                className="block text-sm font-semibold text-gray-700"
              >
                Full Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="SingleLine"
                name="SingleLine"
                value={formData.SingleLine}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-900 ${
                  errors.SingleLine ? "border-red-500" : ""
                }`}
                placeholder="Enter your full name"
              />
              {errors.SingleLine && (
                <p className="text-sm text-red-500 mt-1">{errors.SingleLine}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="Email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-900 ${
                  errors.Email ? "border-red-500" : ""
                }`}
                placeholder="Enter your email"
              />
              {errors.Email && (
                <p className="text-sm text-red-500 mt-1">{errors.Email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="PhoneNumber_countrycodeval"
                className="block text-sm font-semibold text-gray-700"
              >
                Phone<span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <select
                  id="PhoneNumber_countrycodeval"
                  name="PhoneNumber_countrycodeval"
                  value={formData.PhoneNumber_countrycodeval}
                  onChange={handleChange}
                  className={`mt-1 block w-1/3 rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 bg-white text-gray-900 ${
                    errors.PhoneNumber_countrycodeval ? "border-red-500" : ""
                  }`}
                >
                  {countryCodes.map((country) => (
                    <option
                      key={`${country.cca3}-${country.value}`}
                      value={country.value}
                    >
                      {country.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="PhoneNumber_countrycode"
                  name="PhoneNumber_countrycode"
                  value={formData.PhoneNumber_countrycode}
                  onChange={handleChange}
                  className={`mt-1 block w-2/3 rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-900 ${
                    errors.PhoneNumber_countrycode ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {(errors.PhoneNumber_countrycodeval ||
                errors.PhoneNumber_countrycode) && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.PhoneNumber_countrycodeval ||
                    errors.PhoneNumber_countrycode}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="Dropdown"
                className="block text-sm font-semibold text-gray-700"
              >
                Course<span className="text-red-500">*</span>
              </label>
              <select
                id="Dropdown"
                name="Dropdown"
                value={formData.Dropdown}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 bg-white text-gray-900 ${
                  errors.Dropdown ? "border-red-500" : ""
                }`}
              >
                <option value="-Select-">Select a course</option>
                <option value="Python Full Stack">Python Full Stack</option>
                <option value="Java Full Stack">Java Full Stack</option>
                <option value="Data Science">Data Science</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="C Programming">C Programming</option>
              </select>
              {errors.Dropdown && (
                <p className="text-sm text-red-500 mt-1">{errors.Dropdown}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="Dropdown1"
                className="block text-sm font-semibold text-gray-700"
              >
                Preferred Location<span className="text-red-500">*</span>
              </label>
              <select
                id="Dropdown1"
                name="Dropdown1"
                value={formData.Dropdown1}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 bg-white text-gray-900 ${
                  errors.Dropdown1 ? "border-red-500" : ""
                }`}
              >
                <option value="-Select-">Select preferred location</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Online">Online</option>
                <option value="Others">Others</option>
              </select>
              {errors.Dropdown1 && (
                <p className="text-sm text-red-500 mt-1">{errors.Dropdown1}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;