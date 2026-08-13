/**
 * K-Anonymity privacy suppression and bucket sorting algorithms (#16282)
 */

export function anonymizeDataset(data = [], kThreshold = 3) {
  const buckets = new Map();

  // Group data rows into age bracket buckets to anonymize demographics
  data.forEach((row) => {
    const ageBracket = Math.floor(row.age / 10) * 10;
    const bucketKey = `${row.gender}_${ageBracket}s`;

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey).push(row);
  });

  const anonymized = [];
  const suppressedCount = [];

  buckets.forEach((rows, key) => {
    if (rows.length >= kThreshold) {
      anonymized.push({
        bucket: key,
        count: rows.length,
        items: rows
      });
    } else {
      suppressedCount.push(...rows);
    }
  });

  return {
    anonymized,
    suppressedCount: suppressedCount.length,
    kThreshold
  };
}
