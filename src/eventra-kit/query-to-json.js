
/**
 * adds a query-string parser.
 */
export function queryToJson(query) {
  const params = new URLSearchParams(query);
  const out = {};
  for (const [key, value] of params.entries()) out[key] = value;
  return out;
}

