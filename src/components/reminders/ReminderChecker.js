import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { popDueReminders } from "../../utils/reminderUtils";

const CHECK_INTERVAL_MS = 30 * 1000;
const CHANNEL_NAME = "eventra_reminders_sync_channel";

const showBrowserNotification = (reminder) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const eventDate = new Date(`${reminder.event.date} ${reminder.event.time || "12:00 AM"}`);

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
        toast.info(`${reminder.event.title} starts ${reminder.timingLabel}.`, {
          toastId: `reminder-due-${reminder.id}`,
          autoClose: 6000,
          className: "custom-toast",
        });
        showBrowserNotification(reminder);
      });
    };

    checkReminders();
    const intervalId = window.setInterval(checkReminders, CHECK_INTERVAL_MS);

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
