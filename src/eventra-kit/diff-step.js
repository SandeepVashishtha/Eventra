/**
 * adds a diff-step helper.
 */
export function diffStep(value) {
  return value == null || String(value).trim() === '';
}

