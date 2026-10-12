export async function scheduleNotification(title) { if (Notification.permission === 'granted') new Notification(title); }
