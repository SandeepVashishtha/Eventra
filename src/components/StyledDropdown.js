import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val === placeholder ? "" : val);
    setOpen(false);
  };

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div
        className="flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className={`text-sm ${
            !value ? "text-gray-400" : "text-gray-700 dark:text-gray-200"
          }`}
        >
          {value || placeholder}
        </span>
        <FiChevronDown className="text-gray-400 dark:text-gray-500" />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="absolute mt-2 w-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {[placeholder, ...options].map((opt) => (
              <li
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${
                  value === opt
                    ? "font-semibold bg-indigo-100 dark:bg-indigo-900"
                    : ""
                }`}
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
