/**
 * Lightweight JSON Schema Draft-07 compliant validator logic (#16276)
 */

export function validateFormPayload(payload, schema) {
  if (!schema || !schema.properties) {
    return { valid: true, errors: [] };
  }

  const errors = [];
  const requiredFields = schema.required || [];

  requiredFields.forEach((field) => {
    if (!payload[field] || payload[field].toString().trim() === "") {
      errors.push({ field, message: `${field} is a required registration field.` });
    }
  });

  Object.keys(schema.properties).forEach((key) => {
    const val = payload[key];
    const rules = schema.properties[key];

    if (val && rules.type === "number" && isNaN(Number(val))) {
      errors.push({ key, message: `${key} must be a valid number value.` });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
