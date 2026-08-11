import React, { useState } from 'react';

export const EventDeadlineExtension = ({ eventTitle = 'Sample Event', currentDeadline = '2026-08-30T23:59', onExtendDeadline }) => {
  const [newDeadline, setNewDeadline] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleExtensionSubmit = (e) => {
    e.preventDefault();
    if (!newDeadline) {
      setError('Please select a new deadline.');
      return;
    }

    if (new Date(newDeadline) <= new Date(currentDeadline)) {
      setError('New deadline must be later than the current deadline.');
      return;
    }

    setError('');
    if (onExtendDeadline) {
      onExtendDeadline({
        currentDeadline,
        newDeadline,
        extensionReason,
        notifyUsers,
      });
    }

    setSuccessMessage(`Registration deadline successfully extended to ${newDeadline}.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Extend Registration Deadline
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventTitle}</span>
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleExtensionSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Current Deadline
          </label>
          <input
            type="text"
            disabled
            value={currentDeadline}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            New Deadline *
          </label>
          <input
            type="datetime-local"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Reason for Extension (Optional)
          </label>
          <textarea
            value={extensionReason}
            onChange={(e) => setExtensionReason(e.target.value)}
            placeholder="e.g., High demand and remaining event capacity..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="notifyUsers"
            checked={notifyUsers}
            onChange={(e) => setNotifyUsers(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="notifyUsers" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notify interested users and participants about the deadline extension
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Confirm Deadline Extension
        </button>
      </form>
    </div>
  );
};

export default EventDeadlineExtension;
