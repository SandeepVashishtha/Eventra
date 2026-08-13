/**
 * adds a create-xml helper.
 */
export function createXml(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

