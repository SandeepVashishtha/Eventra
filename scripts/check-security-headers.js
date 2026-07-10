#!/usr/bin/env node

const TARGET_URL = process.env.SECURITY_HEADERS_URL || "http://localhost:3000";

const REQUIRED_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
];

async function checkSecurityHeaders() {
  console.log(`\n🔍 Checking security headers for: ${TARGET_URL}\n`);

  try {
    const response = await fetch(TARGET_URL, {
      method: "GET",
      redirect: "follow",
    });

    let missingHeaders = 0;

    for (const header of REQUIRED_HEADERS) {
      const value = response.headers.get(header);

      if (value) {
        console.log(`✅ ${header}: ${value}`);
      } else {
        console.log(`❌ ${header}: Missing`);
        missingHeaders++;
      }
    }

    console.log("");

    if (missingHeaders === 0) {
      console.log("🎉 All required security headers are present.");
      process.exit(0);
    }

    console.log(`⚠️  ${missingHeaders} required security header(s) are missing.`);
    process.exit(1);
  } catch (error) {
    console.error("❌ Failed to verify security headers.");
    console.error(error.message);
    process.exit(1);
  }
}

checkSecurityHeaders();