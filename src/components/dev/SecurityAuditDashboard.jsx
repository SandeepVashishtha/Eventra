import { useEffect, useState } from "react";
import {
  clearSecurityEvents,
  getSecurityEvents,
} from "../../utils/securityEventLogger";

const SecurityAuditDashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setEvents(getSecurityEvents());
    }
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const clearLogs = () => {
    clearSecurityEvents();
    setEvents([]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-[450px] w-[420px] overflow-auto rounded-xl border bg-white dark:bg-gray-900 p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">
          Security Audit Trail
        </h3>

        <button
          onClick={clearLogs}
          className="text-sm text-red-500"
        >
          Clear
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">
          No security events recorded.
        </p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded border p-2"
            >
              <div className="font-semibold">
                {event.type}
              </div>

              <div className="text-sm">
                {event.message}
              </div>

              <div className="text-xs text-gray-500">
                {new Date(
                  event.timestamp
                ).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecurityAuditDashboard;
