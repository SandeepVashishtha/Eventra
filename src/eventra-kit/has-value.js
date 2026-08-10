/**
 * adds presence helpers for forms.
 */
export function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export function required(value) {
  return hasValue(value) ? '' : 'This field is required';
}
