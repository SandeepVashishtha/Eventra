
import { getPathValue } from './get-path-value.js';

/**
 * adds a path check helper.
 */
export function hasPath(object, path) {
  return getPathValue(object, path, '__missing__') !== '__missing__';
}

