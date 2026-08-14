import React, { useState } from "react";
import { Calendar, Users, AlertCircle } from "lucide-react";
import TimeSlot from "./TimeSlot";
import "./scheduler.css";

export default function CollaborativeScheduler() {
  const [schedule, setSchedule] = useState([
    { id: 1, title: "Opening Ceremony", speaker: "Sandeep V.", start: "09:00", end: "10:00", room: "Main Hall", lockedBy: null },
    { id: 2, title: "Web v4 Overview", speaker: "Priya S.", start: "10:15", end: "11:30", room: "Track A", lockedBy: "Co-Organizer Alex" },
    { id: 3, title: "ZKP Deep Dive", speaker: "Dr. Mehta", start: "11:45", end: "13:00", room: "Track B", lockedBy: null }
  ]);

  const handleEditRequest = (id) => {
    // Simulate real-time lock updates
    const target = schedule.find((s) => s.id === id);
    if (target.lockedBy) {
      alert(`This slot is currently being edited by ${target.lockedBy}.`);
      return;
    }

    setSchedule((prev) =>
      prev.map((s) => (s.id === id ? { ...s, lockedBy: "You" } : s))
    );
    alert("Slot locked for editing.");
  };

  return (
    <div className="collaborative-scheduler p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Calendar className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
            Collaborative Timetable Scheduler
          </h2>
          <p className="text-xs text-slate-500 mt-1">Simultaneously schedule breakout slots with other co-organizers</p>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-955 text-amber-600 dark:text-amber-400 border border-amber-250 dark:border-amber-900 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <AlertCircle className="w-4 h-4" /> Real-time Locks Active
        </div>
      </div>

      <div className="timetable-timeline-grid flex flex-col gap-4">
        {schedule.map((slot) => (
          <TimeSlot
            key={slot.id}
            slot={slot}
            onEdit={() => handleEditRequest(slot.id)}
          />
        ))}
      </div>
    </div>
  );
}
