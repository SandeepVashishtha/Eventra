/**
 * adds a chunk-list helper.
 */
export function chunkList(value, size) {
  const list = Array.isArray(value) ? value : [];
  const chunkSize = size > 0 ? size : 1;
  const result = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    result.push(list.slice(i, i + chunkSize));
  }
  return result;
}

