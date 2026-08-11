import React, { useState } from 'react';

export const CancellationReasonCard = ({
  eventName = 'Cloud Native Summit 2026',
  onCancelSubmit,
}) => {
  const [selectedReason, setSelectedReason] = useState('SCHEDULE_CONFLICT');
  const [optionalExplanation, setOptionalExplanation] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const reasons = [
    { id: 'SCHEDULE_CONFLICT', label: 'Schedule conflict' },
    { id: 'PERSONAL_REASONS', label: 'Personal reasons' },
    { id: 'EVENT_LOCATION', label: 'Event location' },
    { id: 'EVENT_TIMING', label: 'Event timing' },
    { id: 'FOUND_ANOTHER_EVENT', label: 'Found another event' },
    { id: 'OTHER', label: 'Other' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCancelSubmit) {
      onCancelSubmit({ reason: selectedReason, optionalExplanation });
    }
    setSuccessMsg('Registration cancelled successfully. Thank you for your feedback.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Cancel Registration
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventName}</span>
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Please select a reason for cancellation (Optional):
          </label>
          <div className="space-y-2">
            {reasons.map((r) => (
              <label key={r.id} className="flex items-center space-x-3 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                <input
                  type="radio"
                  name="cancellationReason"
                  value={r.id}
                  checked={selectedReason === r.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Additional details or explanation (Optional)
          </label>
          <textarea
            value={optionalExplanation}
            onChange={(e) => setOptionalExplanation(e.target.value)}
            placeholder="Share any further feedback for the organizers..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition"
        >
          Confirm Cancellation
        </button>
      </form>
    </div>
  );
};

export default CancellationReasonCard;
