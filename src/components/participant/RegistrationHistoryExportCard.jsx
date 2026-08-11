import React, { useState } from 'react';

export const RegistrationHistoryExportCard = ({
  participantName = 'Jane Doe',
  onExportSubmit,
}) => {
  const [exportFormat, setExportFormat] = useState('CSV');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleExport = (e) => {
    e.preventDefault();
    if (onExportSubmit) {
      onExportSubmit({ exportFormat, startDate, endDate });
    }
    setSuccessMessage(`Participation history successfully exported as ${exportFormat}!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Export Participation History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          User: <span className="font-semibold text-gray-700 dark:text-gray-300">{participantName}</span>
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleExport} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Export Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="CSV">CSV (.csv)</option>
            <option value="PDF">PDF (.pdf)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Included Record Details:</p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc list-inside space-y-0.5">
            <li>Event name & Event date</li>
            <li>Registration date & Registration status</li>
            <li>Attendance status & Certificate status</li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Download History
        </button>
      </form>
    </div>
  );
};

export default RegistrationHistoryExportCard;
