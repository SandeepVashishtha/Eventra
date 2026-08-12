
/**
 * adds a path join helper.
 */
export function joinPathParts(...parts) {
  return parts.join('/').replace(/\/+/g, '/');
}

