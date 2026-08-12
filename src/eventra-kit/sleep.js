/**
 * adds a promise-based delay helper.
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
