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
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Event Status</h3>
      <div className="grid grid-cols-1 gap-2">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => toggleStatus(status.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
              selectedStatuses.includes(status.id)
                ? "border border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-600 dark:bg-purple-900/40 dark:text-purple-300"
                : "border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${
                selectedStatuses.includes(status.id)
                  ? "border-purple-600 bg-purple-600 dark:border-purple-500 dark:bg-purple-500"
                  : "border-gray-400 dark:border-gray-500"
              }`}
            >
              {selectedStatuses.includes(status.id) && <Check size={12} className="text-white" />}
            </div>
            <span className="flex-1">{status.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
