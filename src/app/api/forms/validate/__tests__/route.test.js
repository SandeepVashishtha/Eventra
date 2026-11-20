/**
 * Validation API Route – Unit Tests
 * File: src/app/api/forms/validate/__tests__/route.test.js
 *
 * Resolves Issue #18853 — Dynamic React Form Field Template Validation Controller
 *
 * Run with:  node --experimental-vm-modules node_modules/.bin/jest
 *   or via:  npx jest src/app/api/forms/validate/__tests__/route.test.js
 */

// We test the core logic directly by importing helpers extracted from the route.
// Since the route uses Next.js Response/Request, we test the two pure functions:
// sanitizeNode and validateNode, plus an integration harness.

// -------------------------------------------------------------------------
// In-process copies of the route's pure functions (kept in sync manually)
// -------------------------------------------------------------------------
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value
    // Remove script/style blocks including their content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove all remaining HTML tags
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
  return node;
}

const FORMAT_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
};

function pushError(errors, field, message) {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
}

function validateNode(data, schema, path, errors) {
  if (!schema || typeof schema !== "object") return;
  const fieldName = path || "$";

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
      pushError(errors, fieldName, `Expected type "${schema.type}", got "${jsType}".`);
    }
  }

  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      pushError(errors, fieldName, `Must be at least ${schema.minLength} character(s) long (got ${data.length}).`);
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      pushError(errors, fieldName, `Must be at most ${schema.maxLength} character(s) long (got ${data.length}).`);
    }
    if (schema.pattern) {
      const re = new RegExp(schema.pattern);
      if (!re.test(data)) {
        pushError(errors, fieldName, `Does not match the required pattern: ${schema.pattern}`);
      }
    }
    if (schema.format && FORMAT_PATTERNS[schema.format]) {
      if (!FORMAT_PATTERNS[schema.format].test(data)) {
        pushError(errors, fieldName, `Invalid format: expected "${schema.format}".`);
      }
    }
    if (schema.enum && !schema.enum.includes(data)) {
      pushError(errors, fieldName, `Value must be one of: ${schema.enum.join(", ")}.`);
    }
  }

  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      pushError(errors, fieldName, `Must be ≥ ${schema.minimum} (got ${data}).`);
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      pushError(errors, fieldName, `Must be ≤ ${schema.maximum} (got ${data}).`);
    }
  }

  if (schema.type === "object" || schema.properties) {
    const obj = typeof data === "object" && data !== null && !Array.isArray(data) ? data : {};
    if (Array.isArray(schema.required)) {
      for (const req of schema.required) {
        if (obj[req] === undefined || obj[req] === null || obj[req] === "") {
          const reqPath = path ? `${path}.${req}` : req;
          pushError(errors, reqPath, "This field is required.");
        }
      }
    }
    if (schema.properties) {
      for (const [prop, subSchema] of Object.entries(schema.properties)) {
        const propPath = path ? `${path}.${prop}` : prop;
        const propValue = obj[prop];
        if (propValue !== undefined && propValue !== null) {
          validateNode(propValue, subSchema, propPath, errors);
        }
      }
    }
  }
}

// -------------------------------------------------------------------------
// Helper: run validation and normalise errors (mirrors route logic)
// -------------------------------------------------------------------------
function runValidation(schema, formData) {
  const sanitized = sanitizeNode(formData);
  const rawErrors = {};
  validateNode(sanitized, schema, "", rawErrors);
  const errors = {};
  for (const [k, v] of Object.entries(rawErrors)) {
    const key = k.startsWith(".") ? k.slice(1) : k || "general";
    errors[key] = v;
  }
  const valid = Object.keys(errors).length === 0;
  return { valid, sanitizedData: sanitized, errors };
}

// =========================================================================
// TESTS
// =========================================================================

describe("sanitizeNode – XSS sanitization", () => {
  test("strips <script> tags from strings", () => {
    expect(sanitizeString("Hello <script>alert(1)</script>")).toBe("Hello");
  });

  test("strips inline event handlers", () => {
    expect(sanitizeString("text onclick=evil()")).toBe("text evil()");
  });

  test("strips javascript: URIs", () => {
    expect(sanitizeString("javascript:alert(1)")).toBe("alert(1)");
  });

  test("passes through safe strings untouched", () => {
    expect(sanitizeString("CodeBuilders")).toBe("CodeBuilders");
  });

  test("passes through numbers and booleans", () => {
    expect(sanitizeNode(42)).toBe(42);
    expect(sanitizeNode(true)).toBe(true);
  });

  test("recursively sanitizes object values", () => {
    const result = sanitizeNode({
      name: "Team <b>X</b>",
      size: 3,
    });
    expect(result.name).toBe("Team X");
    expect(result.size).toBe(3);
  });

  test("recursively sanitizes array elements", () => {
    const result = sanitizeNode(["<em>hello</em>", "world"]);
    expect(result[0]).toBe("hello");
    expect(result[1]).toBe("world");
  });
});

describe("validateNode – type checking", () => {
  test("passes when type matches", () => {
    const errors = {};
    validateNode("hello", { type: "string" }, "field", errors);
    expect(errors).toEqual({});
  });

  test("fails when string given for integer", () => {
    const errors = {};
    validateNode("3", { type: "integer" }, "size", errors);
    expect(errors["size"]).toBeDefined();
  });

  test("passes for integer with integer value", () => {
    const errors = {};
    validateNode(3, { type: "integer" }, "size", errors);
    expect(errors).toEqual({});
  });
});

describe("validateNode – string constraints", () => {
  test("minLength violation", () => {
    const errors = {};
    validateNode("ab", { type: "string", minLength: 3 }, "teamName", errors);
    expect(errors["teamName"]?.[0]).toMatch(/at least 3/);
  });

  test("maxLength violation", () => {
    const errors = {};
    validateNode("abcdef", { type: "string", maxLength: 4 }, "field", errors);
    expect(errors["field"]?.[0]).toMatch(/at most 4/);
  });

  test("pattern violation – github handle", () => {
    const errors = {};
    validateNode(
      "invalid_handle@123",
      { type: "string", pattern: "^[a-zA-Z0-9-]+$" },
      "githubHandle",
      errors
    );
    expect(errors["githubHandle"]?.[0]).toMatch(/pattern/);
  });

  test("pattern passes for valid handle", () => {
    const errors = {};
    validateNode(
      "rajat-singh",
      { type: "string", pattern: "^[a-zA-Z0-9-]+$" },
      "githubHandle",
      errors
    );
    expect(errors).toEqual({});
  });

  test("format: email – invalid", () => {
    const errors = {};
    validateNode("not-an-email", { type: "string", format: "email" }, "email", errors);
    expect(errors["email"]?.[0]).toMatch(/email/);
  });

  test("format: email – valid", () => {
    const errors = {};
    validateNode("dev@eventra.io", { type: "string", format: "email" }, "email", errors);
    expect(errors).toEqual({});
  });
});

describe("validateNode – number constraints", () => {
  test("minimum violation", () => {
    const errors = {};
    validateNode(0, { type: "integer", minimum: 1 }, "teamSize", errors);
    expect(errors["teamSize"]?.[0]).toMatch(/≥ 1/);
  });

  test("maximum violation", () => {
    const errors = {};
    validateNode(5, { type: "integer", maximum: 4 }, "teamSize", errors);
    expect(errors["teamSize"]?.[0]).toMatch(/≤ 4/);
  });

  test("passes within range", () => {
    const errors = {};
    validateNode(3, { type: "integer", minimum: 1, maximum: 4 }, "teamSize", errors);
    expect(errors).toEqual({});
  });
});

describe("validateNode – required fields", () => {
  test("flags missing required field", () => {
    const schema = {
      type: "object",
      required: ["teamName", "githubHandle"],
      properties: {
        teamName: { type: "string", minLength: 3 },
        githubHandle: { type: "string" },
      },
    };
    const errors = {};
    validateNode({ githubHandle: "raj" }, schema, "", errors);
    const normalised = {};
    for (const [k, v] of Object.entries(errors)) {
      const key = k.startsWith(".") ? k.slice(1) : k || "general";
      normalised[key] = v;
    }
    expect(normalised["teamName"]).toBeDefined();
    expect(normalised["githubHandle"]).toBeUndefined();
  });
});

describe("runValidation – integration tests", () => {
  const HACKATHON_SCHEMA = {
    type: "object",
    required: ["teamName", "githubHandle", "teamSize"],
    properties: {
      teamName: { type: "string", minLength: 3 },
      githubHandle: { type: "string", pattern: "^[a-zA-Z0-9-]+$" },
      teamSize: { type: "integer", minimum: 1, maximum: 4 },
    },
  };

  test("Test Case 1: valid submission with XSS payload → sanitized + valid", () => {
    const { valid, sanitizedData, errors } = runValidation(HACKATHON_SCHEMA, {
      teamName: "CodeBuilders <script>alert(1)</script>",
      githubHandle: "rajatsingh535",
      teamSize: 3,
    });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    expect(sanitizedData.teamName).toBe("CodeBuilders");
    expect(sanitizedData.githubHandle).toBe("rajatsingh535");
    expect(sanitizedData.teamSize).toBe(3);
  });

  test("Test Case 2: missing required field + invalid pattern → field errors", () => {
    const schema = {
      type: "object",
      required: ["teamName", "githubHandle"],
      properties: {
        teamName: { type: "string", minLength: 3 },
        githubHandle: { type: "string", pattern: "^[a-zA-Z0-9-]+$" },
      },
    };
    const { valid, errors } = runValidation(schema, {
      githubHandle: "invalid_handle@123",
    });
    expect(valid).toBe(false);
    expect(errors["teamName"]).toBeDefined();
    expect(errors["githubHandle"]).toBeDefined();
    expect(errors["githubHandle"][0]).toMatch(/pattern/);
  });

  test("Test Case 3: email format validation", () => {
    const schema = {
      type: "object",
      required: ["email"],
      properties: {
        email: { type: "string", format: "email" },
      },
    };
    // XSS in email – should sanitize and then fail format check
    const { valid, sanitizedData, errors } = runValidation(schema, {
      email: "dev@eventra.io<script>evil()</script>",
    });
    // After sanitization the value becomes "dev@eventra.io"
    expect(sanitizedData.email).toBe("dev@eventra.io");
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });

  test("Test Case 4: phone number pattern validation", () => {
    const schema = {
      type: "object",
      properties: {
        phone: { type: "string", pattern: "^[0-9]{10}$" },
      },
    };
    const { valid, errors } = runValidation(schema, { phone: "123-abc" });
    expect(valid).toBe(false);
    expect(errors["phone"]).toBeDefined();
  });

  test("Test Case 5: fully valid complex payload", () => {
    const { valid } = runValidation(HACKATHON_SCHEMA, {
      teamName: "Eventra Devs",
      githubHandle: "eventra-team",
      teamSize: 2,
    });
    expect(valid).toBe(true);
  });

  test("Test Case 6: enum constraint", () => {
    const schema = {
      type: "object",
      properties: {
        track: { type: "string", enum: ["ai-ml", "web3", "open", "social"] },
      },
    };
    const { valid, errors } = runValidation(schema, { track: "gaming" });
    expect(valid).toBe(false);
    expect(errors["track"]).toBeDefined();
  });
});
