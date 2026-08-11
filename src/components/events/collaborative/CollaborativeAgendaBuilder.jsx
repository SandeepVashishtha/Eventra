import React, { useState } from "react";
import { Plus, Clock, Layers, Sparkles } from "lucide-react";
import CoOrganizerPresenceBar from "./CoOrganizerPresenceBar";
import { AgendaCRDTStore } from "../../../utils/crdt/agendaCrdtStore";

export default function CollaborativeAgendaBuilder() {
  const [store] = useState(() => {
    const s = new AgendaCRDTStore();
    s.updateSlot("s-1", { title: "Keynote: Future of Open Source", track: "Main Stage", startTime: "09:00 AM" });
    s.updateSlot("s-2", { title: "Hands-on WebGPU Workshop", track: "Dev Lab", startTime: "10:30 AM" });
    return s;
  });

  const [slots, setSlots] = useState(store.getAllSlots());
  const [newTitle, setNewTitle] = useState("");

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newId = `s-${Date.now()}`;
    store.updateSlot(newId, {
      title: newTitle,
      track: "Main Stage",
      startTime: "11:30 AM",
    });
    setSlots(store.getAllSlots());
    setNewTitle("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <CoOrganizerPresenceBar />

      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Multi-Track Collaborative Agenda Builder
            </h3>
          </div>

          <span className="font-mono text-gray-400">Offline-First CRDT LWW Merger</span>
        </div>

        <form onSubmit={handleAddSlot} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add new session title to CRDT state tree..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </form>

        <div className="space-y-3 pt-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">{slot.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> {slot.startTime}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    {slot.track}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                CRDT Synced
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
