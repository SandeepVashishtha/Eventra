import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useReducedMotion from "../hooks/useReducedMotion";

const Dropdown = ({ label, value, options, onChange, placeholder = "Select" }) => {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const labelId = useId();
  const listboxId = useId();
  const allOptions = [placeholder, ...options];
  
  // Derived state: keep selection index in sync
  const selectedIndex = allOptions.indexOf(value) !== -1 ? allOptions.indexOf(value) : 0;

  // Cleanup effect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val === placeholder ? "" : val);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const toggleDropdown = () => {
    if (!open) setActiveIndex(selectedIndex);
    setOpen(!open);
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Escape":
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((prev) => Math.min(prev + 1, allOptions.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
      case " ":
        if (open && activeIndex >= 0) {
          event.preventDefault();
          handleSelect(allOptions[activeIndex]);
        } else if (!open) {
          event.preventDefault();
          setOpen(true);
        }
        break;
    }
  };

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      {label && <label id={labelId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:ring-2 hover:ring-indigo-500 transition-all"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${labelId} ${listboxId}-value` : undefined}
      >
        <span id={`${listboxId}-value`} className={!value ? "text-gray-400" : "text-gray-900 dark:text-white"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            className="absolute mt-2 w-full z-50 bg-white dark:bg-gray-800 border rounded-xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {allOptions.map((opt, index) => (
              <li
                key={opt}
                role="option"
                aria-selected={index === selectedIndex}
                className={`px-4 py-2 cursor-pointer ${index === activeIndex ? "bg-indigo-50 dark:bg-gray-700" : ""}`}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(index)}
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