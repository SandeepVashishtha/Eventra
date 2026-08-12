
/**
 * adds a version bump helper.
 */
export function bumpVersion(version, part = 'patch') {
  const parts = String(version).split('.').map(Number);
  const index = part === 'major' ? 0 : part === 'minor' ? 1 : 2;
  parts[index] = (parts[index] || 0) + 1;
  for (let i = index + 1; i < parts.length; i++) parts[i] = 0;
  return parts.join('.');
}

