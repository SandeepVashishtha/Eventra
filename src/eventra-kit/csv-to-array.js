
/**
 * adds a csv parser.
 */
export function csvToArray(csv, delimiter = ',') {
  return csv.split(/\r?\n/).filter(Boolean).map((row) => row.split(delimiter));
}

