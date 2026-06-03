export const validators = {
  isObject: (value) =>
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value),

  isArray: (value) => Array.isArray(value),

  isString: (value) => typeof value === "string",

  isNumber: (value) => typeof value === "number",

  isBoolean: (value) => typeof value === "boolean",
};
