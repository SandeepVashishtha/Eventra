import React, { useState } from 'react';

export const BulkParticipantActions = ({ participants = [], onApplyBulkAction }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [action, setAction] = useState('APPROVE');
  const [targetGroup, setTargetGroup] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(participants.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setShowConfirmation(true);
  };

  const confirmAndExecute = () => {
    if (onApplyBulkAction) {
      onApplyBulkAction({
        participantIds: selectedIds,
        action,
        targetGroup,
        notificationMessage,
      });
    }
    setShowConfirmation(false);
    setSuccessMessage(`Successfully applied ${action} to ${selectedIds.length} participant(s).`);
    setSelectedIds([]);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Bulk Participant Management
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select multiple participants to update statuses or perform batch actions.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleActionSubmit} className="flex flex-wrap gap-4 items-end bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Bulk Action
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="MARK_ATTENDED">Mark as Attended</option>
            <option value="ADD_TO_GROUP">Add to Group</option>
            <option value="REMOVE_FROM_GROUP">Remove from Group</option>
            <option value="SEND_NOTIFICATION">Send Notification</option>
          </select>
        </div>

        {(action === 'ADD_TO_GROUP' || action === 'REMOVE_FROM_GROUP') && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              placeholder="e.g. VIP, Speakers"
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        {action === 'SEND_NOTIFICATION' && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Notification Message
            </label>
            <input
              type="text"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter message for selected participants"
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={selectedIds.length === 0}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          Apply Action ({selectedIds.length})
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase text-xs">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={participants.length > 0 && selectedIds.length === participants.length}
                />
              </th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => handleSelectOne(p.id)}
                  />
                </td>
                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{p.name}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {p.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Confirm Bulk Action
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to perform action <strong>{action}</strong> on <strong>{selectedIds.length}</strong> selected participant(s)?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndExecute}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkParticipantActions;
