/**
 * adds a lightweight email validation helper.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isEmail(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.length > 254) return false;
  return EMAIL_RE.test(v);
}
