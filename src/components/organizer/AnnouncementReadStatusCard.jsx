import React, { useState } from 'react';

export const AnnouncementReadStatusCard = ({
  announcementTitle = 'Venue Change Notice for Main Auditorium',
  totalRecipients = 200,
  viewedCount = 150,
  onSendReminder,
}) => {
  const [reminderSent, setReminderSent] = useState(false);

  const unviewedCount = Math.max(0, totalRecipients - viewedCount);
  const viewPercentage = totalRecipients > 0 ? ((viewedCount / totalRecipients) * 100).toFixed(1) : 0;

  const handleReminder = () => {
    if (onSendReminder) {
      onSendReminder({ announcementTitle, unviewedCount });
    }
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 4000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Announcement Read Status
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Announcement: <span className="font-semibold text-gray-700 dark:text-gray-300">{announcementTitle}</span>
        </p>
      </div>

      {reminderSent && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold">
          Reminder successfully sent to {unviewedCount} unviewed participants!
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Recipients</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalRecipients}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Viewed</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{viewedCount}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Not Viewed</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{unviewedCount}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-gray-700 dark:text-gray-300">View Percentage</span>
          <span className="text-blue-600 dark:text-blue-400">{viewPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(viewPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleReminder}
          disabled={unviewedCount === 0}
          className={`w-full py-3 font-semibold rounded-lg transition text-white ${
            unviewedCount === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          Send Reminder to Unviewed ({unviewedCount})
        </button>
      </div>
    </div>
  );
};

export default AnnouncementReadStatusCard;
