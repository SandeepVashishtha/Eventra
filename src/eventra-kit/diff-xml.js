/**
 * adds a diff-xml helper.
 */
export function diffXml(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

