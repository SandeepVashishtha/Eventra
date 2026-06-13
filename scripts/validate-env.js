#!/usr/bin/env node
/**
 * scripts/validate-env.js
 *
 * Build-time environment variable sanitation and validation script.
 * Prevents accidental leakage of private credentials into client bundles.
 */

"use strict";

import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const eqIdx = trimmed.indexOf("=");
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  // Ignore
}

const SENSITIVE_KEY_PATTERNS = [
  /private[_\-]?key/i,
  /secret[_\-]?key/i,
  /api[_\-]?secret/i,
  /database[_\-]?url/i,
  /db[_\-]?(password|url|host|secret)/i,
  /mongo[_\-]?uri/i,
  /postgres[_\-]?url/i,
  /mysql[_\-]?url/i,
  /redis[_\-]?url/i,
  /jwt[_\-]?(secret|private)/i,
  /auth[_\-]?secret/i,
  /stripe[_\-]?secret/i,
  /twilio[_\-]?auth/i,
  /sendgrid[_\-]?api[_\-]?key/i,
  /aws[_\-]?(secret|access[_\-]?key)/i,
  /firebase[_\-]?private/i,
  /gcp[_\-]?service[_\-]?account/i,
  /ssh[_\-]?key/i,
  /encryption[_\-]?key/i,
  /signing[_\-]?key/i,
  /github[_\-]?token/i,
  /access[_\-]?token/i,
  /bearer[_\-]?token/i,
  /personal[_\-]?access/i,
  /api[_\-]?token/i,
  /auth[_\-]?token/i,
  /[_\-]?password$/i,
  /[_\-]?passwd$/i,
  /[_\-]?credential/i,
  /webhook[_\-]?secret/i,
  /client[_\-]?secret/i,
  /app[_\-]?secret/i,
];

const SENSITIVE_VALUE_PATTERNS = [
  { pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: 'PEM private key' },
  { pattern: /AIza[0-9A-Za-z\-_]{35}/, label: 'Google API key' },
  { pattern: /sk-[A-Za-z0-9_-]{32,}/, label: 'OpenAI secret key' },
  { pattern: /rk_live_[0-9a-zA-Z]{24}/, label: 'Stripe restricted key' },
  { pattern: /SK[0-9a-f]{32}/, label: 'Twilio auth token' },
  { pattern: /xox[baprs]-[0-9a-zA-Z]{10,}/, label: 'Slack API token' },
  { pattern: /mongodb(\+srv)?:\/\/[^:\s]+:[^@\s]+@/, label: 'MongoDB URI with credentials' },
  { pattern: /postgres(ql)?:\/\/[^:\s]+:[^@\s]+@/, label: 'PostgreSQL URI with credentials' },
  { pattern: /mysql:\/\/[^:\s]+:[^@\s]+@/, label: 'MySQL URI with credentials' },
  { pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/, label: 'GitHub personal access token' },
  { pattern: /github_pat_[A-Za-z0-9_]{22,}/, label: 'GitHub fine-grained personal access token' },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\./, label: 'JWT token (hardcoded)' },
];

const ALLOWED_EXCEPTIONS = new Set([
  "REACT_APP_API_URL",
  "REACT_APP_GITHUB_REPO",
  "REACT_APP_PUBLIC_URL",
  "REACT_APP_VAPID_PUBLIC_KEY",
  "REACT_APP_CSP_REPORT_URI",
]);

const BACKEND_URL_VARS = ["BACKEND_URL", "VITE_API_URL", "REACT_APP_API_URL"];
const REQUIRED_VARS = ["JWT_SECRET"];
const PRODUCTION_REQUIRED_VARS = ["DATABASE_URL"];

const FORMAT_VALIDATED_VARS = {
  BACKEND_URL: {
    pattern: /^https?:\/\/.+/,
    message: "BACKEND_URL must be a valid HTTP/HTTPS URL (for example: https://api.example.com)",
  },
  VITE_API_URL: {
    pattern: /^https?:\/\/.+/,
    message: "VITE_API_URL must be a valid HTTP/HTTPS URL (for example: https://api.example.com)",
  },
  REACT_APP_API_URL: {
    pattern: /^https?:\/\/.+/,
    message: "REACT_APP_API_URL must be a valid HTTP/HTTPS URL (for example: https://api.example.com)",
  },
};

const OPTIONAL_VARS = [];

let hasErrors = false;
const errors = [];
const warnings = [];

console.log("\n[validate-env] Scanning environment variables for security issues...\n");

console.log("Required backend configuration:");
const configuredBackendVars = BACKEND_URL_VARS.filter(
  (varName) => process.env[varName] && process.env[varName].trim()
);
if (configuredBackendVars.length === 0) {
  const msg =
    "Backend URL is not configured. Set BACKEND_URL, VITE_API_URL, or REACT_APP_API_URL before starting the application.";
  errors.push(`[CONFIG ERROR] ${msg}`);
  hasErrors = true;
} else {
  console.log(`  OK: ${configuredBackendVars.join(" or ")} = [set]`);
}

console.log("\nRequired server variables:");
for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    const isJwtSecret = varName === "JWT_SECRET";
    const errorMsg = isJwtSecret
      ? `[CRITICAL SECURITY ERROR] ${varName} is missing. This is a critical security vulnerability that allows unauthorized access. Generate a secure secret using: openssl rand -base64 32`
      : `Required variable ${varName} is not set`;
    
    console.error(`  ERROR: ${errorMsg}`);
    errors.push(errorMsg);
    hasErrors = true;
  } else {
    // Additional validation for JWT_SECRET to ensure it's not empty or whitespace
    if (varName === "JWT_SECRET" && !process.env[varName].trim()) {
      const errorMsg = `[CRITICAL SECURITY ERROR] JWT_SECRET is empty or whitespace-only. This is a critical security vulnerability. Generate a secure secret using: openssl rand -base64 32`;
      console.error(`  ERROR: ${errorMsg}`);
      errors.push(errorMsg);
      hasErrors = true;
    } else {
      console.log(`  OK: ${varName} = [set]`);
    }
  }
}

if (process.env.REACT_APP_GROQ_API_KEY) {
  const msg =
    "[SECURITY LEAK] REACT_APP_GROQ_API_KEY must not be exposed via REACT_APP_. Move it server-side only.";
  errors.push(msg);
  hasErrors = true;
}

console.log("\nOptional variables:");
if (OPTIONAL_VARS.length === 0) {
  console.log("  (none configured)");
} else {
  for (const varName of OPTIONAL_VARS) {
    if (!process.env[varName]) {
      console.log(`  - ${varName} (not set)`);
    } else {
      console.log(`  OK: ${varName} = [set]`);
    }
  }
}

console.log("\nValidating variable formats...");
  if (process.env.NODE_ENV === "production" && process.env.VITE_API_URL && !process.env.VITE_API_URL.startsWith("https://")) {
    const msg = "[CRITICAL SECURITY WARNING] VITE_API_URL must use HTTPS in production";
    errors.push(msg);
    hasErrors = true;
    console.error(`  ERROR: ${msg}`);
  }

console.log("\nValidating production-specific requirements...");
if (process.env.NODE_ENV === "production") {
  for (const varName of PRODUCTION_REQUIRED_VARS) {
    if (!process.env[varName]) {
      const errorMsg = `[CRITICAL ERROR] ${varName} is required in production. Authentication data must not be stored in memory.`;
      console.error(`  ERROR: ${errorMsg}`);
      errors.push(errorMsg);
      hasErrors = true;
    } else if (!process.env[varName].trim()) {
      const errorMsg = `[CRITICAL ERROR] ${varName} is empty or whitespace-only in production. Authentication data must not be stored in memory.`;
      console.error(`  ERROR: ${errorMsg}`);
      errors.push(errorMsg);
      hasErrors = true;
    } else {
      console.log(`  OK: ${varName} = [set]`);
    }
  }
} else {
  console.log(`  (skipping production-specific checks: NODE_ENV=${process.env.NODE_ENV || "undefined"})`);
}
for (const [varName, config] of Object.entries(FORMAT_VALIDATED_VARS)) {
  const value = process.env[varName];
  if (!value) continue;

  if (!config.pattern.test(value)) {
    const msg = `[FORMAT ERROR] ${varName}: ${config.message}`;
    errors.push(msg);
    hasErrors = true;
    console.error(`  ERROR: ${msg}`);
  } else {
    console.log(`  OK: ${varName} format is valid`);
  }
}

console.log("\nScanning client variables for credential leaks...");
// Security Fix: Scan BOTH Vite and React App prefixes to prevent bypass leaks
const clientVars = Object.keys(process.env).filter(
  (k) => k.startsWith("VITE_") || k.startsWith("REACT_APP_")
);

for (const key of clientVars) {
  if (ALLOWED_EXCEPTIONS.has(key)) continue;

  const value = process.env[key] || "";

  for (const pattern of SENSITIVE_KEY_PATTERNS) {
    if (pattern.test(key)) {
      const msg = `[SECURITY LEAK] ${key}: variable name matches sensitive pattern "${pattern}".`;
      errors.push(msg);
      hasErrors = true;
      break;
    }
  }

  for (const { pattern, label } of SENSITIVE_VALUE_PATTERNS) {
    if (pattern.test(value)) {
      const msg = `[SECURITY LEAK] ${key}: value matches known ${label} pattern.`;
      errors.push(msg);
      hasErrors = true;
      break;
    }
  }
}

if (warnings.length > 0) {
  console.log("");
  for (const warning of warnings) {
    console.warn(`  WARNING: ${warning}`);
  }
}

if (errors.length > 0) {
  console.log("");
  for (const err of errors) {
    console.error(`  ERROR: ${err}`);
  }
}

const criticalErrors = errors.filter(
  (e) =>
    e.includes("[SECURITY LEAK]") ||
    e.includes("[FORMAT ERROR]") ||
    e.includes("[CRITICAL ERROR]") ||
    e.includes("[CONFIG ERROR]")
);
if (criticalErrors.length > 0 || hasErrors) {
  console.error(
    `\n[validate-env] BUILD ABORTED: ${criticalErrors.length} critical issue(s) detected.\n`
  );
  process.exit(1);
}

console.log(
  `\n[validate-env] Environment check passed. Scanned ${clientVars.length} client variable(s).\n`
);
process.exit(0);
