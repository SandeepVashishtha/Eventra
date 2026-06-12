export const safeJsonParse = (
  value,
  fallback = null,
) => {
  try {
    if (!value || typeof value !== "string") {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};