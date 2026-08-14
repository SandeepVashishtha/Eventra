/**
 * adds a dedupe-record helper.
 */
export function dedupeRecord(records, key = 'id') {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  return records.filter((record) => {
    const id = record && record[key];
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

