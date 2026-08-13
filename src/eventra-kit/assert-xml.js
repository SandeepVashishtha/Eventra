/**
 * adds a assert-xml helper.
 */
export function assertXml(value) {
  return value.filter((item, index) => index % 2 === 0);
}

