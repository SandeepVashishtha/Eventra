export function getDiff(local, server) {
  const diffs = [];
  const allKeys = Array.from(new Set([...Object.keys(local), ...Object.keys(server)]));

  for (const key of allKeys) {
    if (local[key] !== server[key]) {
      diffs.push({
        field: key,
        localVal: local[key],
        serverVal: server[key]
      });
    }
  }

  return diffs;
}
