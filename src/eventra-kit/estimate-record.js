/**
 * adds a estimate-record helper.
 */
export function estimateRecord(value) {
  return typeof value === 'object' && value !== null ? Object.keys(value).length : 0;
}

