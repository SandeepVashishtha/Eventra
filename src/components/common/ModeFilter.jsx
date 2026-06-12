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
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Event Mode</h3>
      <div className="grid grid-cols-1 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => toggleMode(mode.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
              selectedModes.includes(mode.id)
                ? "border border-green-300 bg-green-100 text-green-700 dark:border-green-600 dark:bg-green-900/40 dark:text-green-300"
                : "border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${
                selectedModes.includes(mode.id)
                  ? "border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500"
                  : "border-gray-400 dark:border-gray-500"
              }`}
            >
              {selectedModes.includes(mode.id) && <Check size={12} className="text-white" />}
            </div>
            <span className="flex-1">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeFilter;
