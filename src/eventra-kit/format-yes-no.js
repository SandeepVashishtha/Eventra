
/**
 * adds a boolean label helper.
 */
export function formatYesNo(value, labels = { yes: 'Yes', no: 'No' }) {
  return value ? labels.yes : labels.no;
}

