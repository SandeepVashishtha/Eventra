import React, { useState } from 'react';

export const CapacityAlertCard = ({
  eventTitle = 'Annual Developer Conference 2026',
  maxCapacity = 200,
  initialRegistrations = 180,
  initialThreshold = 90,
  onUpdateThreshold,
}) => {
  const [threshold, setThreshold] = useState(initialThreshold);
  const [currentRegistrations, setCurrentRegistrations] = useState(initialRegistrations);
  const [successMsg, setSuccessMsg] = useState('');

  const percentage = maxCapacity > 0 ? Math.round((currentRegistrations / maxCapacity) * 100) : 0;
  const isTriggered = percentage >= threshold;

  const handleThresholdChange = (newThresh) => {
    setThreshold(newThresh);
    if (onUpdateThreshold) {
      onUpdateThreshold({ threshold: newThresh });
    }
    setSuccessMsg(`Capacity alert threshold updated to ${newThresh}%.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Capacity Alert Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventTitle}</span>
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-500 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {isTriggered && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-500 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>⚠️ Warning: Event has reached {percentage}% capacity ({currentRegistrations}/{maxCapacity}). Threshold set at {threshold}%.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Registrations</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentRegistrations} / {maxCapacity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Fill Percentage</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          Configure Alert Threshold
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[50, 75, 90, 100].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleThresholdChange(t)}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                threshold === t
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {t}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapacityAlertCard;
