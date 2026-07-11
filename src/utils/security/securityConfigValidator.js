const SECURITY_CONFIG_KEYS = {
  API_ENDPOINT: "REACT_APP_API_URL",
  JWT_CONFIGURATION: "REACT_APP_JWT_ENABLED",
  CSP_CONFIGURATION: "REACT_APP_CSP_REPORT_URI",
};

export function getSecurityConfigurationWarnings(
  config = {},
  environment = "development"
) {
  const warnings = [];

  const apiEndpoint = config.REACT_APP_API_URL;
  const jwtConfiguration = config.REACT_APP_JWT_ENABLED;
  const cspConfiguration = config.REACT_APP_CSP_REPORT_URI;

  if (!apiEndpoint) {
    warnings.push("Missing API endpoint configuration.");
  } else if (
    environment === "production" &&
    apiEndpoint.startsWith("http://")
  ) {
    warnings.push(
      "Insecure API endpoint: HTTPS is required in production."
    );
  }

  if (!jwtConfiguration) {
    warnings.push("Missing JWT security configuration.");
  }

  if (!cspConfiguration) {
    warnings.push("Missing CSP reporting configuration.");
  }

  return warnings;
}

export function validateSecurityConfiguration(
  config = process.env,
  environment = process.env.NODE_ENV
) {
  const warnings = getSecurityConfigurationWarnings(
    config,
    environment
  );

  warnings.forEach((warning) => {
    console.warn(`[Security Configuration] ${warning}`);
  });

  return {
    valid: warnings.length === 0,
    warnings,
    checkedKeys: Object.values(SECURITY_CONFIG_KEYS),
  };
}