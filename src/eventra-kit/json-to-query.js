
/**
 * adds a query-string builder.
 */
export function jsonToQuery(obj) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) params.set(key, String(value));
  return params.toString();
}

