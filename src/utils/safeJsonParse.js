// Safe JSON parsing utility with size bounds
export function safeJsonParse(str, limit = 50000) {
  if (typeof str !== 'string' || str.length > limit) {
    return null;
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}
