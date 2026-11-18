/**
 * POST /api/forms/validate
 *
 * Dynamic React Form Field Template Validation Controller
 * Resolves Issue #18853
 *
 * Accepts a JSON Schema (representing the React form template) and
 * the user's submitted form data, sanitizes string inputs, validates
 * against the schema (including custom regex pattern rules), and
 * returns field-level error mappings.
 */

import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Tiny HTML / XSS sanitizer (no external deps needed in Next.js)
// Strips all HTML tags and dangerous characters from string values.
// ---------------------------------------------------------------------------
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value
    // Remove script/style blocks including their content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove all remaining HTML tags (opening/closing/self-closing)
    .replace(/<[^>]*>/g, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
    // Remove on* event handlers  
    .replace(/\bon\w+\s*=/gi, "")
    .trim();
}

function sanitizeNode(node) {
  if (node === null || node === undefined) return node;
  if (typeof node === "string") return sanitizeString(node);
  if (Array.isArray(node)) return node.map(sanitizeNode);
  if (typeof node === "object") {
    const cleaned = {};
    for (const [k, v] of Object.entries(node)) {
      cleaned[k] = sanitizeNode(v);
    }
    return cleaned;
  }
  // numbers, booleans – pass through as-is
  return node;
}

// ---------------------------------------------------------------------------
// Minimal JSON-Schema validator (Draft 2020-12 subset)
// Supports: type, required, properties, minLength, maxLength,
//           minimum, maximum, pattern, format (email / url / date)
// ---------------------------------------------------------------------------
const FORMAT_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
};

function validateNode(data, schema, path, errors) {
  if (!schema || typeof schema !== "object") return;

  const fieldName = path || "$";

  // ---- type check ----
  if (schema.type) {
    const jsType = typeof data;
    const isNull = data === null || data === undefined;
    const typeMap = {
      string: () => jsType === "string",
      number: () => jsType === "number",
      integer: () => Number.isInteger(data),
      boolean: () => jsType === "boolean",
      array: () => Array.isArray(data),
      object: () => jsType === "object" && !Array.isArray(data) && !isNull,
      null: () => isNull,
    };

    if (!isNull && typeMap[schema.type] && !typeMap[schema.type]()) {
      pushError(
        errors,
        fieldName,
        `Expected type "${schema.type}", got "${jsType}".`
      );
    }
  }

  // ---- string constraints ----
  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      pushError(
        errors,
        fieldName,
        `Must be at least ${schema.minLength} character(s) long (got ${data.length}).`
      );
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      pushError(
        errors,
        fieldName,
        `Must be at most ${schema.maxLength} character(s) long (got ${data.length}).`
      );
    }
    if (schema.pattern) {
      try {
        const re = new RegExp(schema.pattern);
        if (!re.test(data)) {
          pushError(
            errors,
            fieldName,
            `Does not match the required pattern: ${schema.pattern}`
          );
        }
      } catch {
        pushError(errors, fieldName, `Invalid regex pattern in schema: ${schema.pattern}`);
      }
    }
    if (schema.format && FORMAT_PATTERNS[schema.format]) {
      if (!FORMAT_PATTERNS[schema.format].test(data)) {
        pushError(
          errors,
          fieldName,
          `Invalid format: expected "${schema.format}".`
        );
      }
    }
    if (schema.enum && !schema.enum.includes(data)) {
      pushError(
        errors,
        fieldName,
        `Value must be one of: ${schema.enum.join(", ")}.`
      );
    }
  }

  // ---- number constraints ----
  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      pushError(errors, fieldName, `Must be ≥ ${schema.minimum} (got ${data}).`);
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      pushError(errors, fieldName, `Must be ≤ ${schema.maximum} (got ${data}).`);
    }
    if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
      pushError(errors, fieldName, `Must be a multiple of ${schema.multipleOf}.`);
    }
  }

  // ---- object: required + properties ----
  if (schema.type === "object" || schema.properties) {
    const obj = typeof data === "object" && data !== null && !Array.isArray(data) ? data : {};

    // required fields
    if (Array.isArray(schema.required)) {
      for (const req of schema.required) {
        if (obj[req] === undefined || obj[req] === null || obj[req] === "") {
          const reqPath = path ? `${path}.${req}` : req;
          pushError(errors, reqPath, `This field is required.`);
        }
      }
    }

    // validate each property against its sub-schema
    if (schema.properties && typeof schema.properties === "object") {
      for (const [prop, subSchema] of Object.entries(schema.properties)) {
        const propPath = path ? `${path}.${prop}` : prop;
        const propValue = obj[prop];
        // Only validate if present (required check is done above)
        if (propValue !== undefined && propValue !== null) {
          validateNode(propValue, subSchema, propPath, errors);
        }
      }
    }

    // additionalProperties: false
    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(obj)) {
        if (!schema.properties[key]) {
          const extraPath = path ? `${path}.${key}` : key;
          pushError(errors, extraPath, `Additional property "${key}" is not allowed.`);
        }
      }
    }
  }

  // ---- array constraints ----
  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      pushError(errors, fieldName, `Must have at least ${schema.minItems} item(s).`);
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      pushError(errors, fieldName, `Must have at most ${schema.maxItems} item(s).`);
    }
    if (schema.items) {
      data.forEach((item, i) => {
        validateNode(item, schema.items, `${fieldName}[${i}]`, errors);
      });
    }
  }
}

function pushError(errors, field, message) {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { valid: false, message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { schema, formData } = body ?? {};

  if (!schema || !formData) {
    return NextResponse.json(
      {
        valid: false,
        message: "Both 'schema' and 'formData' are required fields.",
      },
      { status: 400 }
    );
  }

  if (typeof schema !== "object" || Array.isArray(schema)) {
    return NextResponse.json(
      { valid: false, message: "'schema' must be a JSON object." },
      { status: 400 }
    );
  }

  // 1. Input Sanitization Sweep
  const sanitizedData = sanitizeNode(formData);

  // 2. Validate against schema
  const errors = {};
  try {
    validateNode(sanitizedData, schema, "", errors);
  } catch (err) {
    return NextResponse.json(
      {
        valid: false,
        message: `Schema validation error: ${err.message}`,
      },
      { status: 400 }
    );
  }

  // Normalise keys: strip leading dot from root-level field paths
  const normalisedErrors = {};
  for (const [k, v] of Object.entries(errors)) {
    const key = k.startsWith(".") ? k.slice(1) : k || "general";
    normalisedErrors[key] = v;
  }

  if (Object.keys(normalisedErrors).length === 0) {
    return NextResponse.json(
      {
        valid: true,
        sanitizedData,
        errors: {},
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      valid: false,
      errors: normalisedErrors,
    },
    { status: 422 }
  );
}
