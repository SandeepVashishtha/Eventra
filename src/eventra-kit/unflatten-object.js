
/**
 * adds an object unflattener.
 */
export function unflattenObject(obj, separator = '.') {
  const out = {};
  for (const [path, value] of Object.entries(obj)) {
    setPathValue(out, path.replace(new RegExp(`\\${separator}`, 'g'), '.'), value);
  }
  return out;
}

