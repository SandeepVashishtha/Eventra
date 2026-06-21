const LOCK_EXPIRY_MS = 600000; // 10 minutes lease time

export function acquireRegistrationLock(eventId) {
  try {
    const now = Date.now();
    const lockKey = `reg_lock_${eventId}`;
    const existing = localStorage.getItem(lockKey);
    
    if (existing) {
      const lockTime = Number(existing);
      if (now - lockTime < LOCK_EXPIRY_MS) {
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

const registrationLocks = {
  has: (eventId) => activeLocks.has(eventId),
  set: (eventId) => {
    activeLocks.add(eventId);
  },
  delete: (eventId) => {
    activeLocks.delete(eventId);
  }
};

export default registrationLocks;
