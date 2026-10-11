import React, { useState } from 'react';

export const OrganizerRegistrationSearchCard = ({
  eventTitle = 'Global Tech Symposium 2026',
  initialRegistrations = [
    { id: 101, name: 'Alice Smith', email: 'alice@example.com', team: 'Alpha Coders', status: 'Confirmed' },
    { id: 102, name: 'Bob Jones', email: 'bob@example.com', status: 'Pending' },
    { id: 103, name: 'Charlie Brown', email: 'charlie@example.com', team: 'Beta Squad', status: 'Confirmed' },
    { id: 104, name: 'Diana Prince', email: 'diana@example.com', team: 'Alpha Coders', status: 'Confirmed' },
  ],
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredRegistrations = initialRegistrations.filter((reg) => {
    const q = query.toLowerCase();
    if (!q) return true;
    if (filterType === 'NAME') return reg.name.toLowerCase().includes(q);
    if (filterType === 'EMAIL') return reg.email.toLowerCase().includes(q);
    if (filterType === 'REGISTRATION_ID') return reg.id.toString().includes(q);
    if (filterType === 'TEAM_NAME') return reg.team && reg.team.toLowerCase().includes(q);

    // Default 'ALL' search across all fields
    return (
      reg.name.toLowerCase().includes(q) ||
      reg.email.toLowerCase().includes(q) ||
      reg.id.toString().includes(q) ||
      (reg.team && reg.team.toLowerCase().includes(q))
    );
  });

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearchSubmit) {
      onSearchSubmit({ query: val, filterType });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Organizer Participant Search
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventTitle}</span>
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search by participant name, email, ID, or team..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">All Fields</option>
            <option value="NAME">Name</option>
            <option value="EMAIL">Email</option>
            <option value="REGISTRATION_ID">Reg ID</option>
            <option value="TEAM_NAME">Team Name</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Showing {filteredRegistrations.length} matching result(s)
        </div>
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
                  {reg.name} <span className="text-xs font-normal text-gray-500">#{reg.id}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{reg.email} {reg.team ? `• Team: ${reg.team}` : ''}</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                {reg.status}
              </span>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No matching participants found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerRegistrationSearchCard;
