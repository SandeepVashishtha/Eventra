// Authentication rate-limiter middleware
const requestCounts = new Map();
export function checkRateLimit(ip) {
  const now = Date.now();
  const record = requestCounts.get(ip) || { count: 0, resetTime: now + 60000 };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + 60000;
  } else {
    record.count += 1;
  }
  requestCounts.set(ip, record);
  return record.count <= 10;
}
