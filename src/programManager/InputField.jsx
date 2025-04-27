import React from "react";

const InputField = ({ label, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 bg-white"
      />
    </div>
  );
};

export default InputField;
