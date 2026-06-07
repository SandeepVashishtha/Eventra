const STORAGE_KEY = "eventra_device_fingerprint";

const hashString = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export const parseDeviceInfo = (userAgent = navigator.userAgent) => {
  const ua = String(userAgent);
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType = "desktop";

  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Opera|OPR\//i.test(ua)) browser = "Opera";

  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  if (/Mobile|Android/i.test(ua) && !/iPad/i.test(ua)) deviceType = "mobile";
  else if (/iPad|Tablet/i.test(ua)) deviceType = "tablet";

  return { browser, os, deviceType, userAgent: ua };
};

export const getDeviceFingerprint = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return cached;
  } catch {
    // ignore storage errors
  }

  const info = parseDeviceInfo();
  const screenPart = typeof window !== "undefined"
    ? `${window.screen?.width || 0}x${window.screen?.height || 0}`
    : "unknown";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
  const fingerprint = hashString(
    `${info.os}|${info.browser}|${info.deviceType}|${screenPart}|${timezone}`,
  );

  try {
    localStorage.setItem(STORAGE_KEY, fingerprint);
  } catch {
    // ignore storage errors
  }

  return fingerprint;
};

export const getDeviceMetadata = () => {
  const info = parseDeviceInfo();
  return {
    ...info,
    deviceFingerprint: getDeviceFingerprint(),
  };
};
