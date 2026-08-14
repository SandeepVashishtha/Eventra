import { normalizePath } from './normalize-path.js';

/**
 * adds a path depth helper.
 */
export function pathDepth(path) {
  return normalizePath(path).split('/').filter(Boolean).length;
}

