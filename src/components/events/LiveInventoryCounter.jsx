import { useState, useEffect } from 'react';
// Fix: useEventSource replaces bare EventSource with no reconnection or error handling
import useEventSource from 'hooks/useEventSource';

const LiveInventoryCounter = ({ eventId, initialCapacity }) => {
  const [capacity, setCapacity] = useState(initialCapacity);

  const { lastMessage } = useEventSource(
    eventId ? `/api/events/${eventId}/inventory/stream` : null,
    {
      maxRetries: 5,
      baseRetryMs: 2000,
    }
  );

  // Sync capacity from SSE messages
  useEffect(() => {
    if (lastMessage?.remaining !== undefined) {
      setCapacity(lastMessage.remaining);
    }
  }, [lastMessage]);

  if (capacity === undefined || capacity === null) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full animate-pulse">
      <div className="w-2 h-2 rounded-full bg-rose-500" />
      <span className="text-xs font-bold text-rose-600">Only {capacity} tickets left!</span>
    </div>
  );
};

export default LiveInventoryCounter;
