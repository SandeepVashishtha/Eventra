import React, { useState } from 'react';

export const ParticipantGroupManager = ({ eventId, groups = [], participants = [], onGroupChange }) => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');

  const filteredParticipants = selectedGroupId
    ? participants.filter((p) => p.groupId === selectedGroupId)
    : participants;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Participant Group Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organize event batches, teams, and tracks.</p>
        </div>

        {/* Filter by Group */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Group:</label>
          <select
            value={selectedGroupId || ''}
            onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
          >
            <option value="">All Groups ({participants.length})</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.groupName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table List */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-semibold">
            <tr>
              <th className="px-4 py-3">Participant Name</th>
              <th className="px-4 py-3">Assigned Group</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-400">No participants found in this view.</td>
              </tr>
            ) : (
              filteredParticipants.map((p) => {
                const currentGroup = groups.find((g) => g.id === p.groupId);
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.participantName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${currentGroup ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {currentGroup ? currentGroup.groupName : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <select
                        defaultValue={p.groupId || ''}
                        onChange={(e) => onGroupChange && onGroupChange(p.id, e.target.value ? Number(e.target.value) : null)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        <option value="">Move to Unassigned</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>{g.groupName}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantGroupManager;
