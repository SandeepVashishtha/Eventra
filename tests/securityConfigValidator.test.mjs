import assert from "node:assert/strict";

import {
  getSecurityConfigurationWarnings,
  validateSecurityConfiguration,
} from "../src/utils/security/securityConfigValidator.js";

console.log("Running security configuration validator tests...");

// Missing API endpoint
{
  const warnings = getSecurityConfigurationWarnings(
    {
      REACT_APP_JWT_ENABLED: "true",
      REACT_APP_CSP_REPORT_URI: "/api/csp-report",
    },
    "production"
  );

  assert.ok(
    warnings.includes("Missing API endpoint configuration.")
  );

  console.log("✓ Missing API endpoint is detected");
}

// HTTP production endpoint
{
  const warnings = getSecurityConfigurationWarnings(
    {
      REACT_APP_API_URL: "http://api.example.com",
      REACT_APP_JWT_ENABLED: "true",
      REACT_APP_CSP_REPORT_URI: "/api/csp-report",
    },
    "production"
  );

  assert.ok(
    warnings.includes(
      "Insecure API endpoint: HTTPS is required in production."
    )
  );

  console.log("✓ HTTP production endpoint is detected");
}

// Missing JWT configuration
{
  const warnings = getSecurityConfigurationWarnings({
    REACT_APP_API_URL: "https://api.example.com",
    REACT_APP_CSP_REPORT_URI: "/api/csp-report",
  });

  assert.ok(
    warnings.includes("Missing JWT security configuration.")
  );

  console.log("✓ Missing JWT configuration is detected");
}

// Missing CSP configuration
{
  const warnings = getSecurityConfigurationWarnings({
    REACT_APP_API_URL: "https://api.example.com",
    REACT_APP_JWT_ENABLED: "true",
  });

  assert.ok(
    warnings.includes("Missing CSP reporting configuration.")
  );

  console.log("✓ Missing CSP configuration is detected");
}

// Valid security configuration
{
  const result = validateSecurityConfiguration(
    {
      REACT_APP_API_URL: "https://api.example.com",
      REACT_APP_JWT_ENABLED: "true",
      REACT_APP_CSP_REPORT_URI: "/api/csp-report",
    },
    "production"
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.warnings, []);

  console.log("✓ Valid security configuration passes");
}

// Warning validation
{
  const originalWarn = console.warn;
  const capturedWarnings = [];

  console.warn = (message) => {
    capturedWarnings.push(message);
  };

  try {
    const result = validateSecurityConfiguration(
      {},
      "production"
    );

    assert.equal(result.valid, false);
    assert.equal(result.warnings.length, 3);
    assert.equal(capturedWarnings.length, 3);

    assert.ok(
      capturedWarnings.every((warning) =>
        warning.startsWith("[Security Configuration]")
      )
    );
  } finally {
    console.warn = originalWarn;
  }

  console.log("✓ Security warnings are reported correctly");
}

console.log("\nAll security configuration validator tests passed!");