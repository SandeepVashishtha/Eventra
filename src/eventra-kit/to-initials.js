
/**
 * adds an initials helper.
 */
export function toInitials(name) {
  return String(name).split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).join('').slice(0, 3);
}

