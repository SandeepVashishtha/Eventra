const LOCK_EXPIRY_MS = 600000; // 10 minutes lease time

export function isRegistrationLockActive(eventId) {
  try {
    const existing = localStorage.getItem(`reg_lock_${eventId}`);
    if (!existing) return false;

    const lockTime = Number(existing);
    if (Number.isNaN(lockTime)) {
      localStorage.removeItem(`reg_lock_${eventId}`);
      return false;
    }

    return Date.now() - lockTime < LOCK_EXPIRY_MS;
  } catch {
    return false;
  }
}

export function acquireRegistrationLock(eventId) {
  try {
    const now = Date.now();
    const lockKey = `reg_lock_${eventId}`;
    const existing = localStorage.getItem(lockKey);

    if (existing) {
      const lockTime = Number(existing);
      if (Number.isNaN(lockTime)) {
        localStorage.removeItem(lockKey);
      } else if (now - lockTime < LOCK_EXPIRY_MS) {
        return false; // Lock active
      }
    }

    localStorage.setItem(lockKey, String(now));
    return true;
  } catch {
    return false;
  }
}

export function releaseRegistrationLock(eventId) {
  try {
    localStorage.removeItem(`reg_lock_${eventId}`);
    return true;
  } catch {
    return false;
  }
}

const activeLocks = new Set();

// Invalidate the per-tab fast-path cache the moment another tab acquires or
// releases a lease, so a stale in-memory entry can never mask a live lease
// from a different tab (the storage event only fires in other tabs).
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith("reg_lock_")) {
      activeLocks.delete(event.key.slice("reg_lock_".length));
    }
  });
}

const registrationLocks = {
  has: (eventId) => activeLocks.has(eventId) || isRegistrationLockActive(eventId),
  set: (eventId) => {
    if (acquireRegistrationLock(eventId)) {
      activeLocks.add(eventId);
      return true;
    }
    return false;
  },
  delete: (eventId) => {
    activeLocks.delete(eventId);
    releaseRegistrationLock(eventId);
  },
};

export default registrationLocks;
