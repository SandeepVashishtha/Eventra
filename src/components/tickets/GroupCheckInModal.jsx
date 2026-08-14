import React, { useState } from "react";
import { Users, CheckSquare, Square, X } from "lucide-react";
import AttendeeRow from "./AttendeeRow";
import "./group-check-in.css";

export default function GroupCheckInModal({ orderId = "ORD-94021", onClose }) {
  const [attendees, setAttendees] = useState([
    { id: 1, name: "Pranav Kumar", email: "pranav@example.com", checkedIn: false },
    { id: 2, name: "Riya Verma", email: "riya@example.com", checkedIn: true },
    { id: 3, name: "Devansh Negi", email: "devansh@example.com", checkedIn: false }
  ]);

  const toggleCheckIn = (id) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checkedIn: !a.checkedIn } : a))
    );
  };

  const handleBulkCheckIn = () => {
    const allChecked = attendees.every(a => a.checkedIn);
    setAttendees((prev) =>
      prev.map((a) => ({ ...a, checkedIn: !allChecked }))
    );
  };

  return (
    <div className="group-checkin-modal p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg mx-auto my-8 relative">
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400">
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <Users className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Group Check-in Manager</h3>
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Booking ID: {orderId}</span>
        </div>
      </div>

      <button
        onClick={handleBulkCheckIn}
        className="w-full flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 rounded-xl mb-4 transition-colors"
      >
        Select / Toggle All Group Members
      </button>

      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-6 pr-1">
        {attendees.map((attendee) => (
          <AttendeeRow
            key={attendee.id}
            attendee={attendee}
            onToggle={() => toggleCheckIn(attendee.id)}
          />
        ))}
      </div>

      <button
        onClick={() => {
          alert("Group check-in state submitted successfully!");
          if (onClose) onClose();
        }}
        className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-indigo-650/20"
      >
        Confirm Selection Check-in
      </button>
    </div>
  );
}
