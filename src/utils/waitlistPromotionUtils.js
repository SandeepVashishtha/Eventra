const STORAGE_KEY = "eventra_waitlist";

/**
 * Get complete waitlist
 */
export const getQueue = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load waitlist:", error);
    return [];
  }
};

/**
 * Save waitlist
 */
export const saveQueue = (queue) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save waitlist:", error);
  }
};

/**
 * Add user to waitlist
 */
export const addToWaitlist = (user) => {
  const queue = getQueue();

  const exists = queue.some(
    (item) =>
      item.userId === user.userId &&
      item.eventId === user.eventId
  );

  if (exists) return queue;

  queue.push({
    ...user,
    joinedAt: new Date().toISOString(),
    status: "waiting",
  });

  saveQueue(queue);

  return queue;
};

/**
 * Remove user from waitlist
 */
export const removeFromWaitlist = (userId, eventId) => {
  const updated = getQueue().filter(
    (item) =>
      !(
        item.userId === userId &&
        item.eventId === eventId
      )
  );

  saveQueue(updated);

  return updated;
};

/**
 * Check if user is already waiting
 */
export const isUserWaiting = (userId, eventId) => {
  return getQueue().some(
    (item) =>
      item.userId === userId &&
      item.eventId === eventId
  );
};

/**
 * Get next eligible user
 */
export const getNextEligibleUser = (eventId) => {
  return getQueue().find(
    (item) =>
      item.eventId === eventId &&
      item.status === "waiting"
  );
};

/**
 * Promote next user
 */
export const promoteNextUser = (eventId) => {
  const queue = getQueue();

  const index = queue.findIndex(
    (item) =>
      item.eventId === eventId &&
      item.status === "waiting"
  );

  if (index === -1) return null;

  queue[index] = {
    ...queue[index],
    status: "promoted",
    promotedAt: new Date().toISOString(),
    confirmationDeadline: new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString(),
  };

  saveQueue(queue);

  return queue[index];
};

/**
 * Confirm promoted registration
 */
export const confirmPromotion = (userId, eventId) => {
  const queue = getQueue();

  const updated = queue.map((item) =>
    item.userId === userId &&
    item.eventId === eventId
      ? {
          ...item,
          status: "confirmed",
          confirmedAt: new Date().toISOString(),
        }
      : item
  );

  saveQueue(updated);

  return updated;
};

/**
 * Get queue for a specific event
 */
export const getEventQueue = (eventId) => {
  return getQueue().filter(
    (item) => item.eventId === eventId
  );
};

/**
 * Get queue position
 */
export const getQueuePosition = (userId, eventId) => {
  const queue = getEventQueue(eventId);

  const index = queue.findIndex(
    (item) => item.userId === userId
  );

  return index === -1 ? null : index + 1;
};

/**
 * Clear waitlist (useful for testing)
 */
export const clearWaitlist = () => {
  localStorage.removeItem(STORAGE_KEY);
};