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
    console.error(
      "Failed to parse JSON:",
      error,
    );

    return fallback;
  }
};