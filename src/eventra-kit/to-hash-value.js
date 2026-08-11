
/**
 * adds a djb2 hash helper.
 */
export function toHashValue(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(16);
}

