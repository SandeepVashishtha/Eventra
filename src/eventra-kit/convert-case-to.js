
/**
 * adds a case converter helper.
 */
export function convertCaseTo(str, target) {
  const map = {
    camel: toCamelCaseLower,
    pascal: toPascalCaseUpper,
    kebab: toKebabCaseLower,
    snake: toSnakeCaseUpper,
  };
  return (map[target] || toKebabCaseLower)(str);
}

