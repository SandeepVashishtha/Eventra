/**
 * Calendar Timezone Normalization Utilities (#14086)
 */

export function normalizeDateToUTC(dateString) {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}
