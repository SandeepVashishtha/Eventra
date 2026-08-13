
/**
 * adds a pascal case helper.
 */
export function toPascalCaseUpper(str) {
  const camel = toCamelCaseLower(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

