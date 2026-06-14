import React from 'react';

const EventInfoSection = ({ event }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Event Details</h2>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p><span className="font-semibold">Attendees:</span> {event.attendees}/{event.maxAttendees}</p>
        {event.maxAttendees > 0 && event.attendees / event.maxAttendees >= 0.8 && event.attendees < event.maxAttendees && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-500/30">🔥 Almost Full!</span>
        )}
      </div>
      <p><span className="font-semibold">Type:</span> {event.type}</p>
      <p><span className="font-semibold">Tags:</span> {(event.tags ?? []).join(", ")}</p>
    </div>
  </div>
);

export default EventInfoSection;
