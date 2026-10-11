import React, { useState } from 'react';

export const OrganizerDashboardQuickActions = ({ eventId = 101, onQuickActionTrigger }) => {
  const [activeMessage, setActiveMessage] = useState('');

  const actions = [
    { type: 'CREATE_EVENT', label: 'Create Event', icon: '➕', color: 'bg-blue-600 hover:bg-blue-700' },
    { type: 'EDIT_EVENT', label: 'Edit Event', icon: '✏️', color: 'bg-amber-600 hover:bg-amber-700' },
    { type: 'VIEW_PARTICIPANTS', label: 'View Participants', icon: '👥', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { type: 'SEND_ANNOUNCEMENT', label: 'Send Announcement', icon: '📢', color: 'bg-purple-600 hover:bg-purple-700' },
    { type: 'EXPORT_REGISTRATIONS', label: 'Export Registrations', icon: '📥', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { type: 'MANAGE_FEEDBACK', label: 'Manage Feedback', icon: '💬', color: 'bg-teal-600 hover:bg-teal-700' },
    { type: 'CLOSE_REGISTRATION', label: 'Close Registration', icon: '🔒', color: 'bg-rose-600 hover:bg-rose-700' },
  ];

  const handleActionClick = (action) => {
    if (onQuickActionTrigger) {
      onQuickActionTrigger({ eventId, actionType: action.type });
    }
    setActiveMessage(`Triggered action: ${action.label}`);
    setTimeout(() => setActiveMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Organizer Dashboard Quick Actions
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Perform frequent event-management tasks instantly to boost productivity.
        </p>
      </div>

      {activeMessage && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-500 text-blue-700 dark:text-blue-300 rounded-lg">
          {activeMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.type}
            onClick={() => handleActionClick(action)}
            className={`flex items-center gap-3 p-4 text-white font-semibold rounded-xl shadow-sm transition transform hover:-translate-y-0.5 ${action.color}`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrganizerDashboardQuickActions;
