import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import useReducedMotion from "../hooks/useReducedMotion";

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const labelId = useId();
  const allOptions = [placeholder, ...options];
  const selectedIndex = allOptions.findIndex((opt) => opt === value);
  const currentActiveIndex = activeIndex >= 0 ? activeIndex : Math.max(selectedIndex, 0);
  const listboxId = `dropdown-${label || placeholder}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

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
    setOpen((prev) => {
      if (!prev) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return !prev;
    });
  };

  const handleButtonKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        handleSelect(allOptions[currentActiveIndex]);
      } else {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => {
        const startIndex = prev >= 0 ? prev : Math.max(selectedIndex, 0);
        return event.key === "ArrowDown"
          ? Math.min(startIndex + 1, allOptions.length - 1)
          : Math.max(startIndex - 1, 0);
      });
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const handleListboxKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        event.key === "ArrowDown"
          ? Math.min(prev + 1, allOptions.length - 1)
          : Math.max(prev - 1, 0),
      );
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(allOptions[currentActiveIndex]);
    }
  };

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      {label && (
        <span
          id={labelId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </span>
      )}

      <button
        ref={buttonRef}
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all text-left"
        onClick={toggleDropdown}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? `${labelId} ${listboxId}-value` : undefined}
        aria-label={!label ? placeholder : undefined}
      >
        <span
          id={`${listboxId}-value`}
          className={`text-sm ${
            !value
              ? "text-gray-400 dark:text-gray-300"
              : "text-gray-700 dark:text-gray-100"
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
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            tabIndex={-1}
            aria-labelledby={label ? labelId : undefined}
            aria-activedescendant={`${listboxId}-option-${currentActiveIndex}`}
            onKeyDown={handleListboxKeyDown}
          >
            {allOptions.map((opt, index) => (
              <li
                key={opt}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={value === opt || (!value && opt === placeholder)}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 ${
                  index === currentActiveIndex ? "bg-indigo-50 dark:bg-gray-700" : ""
                } ${
                  value === opt || (!value && opt === placeholder)
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
