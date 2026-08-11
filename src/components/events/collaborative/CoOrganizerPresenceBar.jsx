import React from "react";
import { Users, Wifi, RefreshCw } from "lucide-react";

const ORGANIZERS = [
  { id: "o-1", name: "Alex Rivera", color: "bg-indigo-500", activeSlot: "Main Stage Keynote" },
  { id: "o-2", name: "Sarah Chen", color: "bg-emerald-500", activeSlot: "AI Track Hall" },
];

export default function CoOrganizerPresenceBar() {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="font-bold text-gray-900 dark:text-white">Active Co-Organizers</span>
        <div className="flex -space-x-1.5 ml-2">
          {ORGANIZERS.map((org) => (
            <div
              key={org.id}
              title={`${org.name} (Editing: ${org.activeSlot})`}
              className={`w-6 h-6 rounded-full ${org.color} border-2 border-white dark:border-gray-900 text-white font-bold flex items-center justify-center text-[10px] cursor-pointer`}
            >
              {org.name[0]}
            </div>
          ))}
        </div>
      </div>

      <span className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
        <Wifi className="w-3.5 h-3.5" /> CRDT Multi-Cursor Sync Active
      </span>
    </div>
  );
}
