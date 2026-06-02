// Build-time security validation
// Verifies that no secrets are baked into the Vite define config
import { readFileSync } from "fs";

const errors = [];

try {
  const config = readFileSync("vite.config.js", "utf-8");
  
  // Check for known sensitive patterns in the define block
  const sensitivePatterns = [
    "EMAILJS",
    "SENTRY_DSN",
    "FACEBOOK_APP",
    "REACT_APP_EMAILJS",
    "REACT_APP_SENTRY",
  ];
  
  for (const pattern of sensitivePatterns) {
    if (config.includes(pattern)) {
      errors.push(`SECURITY: vite.config.js contains "${pattern}" — secrets in define are baked into the public bundle`);
    }
  }
  
  if (errors.length > 0) {
    console.error("\n=== Build Security Check Failed ===");
    errors.forEach((e) => console.error("  ✗", e));
    console.error("===================================\n");
    process.exit(1);
  }
  
  console.log("✓ Build security check passed — no secrets detected in define config");
} catch (err) {
  console.error("Build security check error:", err.message);
  process.exit(1);
}
