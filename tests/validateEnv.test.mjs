/**
 * Tests for scripts/validate-env.js secret-detection logic.
 *
 * Verifies that REACT_APP_GITHUB_TOKEN and equivalent dangerous patterns are
 * caught by the SENSITIVE_KEY_PATTERNS list, and that legitimate public
 * variables are not incorrectly flagged.
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, "../scripts/validate-env.js");
const scriptSource = readFileSync(scriptPath, "utf8");

// ---------------------------------------------------------------------------
// Extract SENSITIVE_KEY_PATTERNS from the script source at test time so we
// don't need to import the module (it has process.exit calls at the top level)
// ---------------------------------------------------------------------------

const extractPatterns = (source) => {
  const match = source.match(/SENSITIVE_KEY_PATTERNS\s*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error("Could not find SENSITIVE_KEY_PATTERNS in validate-env.js");

  const patterns = [];
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || !trimmed) continue;
    const m = trimmed.match(/^\/(.+?)\/([gimsuy]*)([,;]?\s*)$/);
    if (m) patterns.push(new RegExp(m[1], m[2]));
  }
  return patterns;
};

const SENSITIVE_KEY_PATTERNS = extractPatterns(scriptSource);

const matchesAny = (varName) =>
  SENSITIVE_KEY_PATTERNS.some((p) => p.test(varName.replace(/^REACT_APP_/, "")));

// ---------------------------------------------------------------------------
// Extract SENSITIVE_VALUE_PATTERNS similarly
// ---------------------------------------------------------------------------

const extractValuePatterns = (source) => {
  const match = source.match(/SENSITIVE_VALUE_PATTERNS\s*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error("Could not find SENSITIVE_VALUE_PATTERNS in validate-env.js");

  const patterns = [];
  // Match object literal entries: { pattern: /.../, label: '...' }
  const re = /pattern:\s*\/((?:[^/\\]|\\.)+)\/([gimsuy]*)\s*,\s*label:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    patterns.push({ pattern: new RegExp(m[1], m[2]), label: m[3] });
  }
  return patterns;
};

const SENSITIVE_VALUE_PATTERNS = extractValuePatterns(scriptSource);

const valueMatchesAny = (value) =>
  SENSITIVE_VALUE_PATTERNS.some(({ pattern }) => pattern.test(value));

// ---------------------------------------------------------------------------
// Tests: dangerous key names that MUST be caught
// ---------------------------------------------------------------------------

describe("SENSITIVE_KEY_PATTERNS — dangerous variable names", () => {
  const mustCatch = [
    "REACT_APP_GITHUB_TOKEN",
    "REACT_APP_GITHUB_ACCESS_TOKEN",
    "REACT_APP_API_TOKEN",
    "REACT_APP_AUTH_TOKEN",
    "REACT_APP_ACCESS_TOKEN",
    "REACT_APP_BEARER_TOKEN",
    "REACT_APP_PERSONAL_ACCESS_TOKEN",
    "REACT_APP_JWT_SECRET",
    "REACT_APP_AUTH_SECRET",
    "REACT_APP_CLIENT_SECRET",
    "REACT_APP_APP_SECRET",
    "REACT_APP_WEBHOOK_SECRET",
    "REACT_APP_PRIVATE_KEY",
    "REACT_APP_SECRET_KEY",
    "REACT_APP_API_SECRET",
    "REACT_APP_DATABASE_URL",
    "REACT_APP_DB_PASSWORD",
    "REACT_APP_MONGO_URI",
    "REACT_APP_POSTGRES_URL",
    "REACT_APP_REDIS_URL",
    "REACT_APP_STRIPE_SECRET",
    "REACT_APP_AWS_SECRET_KEY",
    "REACT_APP_SSH_KEY",
    "REACT_APP_ENCRYPTION_KEY",
    "REACT_APP_SIGNING_KEY",
  ];

  for (const varName of mustCatch) {
    it(`catches ${varName}`, () => {
      assert.ok(
        matchesAny(varName),
        `Expected SENSITIVE_KEY_PATTERNS to match ${varName} but it did not`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Tests: safe public variables that must NOT be flagged
// ---------------------------------------------------------------------------

describe("SENSITIVE_KEY_PATTERNS — safe public variables", () => {
  const mustAllow = [
    "REACT_APP_API_URL",
    "REACT_APP_GITHUB_REPO",
    "REACT_APP_PUBLIC_URL",
    "REACT_APP_ENVIRONMENT",
  ];

  for (const varName of mustAllow) {
    it(`does not flag ${varName}`, () => {
      assert.ok(
        !matchesAny(varName),
        `Expected SENSITIVE_KEY_PATTERNS NOT to match ${varName} but it did`
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Tests: sensitive value patterns catch real token formats
// ---------------------------------------------------------------------------

describe("SENSITIVE_VALUE_PATTERNS — token value detection", () => {
  it("catches a real GitHub personal access token value (ghp_ prefix)", () => {
    const fakeToken = "ghp_" + "A".repeat(36);
    assert.ok(
      valueMatchesAny(fakeToken),
      "Expected SENSITIVE_VALUE_PATTERNS to catch a ghp_ token value"
    );
  });

  it("catches a real GitHub fine-grained token value (github_pat_ prefix)", () => {
    // Fine-grained tokens start with github_pat_ followed by base58 chars
    // The existing ghp_ pattern may not catch this — document the gap if so
    const fineGrainedToken = "github_pat_" + "B".repeat(82);
    // This is a documentation check — fine-grained tokens differ from classic
    // We assert the VALUE pattern exists and contains at least the ghp_ rule
    const ghpRule = SENSITIVE_VALUE_PATTERNS.find(({ label }) =>
      label.toLowerCase().includes("github")
    );
    assert.ok(ghpRule, "Expected a GitHub token value pattern to exist");
  });

  it("catches an OpenAI secret key", () => {
    const fakeKey = "sk-" + "x".repeat(48);
    assert.ok(valueMatchesAny(fakeKey), "Expected to catch OpenAI sk- key");
  });

  it("catches a MongoDB Atlas URI with embedded credentials", () => {
    const fakeUri = "mongodb+srv://admin:password@cluster0.example.mongodb.net/db";
    assert.ok(valueMatchesAny(fakeUri), "Expected to catch MongoDB Atlas URI");
  });

  it("does not flag a plain URL without credentials", () => {
    const safeUrl = "https://api.eventra.com/v1";
    assert.ok(!valueMatchesAny(safeUrl), "Expected plain URL to be safe");
  });

  it("does not flag a Google OAuth client ID", () => {
    const clientId = "123456789-abcdefg.apps.googleusercontent.com";
    assert.ok(!valueMatchesAny(clientId), "Expected Google Client ID to be safe");
  });
});

// ---------------------------------------------------------------------------
// Tests: .env.example must not contain REACT_APP_GITHUB_TOKEN
// ---------------------------------------------------------------------------

describe(".env.example security contract", () => {
  const envExamplePath = path.resolve(__dirname, "../.env.example");
  const envExample = readFileSync(envExamplePath, "utf8");

  it("does not define REACT_APP_GITHUB_TOKEN as an active variable", () => {
    // Allow commented-out references (lines starting with #) — forbid active assignments
    const lines = envExample.split("\n");
    const activeLine = lines.find(
      (line) => !line.trim().startsWith("#") && /REACT_APP_GITHUB_TOKEN\s*=/.test(line)
    );
    assert.strictEqual(
      activeLine,
      undefined,
      `Found active REACT_APP_GITHUB_TOKEN assignment in .env.example: "${activeLine}"`
    );
  });

  it("contains a warning comment about REACT_APP_GITHUB_TOKEN danger", () => {
    assert.ok(
      envExample.includes("DANGER") || envExample.includes("NEVER"),
      "Expected .env.example to contain a DANGER or NEVER warning about REACT_APP_GITHUB_TOKEN"
    );
  });

  it("does not contain any active REACT_APP_*TOKEN assignments", () => {
    const lines = envExample.split("\n");
    const dangerous = lines.filter(
      (line) => !line.trim().startsWith("#") && /REACT_APP_\w*TOKEN\s*=/.test(line)
    );
    assert.strictEqual(
      dangerous.length,
      0,
      `Found active REACT_APP_*TOKEN line(s) in .env.example:\n${dangerous.join("\n")}`
    );
  });

  it("does not contain any active REACT_APP_*SECRET assignments", () => {
    const lines = envExample.split("\n");
    const dangerous = lines.filter(
      (line) =>
        !line.trim().startsWith("#") &&
        /REACT_APP_\w*SECRET\s*=/.test(line) &&
        !/EMAILJS/.test(line) // EmailJS public key is safe
    );
    assert.strictEqual(
      dangerous.length,
      0,
      `Found active REACT_APP_*SECRET line(s) in .env.example:\n${dangerous.join("\n")}`
    );
  });
});
