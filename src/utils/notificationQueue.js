export const pushToNotificationQueue = (action, payload) => {
  try {
    const queue = JSON.parse(localStorage.getItem('eventra_notif_queue') || '[]');
    queue.push({ action, payload, timestamp: Date.now() });
    localStorage.setItem('eventra_notif_queue', JSON.stringify(queue));
  } catch (e) {}
};

export const syncNotificationQueue = async (apiUtils) => {
  try {
    const queue = JSON.parse(localStorage.getItem('eventra_notif_queue') || '[]');
    if (queue.length === 0) return;
    for (const item of queue) {
      if (item.action === 'read') await apiUtils.put(item.payload.endpoint, {});
      else if (item.action === 'delete') await apiUtils.delete(item.payload.endpoint);
    }
    localStorage.removeItem('eventra_notif_queue');
  } catch (e) {
    console.error('Failed to sync queued notification action', e);
  }
};
