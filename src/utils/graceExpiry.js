export function isTokenExpiredWithGrace(expTimestamp, graceSeconds = 10) {
  if (!expTimestamp) return true;
  const now = Math.floor(Date.now() / 1000);
  return (expTimestamp - graceSeconds) < now;
}
