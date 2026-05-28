import React, { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString !== "string") return new Date(dateString);
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * DateRangeFilter Component
 * Allows users to select start and end dates for filtering events
 */
const DateRangeFilter = ({
  onDateRangeChange,
  minDate,
  maxDate,
  startDate,
  endDate,
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");

  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: parseLocalDate(localStartDate),
        endDate: parseLocalDate(localEndDate),
      });
    }
  }, [localStartDate, localEndDate, onDateRangeChange]);

  const handleClear = () => {
    setLocalStartDate("");
    setLocalEndDate("");
  };

  // Format min/max dates for input elements (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const minDateStr = formatDateForInput(minDate || new Date());
  const maxDateStr = formatDateForInput(maxDate || parseLocalDate("2099-12-31"));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Start Date */}
        <div>
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              min={minDateStr}
              max={maxDateStr}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              min={minDateStr}
              max={maxDateStr}
              disabled={!localStartDate}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Clear Button */}
      {(localStartDate || localEndDate) && (
        <button aria-label="button"
          onClick={handleClear}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          <X size={14} />
          Clear dates
        </button>
      )}

      {/* Date Range Display */}
      {localStartDate && localEndDate && (
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            {parseLocalDate(localStartDate).toLocaleDateString()} -
            {parseLocalDate(localEndDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
