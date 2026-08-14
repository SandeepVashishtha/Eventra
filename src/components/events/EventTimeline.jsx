import React from "react";
import { Circle, Flag, Clock } from "lucide-react";
import "./event-timeline.css";

export default function EventTimeline({ milestones = [
  { id: 1, time: "09:00 AM", title: "Registrations & Check-in", description: "Verification desk opens for attendees.", active: true },
  { id: 2, time: "10:00 AM", title: "Keynote Presentation", description: "Event opening address by sandeep.", active: false },
  { id: 3, time: "12:00 PM", title: "Networking Lunch", description: "Meet co-hackers in networking loug.", active: false }
]}) {
  return (
    <div className="event-timeline-container p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-xl mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-205 dark:border-slate-850 pb-4 mb-6">
        <Clock className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
        <h3 className="font-bold text-slate-950 dark:text-white">Event Schedule Timeline</h3>
      </div>

      <div className="flex flex-col gap-6 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
        {milestones.map((m) => (
          <div key={m.id} className="timeline-node relative">
            <div className={`absolute -left-9 top-1 w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center ${
              m.active ? "border-indigo-600" : "border-slate-300 dark:border-slate-850"
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${m.active ? "bg-indigo-600" : "bg-transparent"}`} />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{m.time}</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug mt-0.5">{m.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
