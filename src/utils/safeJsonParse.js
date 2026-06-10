export const safeJsonParse = (
  value,
  fallback = null,
) => {
  try {
    if (!value || typeof value !== "string") {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeJsonParseObject = (
  value,
  fallback = {}
) => {
  const result = safeJsonParse(value, fallback);
  if (result !== null && typeof result === 'object' && !Array.isArray(result)) {
    return result;
  }
  return fallback;
};