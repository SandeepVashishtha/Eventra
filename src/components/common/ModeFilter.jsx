import React from "react";
import { Check } from "lucide-react";

/**
 * ModeFilter Component
 * Filter for event mode (online/offline/hybrid)
 */
const ModeFilter = ({ modes, selectedModes, onModeChange }) => {
  const toggleMode = (modeId) => {
    if (selectedModes.includes(modeId)) {
      onModeChange(selectedModes.filter((id) => id !== modeId));
    } else {
      onModeChange([...selectedModes, modeId]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Event Mode
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => toggleMode(mode.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
              selectedModes.includes(mode.id)
                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                selectedModes.includes(mode.id)
                  ? "bg-green-600 dark:bg-green-500 border-green-600 dark:border-green-500"
                  : "border-gray-400 dark:border-gray-500"
              }`}
            >
              {selectedModes.includes(mode.id) && (
                <Check size={12} className="text-white" />
              )}
            </div>
            <span className="flex-1">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeFilter;
