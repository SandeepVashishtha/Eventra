
/**
 * adds a case converter helper.
 */
import { toCamelCaseLower } from './to-camel-case-lower.js';
import { toPascalCaseUpper } from './to-pascal-case-upper.js';
import { toKebabCaseLower } from './to-kebab-case-lower.js';
import { toSnakeCaseUpper } from './to-snake-case-upper.js';

export function convertCaseTo(str, target) {
  const map = {
    camel: toCamelCaseLower,
    pascal: toPascalCaseUpper,
    kebab: toKebabCaseLower,
    snake: toSnakeCaseUpper,
  };
  return (map[target] || toKebabCaseLower)(str);
}

