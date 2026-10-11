import React, { useState } from 'react';

export const RegistrationStatusFilterCard = ({
  participantName = 'Jane Doe',
  initialRegistrations = [
    { id: 201, eventName: 'AI & Machine Learning Conference', date: '2026-09-15', status: 'UPCOMING' },
    { id: 202, eventName: 'Web3 Security Summit', date: '2026-06-10', status: 'PENDING' },
    { id: 203, eventName: 'Cloud Native Workshop', date: '2026-05-20', status: 'CONFIRMED' },
    { id: 204, eventName: 'Hackathon 2026', date: '2026-03-12', status: 'ATTENDED' },
    { id: 205, eventName: 'Python Developer Meetup', date: '2026-02-10', status: 'COMPLETED' },
    { id: 206, eventName: 'UI/UX Design Masterclass', date: '2026-01-05', status: 'CANCELLED' },
  ],
  onFilterSelect,
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = ['ALL', 'UPCOMING', 'PENDING', 'CONFIRMED', 'ATTENDED', 'COMPLETED', 'CANCELLED'];

  const filteredRegistrations = initialRegistrations.filter((reg) => {
    if (activeFilter === 'ALL') return true;
    return reg.status === activeFilter;
  });

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (onFilterSelect) {
      onFilterSelect({ filter });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'ATTENDED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'COMPLETED':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          My Event Registrations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Participant: <span className="font-semibold text-gray-700 dark:text-gray-300">{participantName}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterClick(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === f
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl flex justify-between items-center border border-gray-200/50 dark:border-gray-700/50"
            >
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {reg.eventName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date: {reg.date}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusBadge(reg.status)}`}>
                {reg.status}
              </span>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No registrations found for "{activeFilter}".
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationStatusFilterCard;
