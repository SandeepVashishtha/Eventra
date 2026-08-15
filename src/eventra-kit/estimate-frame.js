/**
 * adds a estimate-frame helper.
 */
export function estimateFrame(value) {
  return value.map((item, index) => ({ item, index }));
}

