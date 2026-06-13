import { useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import { popDueReminders } from "../../utils/reminderUtils";
import { parseEventDateTimeLocal } from "../../utils/timezoneUtils";

const CHECK_INTERVAL_MS = 30 * 1000;
const CHANNEL_NAME = "eventra_reminders_sync_channel";

const showBrowserNotification = (reminder) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const eventDate = parseEventDateTimeLocal(reminder.event.date, reminder.event.time) || new Date();

  new Notification(`Reminder: ${reminder.event.title}`, {
    body: `${reminder.timingLabel} at ${eventDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`,
    icon: reminder.event.image,
    tag: reminder.id,
  });
};

const ReminderChecker = () => {
  const notifiedIdsRef = useRef(new Set());
  const channelRef = useRef(null);

  useEffect(() => {
    // Establish BroadcastChannel for tab coordination
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === "REMINDER_NOTIFIED" && event.data?.id) {
          notifiedIdsRef.current.add(event.data.id);
        }
      };
    }

    const checkReminders = () => {
      const dueReminders = popDueReminders();

      dueReminders.forEach((reminder) => {
        // Skip if this reminder has already been notified by another tab
        if (notifiedIdsRef.current.has(reminder.id)) {
          return;
        }

        // 🔥 FIX: Prevent unbounded memory growth over long user sessions
        if (notifiedIdsRef.current.size > 500) {
          notifiedIdsRef.current.clear();
        }

        // Add to our locally tracked notified set
        notifiedIdsRef.current.add(reminder.id);

        // Broadcast to other tabs that we've handled this reminder
        if (channelRef.current) {
          channelRef.current.postMessage({
            type: "REMINDER_NOTIFIED",
            id: reminder.id,
          });
        }

        // Trigger notification
        toast(`${reminder.event.title} starts ${reminder.timingLabel}.`, {
          toastId: `reminder-due-${reminder.id}`,
          autoClose: 6000,
          className: "custom-toast",
        });
        showBrowserNotification(reminder);
      });
    };

    // 🔥 FIX: Inject 0-500ms mathematical jitter to stagger simultaneous tab executions.
    // This solves the race condition where 3 tabs fire at the exact same millisecond 
    // before the BroadcastChannel has time to deliver the message.
    const runWithJitter = () => {
      const randomJitterDelay = Math.random() * 500;
      setTimeout(checkReminders, randomJitterDelay);
    };

    runWithJitter();
    const intervalId = window.setInterval(runWithJitter, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  return null;
};

export default ReminderChecker;