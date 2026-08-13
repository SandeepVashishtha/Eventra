import React, { useState } from 'react';

export const ParticipantGroupCommunication = ({ eventId }) => {
  const [filters, setFilters] = useState({
    team: '',
    registrationStatus: 'ALL',
    attendanceStatus: 'ALL',
    submissionStatus: 'PENDING',
    session: '',
  });

  const [message, setMessage] = useState({ title: '', body: '' });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSend = (e) => {
    e.preventDefault();
    console.log('Sending targeted announcement for event:', eventId, { filters, message });
    alert('Targeted announcement sent successfully!');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Send Targeted Participant Announcement
      </h2>
      <form onSubmit={handleSend} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Status</label>
            <select
              name="registrationStatus"
              value={filters.registrationStatus}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submission Status</label>
            <select
              name="submissionStatus"
              value={filters.submissionStatus}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">All</option>
              <option value="SUBMITTED">Submitted Project</option>
              <option value="PENDING">Pending Submission</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Announcement Title</label>
          <input
            type="text"
            required
            value={message.title}
            onChange={(e) => setMessage({ ...message, title: e.target.value })}
            placeholder="e.g., Submission Deadline Reminder"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
          <textarea
            required
            rows={4}
            value={message.body}
            onChange={(e) => setMessage({ ...message, body: e.target.value })}
            placeholder="Write your announcement here..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white p-2"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
        >
          Dispatch Announcement
        </button>
      </form>
    </div>
  );
};

export default ParticipantGroupCommunication;
