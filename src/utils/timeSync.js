let serverClockOffsetMs = 0;

// Initialize offset from localStorage cache to prevent 0-offset state on cold boot
try {
  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem("eventra_server_time_offset");
    if (cached) {
      serverClockOffsetMs = Number(cached) || 0;
    }
  }
} catch {}

export const getServerClockOffsetMs = () => serverClockOffsetMs;

export const setServerClockOffsetMs = (offsetMs) => {
  serverClockOffsetMs = Number(offsetMs) || 0;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("eventra_server_time_offset", String(serverClockOffsetMs));
    }
  } catch {}
};

export const getServerNow = () => Date.now() + serverClockOffsetMs;

export const getServerTime = () => new Date(getServerNow());

export const syncServerTimeFromHeader = (headerValue) => {
  if (!headerValue || typeof headerValue !== "string") return false;

  const parsed = Date.parse(headerValue);
  if (Number.isNaN(parsed)) return false;

  const localNow = Date.now();
  setServerClockOffsetMs(parsed - localNow);
  return true;
};

export const parseServerDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
