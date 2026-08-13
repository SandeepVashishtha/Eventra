import React, { useState } from "react";
import { User, Save } from "lucide-react";
import { LwwRegister } from "../../../utils/crdt/lwwRegister";
import SyncStatusIndicator from "./SyncStatusIndicator";

export default function OfflineProfileEditor() {
  const [username, setUsername] = useState("Jane Doe");
  const [localRegister] = useState(() => new LwwRegister("Jane Doe", Date.now()));
  const [syncState, setSyncState] = useState("synced");

  const handleSave = () => {
    setSyncState("saving");
    const ts = Date.now();
    localRegister.update(username, ts);
    
    // Simulate async sync queues to backend database
    setTimeout(() => {
      setSyncState("synced");
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Offline-First Profile Editor</span>
        </div>
        <SyncStatusIndicator status={syncState} />
      </div>

      <div className="p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 space-y-3">
        <div className="space-y-1">
          <label className="font-semibold text-gray-500">Attendee Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
          />
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>
    </div>
  );
}
