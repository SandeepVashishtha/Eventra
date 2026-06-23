// Sensitive top-level field names that must be removed from non-admin responses.
// The redactor walks every object recursively so a nested "revenue" /
// "hostEmail" / "privateNotes" is also redacted.
const REDACTED_KEYS = new Set(["revenue", "hostEmail", "privateNotes"]);

const isAdminScope = (userScopes) =>
  Array.isArray(userScopes) &&
  (userScopes.includes("admin:all") || userScopes.includes("event:write"));

// 🔥 FIX: deep-redact. Previously a shallow `{ ...data }` spread only
// removed top-level sensitive keys; nested `data.organizer.revenue` was
// leaked. Now we walk every level and return a new (object|array) with
// the sensitive keys removed at every depth.
const redactObject = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  const result = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(key)) continue;
    result[key] = redactSensitiveData(value);
  }
  return result;
};

export const redactSensitiveData = (data, userScopes) => {
  if (!data || typeof data !== "object") return data;
  if (isAdminScope(userScopes)) return data;
  return redactObject(data);
};

export default redactSensitiveData;
