import React from "react";
import { Check } from "lucide-react";

/**
 * StatusFilter Component
 * Filter for event status (upcoming/ongoing/past)
 */
const StatusFilter = ({ statuses, selectedStatuses, onStatusChange }) => {
  const toggleStatus = (statusId) => {
    if (selectedStatuses.includes(statusId)) {
      onStatusChange(selectedStatuses.filter((id) => id !== statusId));
    } else {
      onStatusChange([...selectedStatuses, statusId]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Event Status
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => toggleStatus(status.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
              selectedStatuses.includes(status.id)
                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                selectedStatuses.includes(status.id)
                  ? "bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500"
                  : "border-gray-400 dark:border-gray-500"
              }`}
            >
              {selectedStatuses.includes(status.id) && (
                <Check size={12} className="text-white" />
              )}
            </div>
            <span className="flex-1">{status.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
