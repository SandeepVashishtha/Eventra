let serverClockOffsetMs = 0;

// Initialize offset from localStorage cache to prevent 0-offset state on cold boot
try {
  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem("eventra_server_time_offset");
    if (cached) {
      serverClockOffsetMs = Number(cached) || 0;
    }
  }
} catch { console.warn("[timeSync] Clock offset operation failed"); }

export const getServerClockOffsetMs = () => serverClockOffsetMs;

export const setServerClockOffsetMs = (offsetMs) => {
  serverClockOffsetMs = Number(offsetMs) || 0;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("eventra_server_time_offset", String(serverClockOffsetMs));
    }
  } catch { console.warn("[timeSync] Clock offset operation failed"); }
};

export const getServerNow = () => Date.now() + serverClockOffsetMs;

export const getServerTime = () => new Date(getServerNow());

export const syncServerTimeFromHeader = (headerValue, requestSentAt) => {
  if (!headerValue || typeof headerValue !== "string") return false;

  const parsed = Date.parse(headerValue);
  if (Number.isNaN(parsed)) return false;

  const localNow = Date.now();

  // Compensate for network latency if request timing is available
  if (typeof requestSentAt === "number" && requestSentAt > 0) {
    const roundTripMs = localNow - requestSentAt;
    // Assume symmetric latency: server time was received halfway through the round trip
    const latencyCompensationMs = Math.round(roundTripMs / 2);
    setServerClockOffsetMs(parsed + latencyCompensationMs - localNow);
  } else {
    setServerClockOffsetMs(parsed - localNow);
  }
  return true;
};

export const parseServerDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
