import React, { useState } from 'react';

export const EventDuplicationCard = ({
  sourceEventTitle = 'Annual Tech Conference 2025',
  onDuplicateSubmit,
}) => {
  const [newEventTitle, setNewEventTitle] = useState(`${sourceEventTitle} - 2026`);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newVenue, setNewVenue] = useState('Main Convention Hall');
  const [newCapacity, setNewCapacity] = useState(250);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDuplicate = (e) => {
    e.preventDefault();
    if (onDuplicateSubmit) {
      onDuplicateSubmit({
        newEventTitle,
        newStartDate,
        newEndDate,
        newVenue,
        newCapacity,
      });
    }
    setSuccessMessage(`Successfully duplicated "${sourceEventTitle}" into "${newEventTitle}"!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Duplicate Event
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Source Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{sourceEventTitle}</span>
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleDuplicate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            New Event Title
          </label>
          <input
            type="text"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              New Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              New End Date & Time
            </label>
            <input
              type="datetime-local"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              New Venue
            </label>
            <input
              type="text"
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              New Capacity
            </label>
            <input
              type="number"
              value={newCapacity}
              onChange={(e) => setNewCapacity(parseInt(e.target.value) || 0)}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Copied Sections Included:</p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc list-inside space-y-0.5">
            <li>Description, Category, Rules, and FAQ</li>
            <li>Registration settings & Custom registration fields</li>
            <li>Event resources and attachments</li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Duplicate Event
        </button>
      </form>
    </div>
  );
};

export default EventDuplicationCard;
