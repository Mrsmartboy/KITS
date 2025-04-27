import React, { useState } from "react";

const Certificates = () => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const certificates = [
    { id: 1, name: "JavaScript Mastery", issuedDate: "1/22/2025" },
    { id: 2, name: "React Developer", issuedDate: "1/15/2025" },
    { id: 3, name: "TypeScript Expert", issuedDate: "1/10/2025" },
  ]; 

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate); // Open modal with certificate details
  };

  const closeModal = () => {
    setSelectedCertificate(null); // Close modal
  };

  return (
    <div className="bg-blue-100 p-6 md:p-10 rounded-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
        Available Certificates
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {certificate.name}
            </h3>
            <p className="text-gray-600 mb-6">
              Issued on: {certificate.issuedDate}
            </p>
            <button
              onClick={() => handleViewCertificate(certificate)}
              className="px-6 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-blue-600 transition"
            >
              View Certificate
            </button>
          </div>
        ))}
      </div>

      {/* Modal for displaying certificate */}
      {selectedCertificate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-10 rounded-lg shadow-lg relative max-w-3xl w-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              Certificate of Achievement
            </h2>
            <div className="border-4 border-gray-400 p-10 text-center">
              <p className="text-xl text-gray-600 mb-6">This certifies that</p>
              <h3 className="text-4xl font-bold text-gray-800 mb-6">
                John Doe
              </h3>
              <p className="text-xl text-gray-600 mb-6">
                has successfully completed
              </p>
              <h4 className="text-3xl font-semibold text-gray-800 mb-6">
                {selectedCertificate.name}
              </h4>
              <p className="text-lg text-gray-500">
                Issued on {selectedCertificate.issuedDate}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
