export function safeJsonParse(str, fallback = null, validator = null) {
  if (typeof str !== "string") return fallback;
  try {
    const parsed = JSON.parse(str);
    if (validator && typeof validator === "function") {
      return validator(parsed) ? parsed : fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}
