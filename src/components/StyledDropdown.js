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
  const listboxId = useId();

  const allOptions = [placeholder, ...options];
  const selectedIndex = allOptions.findIndex((opt) => opt === value);
  const currentActiveIndex = activeIndex >= 0 ? activeIndex : Math.max(selectedIndex, 0);

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

  const openWithSelectedOption = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const toggleDropdown = () => {
    setOpen((prev) => {
      if (!prev) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return !prev;
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        handleSelect(allOptions[currentActiveIndex]);
      } else {
        openWithSelectedOption();
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openWithSelectedOption();
        return;
      }

      setActiveIndex((prev) =>
        event.key === "ArrowDown"
          ? Math.min(prev + 1, allOptions.length - 1)
          : Math.max(prev - 1, 0),
      );
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      {label && (
        <span
          id={labelId}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </span>
      )}

      <button
        ref={buttonRef}
        type="button"
        className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 text-left shadow-sm transition-all hover:ring-2 hover:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
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
          className={`text-gray-400 transition-transform dark:text-gray-500 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={label ? labelId : undefined}
            aria-activedescendant={`${listboxId}-option-${currentActiveIndex}`}
            onKeyDown={handleKeyDown}
          >
            {allOptions.map((opt, index) => (
              <li
                key={opt}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={value === opt || (!value && opt === placeholder)}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 dark:text-gray-100 dark:hover:bg-gray-700 ${
                  index === currentActiveIndex ? "bg-indigo-50 dark:bg-gray-700" : ""
                } ${
                  value === opt || (!value && opt === placeholder)
                    ? "bg-indigo-100 font-semibold dark:bg-indigo-900"
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
