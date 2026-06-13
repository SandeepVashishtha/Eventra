#!/usr/bin/env node

"use strict";

import fs from "fs";
import path from "path";

/* -------------------------------------------------------
 * Load .env file
 * ----------------------------------------------------- */
function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");

    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, "utf8");

    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();

      if (
        !trimmed ||
        trimmed.startsWith("#") ||
        !trimmed.includes("=")
      ) {
        return;
      }

      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").replace(/^['"]|['"]$/g, "");

      if (key && !process.env[key]) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch {
    console.warn("[validate-env] Could not load .env file");
  }
}

loadEnvFile();

/* -------------------------------------------------------
 * Config
 * ----------------------------------------------------- */

const REQUIRED_SERVER_VARS = ["JWT_SECRET"];

const BACKEND_URL_VARS = [
  "BACKEND_URL",
  "VITE_API_URL",
  "REACT_APP_API_URL",
];

const FORMAT_VALIDATIONS = {
  BACKEND_URL: /^https?:\/\/.+/,
  VITE_API_URL: /^https?:\/\/.+/,
  REACT_APP_API_URL: /^https?:\/\/.+/,
};

const ALLOWED_CLIENT_VARS = new Set([
  "REACT_APP_API_URL",
  "REACT_APP_GITHUB_REPO",
  "REACT_APP_PUBLIC_URL",
  "REACT_APP_VAPID_PUBLIC_KEY",
  "REACT_APP_CSP_REPORT_URI",
]);

const SENSITIVE_KEY_PATTERNS = [
  /secret/i,
  /private/i,
  /password/i,
  /token/i,
  /credential/i,
  /jwt/i,
  /github.*token/i,
  /access.*key/i,
];

const SENSITIVE_VALUE_PATTERNS = [
  /-----BEGIN .*PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9_]+/,
  /github_pat_[A-Za-z0-9_]+/,
  /sk-[A-Za-z0-9_-]+/,
];

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

const errors = [];

function addError(message) {
  errors.push(message);
  console.error(`  ERROR: ${message}`);
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

/* -------------------------------------------------------
 * Backend URL Validation
 * ----------------------------------------------------- */

console.log("\n[validate-env] Checking backend configuration...\n");

const configuredBackend = BACKEND_URL_VARS.find(
  (key) => process.env[key]?.trim()
);

if (!configuredBackend) {
  addError(
    "[CONFIG ERROR] No backend URL configured. Set BACKEND_URL, VITE_API_URL or REACT_APP_API_URL."
  );
} else {
  console.log(`  OK: ${configuredBackend} is configured`);
}

/* -------------------------------------------------------
 * Required Variables
 * ----------------------------------------------------- */

console.log("\nChecking required variables...\n");

for (const variable of REQUIRED_SERVER_VARS) {
  const value = process.env[variable];

  if (!value?.trim()) {
    addError(
      `[CRITICAL ERROR] ${variable} is missing or empty`
    );
  } else {
    console.log(`  OK: ${variable} = [set]`);
  }
}

/* -------------------------------------------------------
 * URL Format Validation
 * ----------------------------------------------------- */

console.log("\nValidating URL formats...\n");

for (const [key, regex] of Object.entries(FORMAT_VALIDATIONS)) {
  const value = process.env[key];

  if (!value) continue;

  if (!regex.test(value)) {
    addError(`[FORMAT ERROR] Invalid URL format in ${key}`);
  } else {
    console.log(`  OK: ${key}`);
  }
}

if (
  isProduction() &&
  process.env.VITE_API_URL &&
  !process.env.VITE_API_URL.startsWith("https://")
) {
  addError(
    "[SECURITY ERROR] VITE_API_URL must use HTTPS in production"
  );
}

/* -------------------------------------------------------
 * Client Variable Security Scan
 * ----------------------------------------------------- */

console.log("\nScanning client variables...\n");

const clientVars = Object.keys(process.env).filter(
  (key) =>
    key.startsWith("VITE_") ||
    key.startsWith("REACT_APP_")
);

for (const key of clientVars) {
  if (ALLOWED_CLIENT_VARS.has(key)) continue;

  const value = process.env[key] || "";

  if (SENSITIVE_KEY_PATTERNS.some((r) => r.test(key))) {
    addError(
      `[SECURITY LEAK] Sensitive variable exposed: ${key}`
    );
  }

  if (
    SENSITIVE_VALUE_PATTERNS.some((r) => r.test(value))
  ) {
    addError(
      `[SECURITY LEAK] ${key} contains a sensitive value`
    );
  }
}

/* -------------------------------------------------------
 * Result
 * ----------------------------------------------------- */

if (errors.length) {
  console.error(
    `\n[validate-env] BUILD ABORTED: ${errors.length} issue(s) found.\n`
  );
  process.exit(1);
}

console.log(
  `\n[validate-env] Environment validation passed.\n`
);

process.exit(0);
