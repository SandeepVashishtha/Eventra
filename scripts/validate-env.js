#!/usr/bin/env node
/**
 * scripts/validate-env.js
 *
 * Build-time environment variable sanitation and validation script.
 *
 * SECURITY PURPOSE:
 * Prevents accidental leakage of private backend credentials (API keys,
 * database URLs, secret keys) into the client-side JavaScript bundle.
 *
 * HOW IT WORKS:
 * 1. Scans all VITE_ vars (the only ones Vite bundles into JS).
 * 2. Detects variable names or values matching common secret patterns.
 * 3. If any leaks are found, exits with code 1 — stopping the webpack build.
 *
 * USAGE: Called automatically via the "prebuild" npm script hook.
 */

'use strict';

// ── Sensitive key-name patterns ───────────────────────────────────────────────
// If a VITE_ variable's NAME matches any of these, it is likely a secret.
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
];

// ── Sensitive value patterns ──────────────────────────────────────────────────
// If a VITE_ variable's VALUE matches these, it is almost certainly a secret.
const SENSITIVE_VALUE_PATTERNS = [
  { pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: 'PEM private key' },
  { pattern: /AIza[0-9A-Za-z\-_]{35}/, label: 'Google API key' },
  { pattern: /sk-[a-zA-Z0-9]{48}/, label: 'OpenAI secret key' },
  { pattern: /rk_live_[0-9a-zA-Z]{24}/, label: 'Stripe restricted key' },
  { pattern: /SK[0-9a-f]{32}/, label: 'Twilio auth token' },
  { pattern: /xox[baprs]-[0-9a-zA-Z]{10,}/, label: 'Slack API token' },
  { pattern: /mongodb\+srv:\/\/[^:]+:[^@]+@/, label: 'MongoDB Atlas URI with credentials' },
  { pattern: /postgres:\/\/[^:]+:[^@]+@/, label: 'PostgreSQL URI with credentials' },
  { pattern: /mysql:\/\/[^:]+:[^@]+@/, label: 'MySQL URI with credentials' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: 'GitHub personal access token' },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\./, label: 'JWT token (should not be hardcoded in env)' },
];

// Variables that are expected and safe even if they match sensitive key patterns.
// For example, Google Client ID is public — it is safe to expose in the browser.
const ALLOWED_EXCEPTIONS = new Set([
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_EMAILJS_PUBLIC_KEY',
]);

// Required VITE_ variables that MUST be present for the app to function.
const REQUIRED_VARS = [
  'VITE_API_URL',
];

// Variables that require proper format validation
const FORMAT_VALIDATED_VARS = {
  'VITE_API_URL': {
    regex: /^https?:\/\/.+/,
    message: 'VITE_API_URL must be a valid HTTP/HTTPS URL (e.g., https://api.example.com)',
  },
  'VITE_GOOGLE_CLIENT_ID': {
    regex: /^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/,
    message: 'VITE_GOOGLE_CLIENT_ID must be a valid Google OAuth client ID format',
  },
  'VITE_SSE_URL': {
    regex: /^https?:\/\/.+/,
    message: 'VITE_SSE_URL must be a valid HTTP/HTTPS URL',
  },
};

// Optional VITE_ variables that may enable extra features.
const OPTIONAL_VARS = [
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_PUBLIC_KEY',
  'VITE_SSE_URL',
];

// ── Validation logic ──────────────────────────────────────────────────────────

let hasErrors = false;
const errors = [];
const warnings = [];

console.log('\n🔍 [validate-env] Scanning environment variables for security issues...\n');

// Check required variables
console.log('📋 Required variables:');
for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    console.warn(`  ⚠  MISSING: ${varName} (app may fail to connect to backend)`);
    warnings.push(`Required variable ${varName} is not set`);
  } else {
    console.log(`  ✓  ${varName} = [set]`);
  }
}

// Check optional variables
console.log('\n📋 Optional variables:');
for (const varName of OPTIONAL_VARS) {
  if (!process.env[varName]) {
    console.log(`  -  ${varName} (not set — feature may be disabled)`);
  } else {
    console.log(`  ✓  ${varName} = [set]`);
  }
}

// Format validation for specific variables
console.log('\n🔍 Validating format of specific environment variables...');
for (const [varName, config] of Object.entries(FORMAT_VALIDATED_VARS)) {
  const value = process.env[varName];
  if (value) {
    if (!config.pattern.test(value)) {
      const msg = `[FORMAT ERROR] ${varName}: ${config.message}`;
      errors.push(msg);
      hasErrors = true;
      console.error(`  ✗  ${msg}`);
    } else {
      console.log(`  ✓  ${varName} format is valid`);
    }
  }
}

// Scan all VITE_ variables for credential leaks
console.log('\n🔐 Scanning VITE_* variables for credential leaks...');
const reactAppVars = Object.keys(process.env).filter(k => k.startsWith('VITE_'));

for (const key of reactAppVars) {
  if (ALLOWED_EXCEPTIONS.has(key)) continue;

  const value = process.env[key] || '';

  // Check variable name against sensitive patterns
  for (const pattern of SENSITIVE_KEY_PATTERNS) {
    if (pattern.test(key)) {
      const msg = `[SECURITY LEAK] ${key}: variable name matches sensitive pattern "${pattern}". Private keys MUST NOT be prefixed with VITE_ — they will be bundled into the JS output visible to all users.`;
      errors.push(msg);
      hasErrors = true;
      break;
    }
  }

  // Check variable value against known secret token formats
  for (const { pattern, label } of SENSITIVE_VALUE_PATTERNS) {
    if (pattern.test(value)) {
      const msg = `[SECURITY LEAK] ${key}: value matches a known ${label} pattern. This secret will be embedded in the client-side JavaScript bundle and exposed to all users.`;
      errors.push(msg);
      hasErrors = true;
      break;
    }
  }
}

// Print warnings (non-blocking)
if (warnings.length > 0) {
  console.log('');
  for (const warning of warnings) {
    console.warn(`  ⚠  ${warning}`);
  }
}

// Print errors (blocking — will stop the build)
if (errors.length > 0) {
  console.log('');
  for (const err of errors) {
    console.error(`  ✗  ${err}`);
  }
}

// Exit with result
const criticalErrors = errors.filter(e => e.includes('[SECURITY LEAK]') || e.includes('[FORMAT ERROR]'));
if (criticalErrors.length > 0) {
  console.error(
    `\n❌ [validate-env] BUILD ABORTED: ${criticalErrors.length} critical issue(s) detected.\n` +
    '  ─────────────────────────────────────────────────────────────────────\n' +
    '  Security Leaks (must fix before building):\n' +
    errors.filter(e => e.includes('[SECURITY LEAK]')).map(e => `    • ${e}`).join('\n') + '\n' +
    '  ─────────────────────────────────────────────────────────────────────\n' +
    (errors.filter(e => e.includes('[FORMAT ERROR]')).length > 0
      ? '  Format Errors (must fix before building):\n' +
        errors.filter(e => e.includes('[FORMAT ERROR]')).map(e => `    • ${e}`).join('\n') + '\n' +
        '  ─────────────────────────────────────────────────────────────────────\n'
      : '') +
    '  Private credentials must NEVER be prefixed with VITE_.\n'
  );
  process.exit(1);
} else {
  console.log(
    `\n✅ [validate-env] Environment check passed — no credential leaks detected.\n` +
    `  Scanned ${reactAppVars.length} VITE_* variable(s).\n`
  );
  process.exit(0);
}
