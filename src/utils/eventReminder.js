export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();

  return permission === "granted";
};

export const scheduleReminder = (title, delay) => {
  setTimeout(() => {
    new Notification("Event Reminder", {
      body: `${title} starts soon!`,
    });
  }, delay);
};
