
/**
 * adds an email masker.
 */
export function maskEmail(email) {
  const [name, domain] = String(email).split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

