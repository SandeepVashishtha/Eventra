import { useEffect } from "react";
import { toast } from "react-toastify";
import { popDueReminders } from "../../utils/reminderUtils";

const CHECK_INTERVAL_MS = 30 * 1000;

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
  useEffect(() => {
    const checkReminders = () => {
      const dueReminders = popDueReminders();

      dueReminders.forEach((reminder) => {
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

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
};

export default ReminderChecker;
