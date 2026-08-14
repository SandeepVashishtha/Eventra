
/**
 * adds a pascal case helper.
 */
import { toCamelCaseLower } from './to-camel-case-lower.js';

export function toPascalCaseUpper(str) {
  const camel = toCamelCaseLower(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

