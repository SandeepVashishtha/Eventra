
/**
 * adds an ipv4 check.
 */
export function ipv4Valid(ip) {
  const parts = String(ip).split('.');
  return parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

