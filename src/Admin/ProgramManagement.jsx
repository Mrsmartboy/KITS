import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';

const ProgramManagement = () => {
  const [data, setData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({  name: '', email: '', PhNumber: '', location: '', userType: 'manager' });

  const locations = ["KITS"];
  const [countryCodes, setCountryCodes] = useState([]);
const [selectedCountryCode, setSelectedCountryCode] = useState(null);
const [phoneNumber, setPhoneNumber] = useState(""); // Store only the number
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;




  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/manager`);

      setData(response.data.managers);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    }
  };

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all")
      .then((response) => {
        const countryList = response.data
          .map(country => ({
            value: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`,
            label: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`
          }))
          .filter(country => country.value !== "undefined");
  
        setCountryCodes(countryList);
        setSelectedCountryCode(countryList.find(c => c.value === "+91")); // Default: India
      })
      .catch(error => console.error("Error fetching country codes:", error));
  }, []);
  

  // Fetch BDE data from API
  useEffect(() => {
 

    fetchData();
  }, []);

  // Open Add/Edit Modal
  const handleOpenModal = (manager = null) => {
    if (manager) {
      // Extract country code and phone number properly
      const match = manager.PhNumber ? manager.PhNumber.match(/^(\+\d+)(\d{10})$/) : null;
      const countryCode = match ? match[1] : "+91"; // Default to India if not found
      const extractedPhoneNumber = match ? match[2] : "";
      
      setFormData({
        id: manager.id,
        name: manager.name || '',
        email: manager.email || '',
        location: manager.location || locations[0],
        userType: "manager",
      });
      
      setPhoneNumber(extractedPhoneNumber);
      const foundCountryCode = countryCodes.find(c => c.value === countryCode);
      setSelectedCountryCode(foundCountryCode || { value: "+91", label: "+91" });
    } else {
      setFormData({
        name: '',
        email: '',
        location: locations[0],
        userType: "manager",
      });
      
      setSelectedCountryCode({ value: "+91", label: "+91" });
      setPhoneNumber("");
    }
  
    setIsModalOpen(true);
  };
  
  
  
  

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
    setFormData({ name: '', email: '', PhNumber: '', location: '', userType: 'manager' });
  };

  // Validate Email


  // Validate Phone Number
  const isValidPhone = (PhNumber) => {
    const phoneRegex =/^[9876]\d{9}$/;
    return phoneRegex.test(PhNumber);
  };



  // Save BDE (Add/Edit)
  const handleSave = async () => {
    if (!formData.name || !formData.email || !phoneNumber || !formData.location) {
      Swal.fire({ icon: "error", title: "Please fill all fields." });
      return;
    }
  
    if (!emailRegex.test(formData.email)) {
      Swal.fire({ 
          icon: "error", 
          title: "Invalid Email!", 
          text: "Only  email addresses  are allowed." 
      });
      return;
  }
  
    if (!isValidPhone(phoneNumber)) {
      Swal.fire({ icon: "error", title: "Invalid phone number. Enter a valid 10-digit number." });
      return;
    }
  
  
    setIsSaving(true); // Start loading state

    const formattedData = {
      ...formData,
      PhNumber: selectedCountryCode?.value + phoneNumber, // ✅ Append country code
    };
  
    try {
      let response;
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/manager`;
  
      if (formData.id) {
        // 🔹 Update Existing Manager (PUT request)
        response = await axios.put(apiUrl, formattedData);
      } else {
        // 🔹 Add New Manager (POST request)
        response = await axios.post(apiUrl, formattedData);
      }
  
      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: formData.id ? "Manager updated successfully!" : "Manager added successfully!",
        });
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        const errorMessage = error.response.data.message || "Something went wrong!";
        const status = error.response.status;
  
        if (status === 400) {
          Swal.fire({ icon: "error", title: "Bad Request!", text: errorMessage });
        } else if (status === 404) {
          Swal.fire({ icon: "error", title: "Already Exists!", text: errorMessage });
        } else {
          Swal.fire({ icon: "error", title: "Operation failed!", text: errorMessage });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Network Error!",
          text: "Unable to connect to the server. Please try again later.",
        });
      }
    }
  
    setIsSaving(false); // Stop loading state
    handleCloseModal();
  };
  

  // Delete Manager
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Sending the ID as a parameter in the request body
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/manager`, {
            params: { id }, 
          });
          const filteredData = data.filter((bde) => bde.id !== id);
          setData(filteredData);
          Swal.fire({ icon: "success", title: "Deleted successfully!" });
        } catch (error) {
          Swal.fire({ icon: "error", title: "Failed to delete Manager." });
        }
      }
    });
    fetchData()
  };
  return (
    <div className="container mx-auto mt-0 px-4 py-5">
      <h2 className="text-2xl font-bold mb-6 text-center">Program Management</h2>
      <div className="flex justify-end mb-4">
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => handleOpenModal()}
        >
          + Add Manager
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Phone</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Location</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">User Type</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.map((item,index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.email}</td>
                <td className="py-2 px-4">{item.PhNumber}</td>
                <td className="py-2 px-4">{item.location}</td>
                <td className="py-2 px-4">{item.usertype}</td>
                <td className="py-2 px-4">
                  <button
                    className="text-blue-500 hover:text-blue-700 mr-3"
                    onClick={() => handleOpenModal(item)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(item.id)} // Deleting by ID
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">{formData.id ? 'Edit Manager' : 'Add Manager'}</h3>
            <form className="space-y-4">
              <input
                type="text"
                className="w-full px-4 py-2 border rounded focus:outline-none"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                className="w-full px-4 py-2 border rounded focus:outline-none"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <select
                  className="mr-2 p-2 border rounded"
                  value={selectedCountryCode?.value}
                  onChange={(e) =>
                    setSelectedCountryCode(
                      countryCodes.find(c => c.value === e.target.value) || { value: "+91", label: "+91" }
                    )
                  }
                >
                  {countryCodes.map((code, index) => (
                    <option key={index} value={code.value}>
                      {code.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="flex-1 px-2 py-1 text-gray-800 outline-none"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

              <select
                className="w-full px-4 py-2 border rounded focus:outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            
            </form>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={handleSave}
                disabled={isSaving} // Disable the button during saving
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;
