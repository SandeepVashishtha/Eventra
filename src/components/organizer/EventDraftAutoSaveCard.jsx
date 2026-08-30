import React, { useState, useEffect } from 'react';

export const EventDraftAutoSaveCard = ({
  initialTitle = '',
  initialDescription = '',
  onSaveDraft,
  onDiscardDraft,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [lastSaved, setLastSaved] = useState('Draft saved just now');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Simulate auto-saving every few seconds of inactivity or changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleManualSave(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [title, description]);

  const handleManualSave = (isAuto = false) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(`Draft saved at ${now}`);
      if (!isAuto) {
        setStatusMsg('Draft manually saved successfully.');
        setTimeout(() => setStatusMsg(''), 3000);
      }
      if (onSaveDraft) {
        onSaveDraft({ title, description, timestamp: now });
      }
    }, 400);
  };

  const handleDiscard = () => {
    setTitle('');
    setDescription('');
    setLastSaved('Draft discarded');
    setStatusMsg('Draft cleared and discarded.');
    setTimeout(() => setStatusMsg(''), 3000);
    if (onDiscardDraft) {
      onDiscardDraft();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Create Event Draft
          </h2>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {saving ? 'Saving changes...' : lastSaved}
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-500 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Event Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide event details..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleManualSave(false)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition"
          >
            Save Draft Now
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg text-sm transition"
          >
            Discard Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDraftAutoSaveCard;
