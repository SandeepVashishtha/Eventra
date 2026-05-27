#!/usr/bin/env node
/**
 * Pre-Build Environment Key Validator
 * Ensures all required environment variables are set before building.
 * Prevents accidental credential leaks and missing config errors.
 * 
 * Usage: node scripts/validate-env.js
 */

const REQUIRED_KEYS = [
  'REACT_APP_API_URL',
];

const OPTIONAL_KEYS = [
  'REACT_APP_GOOGLE_CLIENT_ID',
  'REACT_APP_EMAILJS_SERVICE_ID',
  'REACT_APP_EMAILJS_TEMPLATE_ID',
  'REACT_APP_EMAILJS_PUBLIC_KEY',
  'REACT_APP_SSE_URL',
];

const SECRET_PATTERNS = [
  /password/i,
  /secret/i,
  /private.?key/i,
  /token(?!.*public)/i,
];

let hasErrors = false;

console.log('\n?? Validating environment variables...\n');

// Check required keys
for (const key of REQUIRED_KEYS) {
  if (!process.env[key]) {
    console.error(`  ? MISSING REQUIRED: ${key}`);
    hasErrors = true;
  } else {
    console.log(`  ? ${key}`);
  }
}

// Warn about optional keys
console.log('');
for (const key of OPTIONAL_KEYS) {
  if (!process.env[key]) {
    console.warn(`  ??  OPTIONAL MISSING: ${key} (feature may be disabled)`);
  } else {
    console.log(`  ? ${key}`);
  }
}

// Check for accidentally exposed secrets in REACT_APP_ keys
console.log('\n?? Checking for potential secret leaks...\n');
const envKeys = Object.keys(process.env).filter(k => k.startsWith('REACT_APP_'));
for (const key of envKeys) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(key)) {
      console.warn(`  ??  POTENTIAL SECRET in client bundle: ${key}`);
      console.warn(`     ? REACT_APP_ variables are embedded in the build and visible to users!`);
    }
  }
}

if (hasErrors) {
  console.error('\n? Environment validation failed. Fix the issues above before building.\n');
  process.exit(1);
} else {
  console.log('\n? Environment validation passed!\n');
}
