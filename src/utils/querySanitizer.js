export function sanitizeFilterQuery(queryObj) {
  if (!queryObj || typeof queryObj !== "object") return {};
  const sanitized = {};
  Object.keys(queryObj).forEach((key) => {
    const val = queryObj[key];
    if (typeof val === "string") {
      sanitized[key] = val.replace(/[$&<>]/g, ""); // strip sensitive characters
    } else if (Array.isArray(val)) {
      sanitized[key] = val.map(item => (typeof item === "string" ? item.replace(/[$&<>]/g, "") : item));
    } else {
      sanitized[key] = val;
    }
  });
  return sanitized;
}
