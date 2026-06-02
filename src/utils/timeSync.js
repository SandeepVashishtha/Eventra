let serverClockOffsetMs = 0;

export const getServerClockOffsetMs = () => serverClockOffsetMs;

export const setServerClockOffsetMs = (offsetMs) => {
  serverClockOffsetMs = Number(offsetMs) || 0;
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
