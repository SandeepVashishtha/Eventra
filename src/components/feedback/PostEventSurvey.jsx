import React, { useState } from 'react';
export default function PostEventSurvey() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-bold mb-4">Post-Event Survey</h3>
      <textarea className="w-full border p-2 rounded mb-4" placeholder="Share your feedback..." />
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
        Submit Anonymously
      </label>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded">Submit Survey</button>
    </div>
  );
}