const attempts = new Map();

export const canAttempt = (
  key,
  limit = 5,
  windowMs = 60_000
) => {
  const now = Date.now();

  const previous =
    attempts.get(key)?.filter(
      (time) => now - time < windowMs
    ) || [];

  if (previous.length >= limit) {
    return false;
  }

  previous.push(now);
  attempts.set(key, previous);

  return true;
};

export const getBackoffDelay = (failures) => {
  return Math.min(
    1000 * Math.pow(2, failures),
    30_000
  );
};

export const clearAttempts = (key) => {
  attempts.delete(key);
};

const failures = new Map();

export const incrementFailures = (key) => {
  const count = failures.get(key) || 0;
  failures.set(key, count + 1);
};

export const resetFailures = (key) => {
  failures.delete(key);
};

export const getFailureCount = (key) => {
  return failures.get(key) || 0;
};

export const getBackoffDelay = (key) => {
  const failures = getFailureCount(key);

  return Math.min(
    1000 * Math.pow(2, failures),
    30000
  );
};