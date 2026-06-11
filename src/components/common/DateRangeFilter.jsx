import { useState, useEffect } from "react";
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Start Date */}
        <div>
          <label
            htmlFor="start-date"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Start Date
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              min={minDateStr}
              max={maxDateStr}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="end-date"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            End Date
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              min={minDateStr}
              max={maxDateStr}
              disabled={!localStartDate}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Clear Button */}
      {(localStartDate || localEndDate) && (
        <button
          onClick={handleClear}
          className="flex items-center gap-2 text-sm text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
         aria-label="button">
          <X size={14} />
          Clear dates
        </button>
      )}

      {/* Date Range Display */}
      {localStartDate && localEndDate && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-2 dark:border-indigo-700 dark:bg-indigo-900/30">
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
