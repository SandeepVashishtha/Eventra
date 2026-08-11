const STORAGE_KEY = "eventra_waitlist";
const PROMOTION_LOCKS_KEY = "eventra_promotion_sync_locks";

const getPromotionLocks = () => {
  try {
    const data = localStorage.getItem(PROMOTION_LOCKS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const savePromotionLocks = (locks) => {
  try {
    localStorage.setItem(PROMOTION_LOCKS_KEY, JSON.stringify(locks));
  } catch {}
};

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

  const promotionToken = `prom-token-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  queue[index] = {
    ...queue[index],
    status: "promoted",
    promotionToken,
    promotedAt: new Date().toISOString(),
    confirmationDeadline: new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString(),
  };

  saveQueue(queue);

  return queue[index];
};

/**
 * Confirm promoted registration with Service Worker Background Sync Mutex Guard
 */
export const confirmPromotionWithMutex = (userId, eventId, promotionToken) => {
  const locks = getPromotionLocks();

  // If promotion token already claimed or currently syncing, block duplicate execution
  if (promotionToken && locks[promotionToken]) {
    console.warn(`[WaitlistMutex] Blocked duplicate promotion sync for token: ${promotionToken}`);
    return { success: false, duplicate: true };
  }

  if (promotionToken) {
    locks[promotionToken] = { claimedAt: Date.now() };
    savePromotionLocks(locks);
  }

  const queue = getQueue();
  const updated = queue.map((item) =>
    item.userId === userId && item.eventId === eventId
      ? {
          ...item,
          status: "confirmed",
          confirmedAt: new Date().toISOString(),
        }
      : item
  );

  saveQueue(updated);
  return { success: true, updated };
};

export const confirmPromotion = (userId, eventId) => {
  const result = confirmPromotionWithMutex(userId, eventId, null);
  return result.updated || getQueue();
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
  localStorage.removeItem(PROMOTION_LOCKS_KEY);
};