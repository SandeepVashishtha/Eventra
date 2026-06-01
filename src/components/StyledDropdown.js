import React from "react";

const Dropdown = ({ label, value, options = [], onChange, placeholder = "Select" }) => {
  const handleSelectChange = (e) => {
    if (onChange && typeof onChange === "function") {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full sm:w-64">
      {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <select
        value={value || ""}
        onChange={handleSelectChange}
        className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800"
        aria-label={label || placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
