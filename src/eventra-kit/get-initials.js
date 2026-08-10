/**
 * adds an avatar initials generator.
 */
export function getInitials(name, max = 2) {
  if (typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, max).map(p => p.charAt(0).toUpperCase()).join('');
}
