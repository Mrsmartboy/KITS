import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import Select from 'react-select';

const TesterManagement = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    PhNumber: '',
    location: '',
    Designation: [],
  });
  const [countryCodes, setCountryCodes] = useState([]);
  const [testerCountryCode, setTesterCountryCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Updated emailRegex to allow any valid email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const locations = ['vijayawada', 'hyderabad', 'bangalore'];
  const designations = [
    "Python",
    "Flask",
    "Java",
    "AdvancedJava",
    "MySQL",
    "DataAnalytics",
    "Frontend",
    "SoftSkills",
    "Aptitude",
    "Statistics",
    "MachineLearning",
    "DeepLearning",
    "DSA",
    "Ckits",
    "DSAkits",
    "Pythonkits"
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/tester`);
      console.log('API response:', response.data);
      setData(Array.isArray(response.data.testers) ? response.data.testers : []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching testers:', error);
      setData([]);
      Swal.fire({
        icon: 'error',
        title: 'Failed to fetch testers',
        text: 'Unable to load tester data. Please try again later.',
      });
    }
  };

  const handleDesignationChange = (selectedOptions) => {
    setFormData({
      ...formData,
      Designation: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    });
  };

  useEffect(() => {
    axios
      .get("https://restcountries.com/v3.1/all")
      .then((response) => {
        const countryList = response.data
          .map((country) => ({
            value: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`,
            label: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`,
          }))
          .filter((country) => country.value !== "undefined");

        setCountryCodes(countryList);
        setTesterCountryCode(countryList.find((c) => c.value === "+91"));
      })
      .catch((error) => console.error("Error fetching country codes:", error));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (tester = null) => {
    if (tester) {
      const match = tester.PhNumber ? tester.PhNumber.match(/^(\+\d+)(\d{10})$/) : null;
      const countryCode = match ? match[1] : "+91";
      const extractedPhoneNumber = match ? match[2] : tester.PhNumber || "";

      setFormData({
        id: tester.id || '',
        name: tester.name || '',
        email: tester.email || '',
        PhNumber: extractedPhoneNumber,
        location: tester.location || locations[0],
        Designation: Array.isArray(tester.Designation) ? tester.Designation : [],
      });

      const foundCountryCode = countryCodes.find((c) => c.value === countryCode);
      setTesterCountryCode(foundCountryCode || { value: "+91", label: "+91" });
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        PhNumber: '',
        location: locations[0],
        Designation: [],
      });
      setTesterCountryCode({ value: "+91", label: "+91" });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
    setFormData({
      id: '',
      name: '',
      email: '',
      PhNumber: '',
      location: '',
      Designation: [],
    });
  };

  const isValidPhone = (PhNumber) => {
    const phoneRegex = /^[9876]\d{9}$/;
    if (!phoneRegex.test(PhNumber)) return false;
    if (/^(\d)\1{9}$/.test(PhNumber)) return false;
    return true;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.PhNumber || !formData.location) {
      Swal.fire({ icon: "error", title: "Please fill all fields." });
      return;
    }

    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email!",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!isValidPhone(formData.PhNumber)) {
      Swal.fire({
        icon: "error",
        title: "Invalid phone number. Enter a valid 10-digit number.",
      });
      return;
    }

    const formattedPhone = testerCountryCode?.value + formData.PhNumber;
    const isDuplicatePhone = data.some(
      (tester) =>
        tester.PhNumber === formattedPhone &&
        (formData.id ? tester.id !== formData.id : tester.email !== formData.email)
    );
    if (isDuplicatePhone) {
      Swal.fire({ icon: "error", title: "This phone number already exists." });
      return;
    }

    setIsSaving(true);

    const formattedData = {
      id: formData.id || undefined,
      name: formData.name,
      email: formData.email,
      PhNumber: formattedPhone,
      location: formData.location,
      Designation: formData.Designation,
    };

    try {
      let response;
      if (formData.id) {
        console.log('Sending PUT request:', { url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester`, params: { id: formData.id }, data: formattedData });
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester`,
          formattedData,
          { params: { id: formData.id } }
        );
      } else {
        console.log('Sending POST request:', { url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester`, data: formattedData });
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester`,
          formattedData
        );
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: formData.id ? "Updated successfully!" : "Added successfully!",
        });
        await fetchData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving tester:', error.response?.data);
      if (error.response) {
        const errorMessage = error.response.data.error || error.response.data.message || "Something went wrong!";
        if (error.response.status === 400) {
          Swal.fire({
            icon: "error",
            title: "Bad Request!",
            text: errorMessage,
          });
        } else if (error.response.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Tester Not Found!",
            text: errorMessage,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Operation failed!",
            text: errorMessage,
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Network Error!",
          text: "Unable to connect to the server. Please try again later.",
        });
      }
    }

    setIsSaving(false);
  };

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
          console.log('Sending DELETE request:', { url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester`, params: { id } });
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/tester`, {
            params: { id },
          });
          Swal.fire({ icon: "success", title: "Deleted successfully!" });
          await fetchData();
        } catch (error) {
          console.error('Error deleting tester:', error.response?.data);
          Swal.fire({
            icon: "error",
            title: "Failed to delete Tester.",
            text: error.response?.data?.error || "Something went wrong!",
          });
        }
      }
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(data)
    ? data.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil((Array.isArray(data) ? data.length : 0) / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`mx-1 px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto mt-0 px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Intern Management</h2>
      <div className="flex justify-end mb-4">
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => handleOpenModal()}
        >
          + Add Tester
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 text-left font-semibold text-gray-700">S.No</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Phone</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Location</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Designation</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id || item.email || index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{indexOfFirstItem + index + 1}</td>
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">{item.email}</td>
                  <td className="py-2 px-4">{item.PhNumber}</td>
                  <td className="py-2 px-4">{item.location}</td>
                  <td className="py-2 px-4">
                    {Array.isArray(item.Designation) ? item.Designation.join(', ') : 'N/A'}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-3"
                      onClick={() => handleOpenModal(item)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No testers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of{' '}
            {data.length} testers | Total Testers: {data.length}
          </div>
          <div className="flex items-center">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-1 px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
              {formData.id ? "Edit Tester" : "Add Tester"}
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter tester's name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-md p-2">
                  <Select
                    options={countryCodes}
                    value={testerCountryCode}
                    onChange={setTesterCountryCode}
                    placeholder="Select Code"
                    className="mr-2 w-1/3"
                  />
                  <input
                    type="number"
                    className="flex-1 px-2 py-1 text-gray-800 outline-none"
                    placeholder="Enter phone number"
                    value={formData.PhNumber}
                    onChange={(e) => setFormData({ ...formData, PhNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Designation
                </label>
                <Select
                  isMulti
                  options={designations.map((subject) => ({ value: subject, label: subject }))}
                  value={
                    Array.isArray(formData.Designation)
                      ? formData.Designation.map((subject) => ({
                          value: subject,
                          label: subject,
                        }))
                      : []
                  }
                  onChange={handleDesignationChange}
                  className="w-full border rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  {locations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </form>
            <div className="mt-6 flex justify-between">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 transition-all"
                }`}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : formData.id ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TesterManagement;