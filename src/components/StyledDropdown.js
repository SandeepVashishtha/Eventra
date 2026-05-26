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
  const listboxId = `dropdown-${label || placeholder}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

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

  const handleTriggerKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const handleOptionKeyDown = (event, opt) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(opt);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
      >
        <span
          className={`text-sm ${
            /* Fix #599: Added dark:text-gray-300 — placeholder had no dark mode color */
            !value ? "text-gray-400 dark:text-gray-300" : "text-gray-700 dark:text-gray-100"
          }`}
        >
          {value || placeholder}
        </span>
        <FiChevronDown
          className={`text-gray-400 dark:text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-label={label || placeholder}
            className="absolute mt-2 w-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {[placeholder, ...options].map((opt) => (
              <li
                key={opt}
                role="option"
                aria-selected={value === opt || (!value && opt === placeholder)}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(opt)}
                  onKeyDown={(event) => handleOptionKeyDown(event, opt)}
                  className={`w-full px-4 py-2 text-left text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 focus:bg-indigo-50 dark:focus:bg-gray-700 focus:outline-none text-gray-700 dark:text-gray-100 ${
                    value === opt
                      ? "font-semibold bg-indigo-100 dark:bg-indigo-900"
                      : ""
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
