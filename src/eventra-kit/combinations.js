
/**
 * adds a combination helper.
 */
export function combinations(array, size) {
  const out = [];
  const combo = [];
  function build(start) {
    if (combo.length === size) {
      out.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      build(i + 1);
      combo.pop();
    }
  }
  build(0);
  return out;
}

