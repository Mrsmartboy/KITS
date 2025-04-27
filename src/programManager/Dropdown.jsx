import React from "react";

const Dropdown = ({ label, options, multiple, value, onChange }) => {
  const handleChange = (e) => {
    if (multiple) {
      const selectedOptions = Array.from(e.target?.selectedOptions || []).map((option) => option.value);
      onChange(selectedOptions); // Pass the selected options array to the parent
    } else {
      onChange(e.target.value); // Pass the single selected value to the parent
    }
  };

  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        multiple={multiple}
        value={value}
        onChange={handleChange} // Call handleChange on selection
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 bg-white"
      >
        {!multiple && <option value="">Select {label}</option>}
        {options.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
