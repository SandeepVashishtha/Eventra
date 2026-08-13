/**
 * adds a compute-xml helper.
 */
export function computeXml(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

