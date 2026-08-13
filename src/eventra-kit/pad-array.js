
/**
 * adds an array padding helper.
 */
import { fillArray } from './fill-array.js';

export function padArray(array, length, fill) {
  return array.length >= length ? array.slice(0, length) : array.concat(fillArray(length - array.length, fill));
}

