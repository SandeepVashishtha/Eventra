
import React, { useState, useEffect } from 'react';

const LiveInventoryCounter = ({ eventId, initialCapacity }) => {
  const [capacity, setCapacity] = useState(initialCapacity);

  useEffect(() => {
    if (!eventId) return;
    const evtSource = new EventSource(`/api/events/${eventId}/inventory/stream`);
    evtSource.onmessage = (event) => setCapacity(JSON.parse(event.data).remaining);
    return () => evtSource.close();
  }, [eventId]);

  if (capacity === undefined || capacity === null) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full animate-pulse">
      <div className="w-2 h-2 rounded-full bg-rose-500" />
      <span className="text-xs font-bold text-rose-600">Only {capacity} tickets left!</span>
    </div>
  );
};

export default LiveInventoryCounter;
