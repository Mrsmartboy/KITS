import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2/dist/sweetalert2.min.js";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { encryptData } from "../../cryptoUtils.jsx"; // Import encryption method
import "../Login/StudentLogin.css";

export default function SuperAdmin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Trim the email and password values
      const trimmedEmail = username.trim();
      const trimmedPassword = password.trim();

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin`,
        { username: trimmedEmail, password: trimmedPassword }
      );
      if (response.status === 200) {
        // Encrypt and store data in sessionStorage (clears on tab closure)
        const encryptedUserType = encryptData(response.data.userType);
        const encryptedLocation = encryptData("all");

        sessionStorage.setItem("userType", encryptedUserType);
        sessionStorage.setItem("location", encryptedLocation);

        
        const userRoutes = {
          Tester:"/testing",
          super: "/admin-dashboard",
          superAdmin: "/admin-dashboard",
        };

        const redirectTo = userRoutes[response.data.userType] || "/not-found";
        navigate(redirectTo); // Navigate to the relevant dashboard

        Swal.fire({
          title: "Login Successful",  
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Please check your internet connection and try again.",
        });
      } else if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Login failed. User not found",
        });
      } else if (error.response?.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Invalid credentials",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false); // Reset loading to false
    }
  };

  return (
    <div className="min-h-screen flex row items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8 student-login-container">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl space-y-8 md:space-y-0 md:space-x-8">
        <div className="flex justify-center items-center w-full md:w-1/2">
          <img
            src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849448/login-cartoon_znh33j.webp"
            alt="Cartoon logo"
            className="w-full max-w-lg"
          />
        </div>
        <div className="w-full md:w-1/3">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
              Tester Login
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Email ID
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full p-1 text-md border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  placeholder="Enter Your Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="block w-full p-1 text-md border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2 px-4 mt-0 text-2xl font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#0737EE] hover:bg-blue-700"
                }`}
                disabled={loading} // Disable button during loading
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}