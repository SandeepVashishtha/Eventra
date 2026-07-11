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
export const validateSecurityConfiguration = () => {
  const isDev = import.meta.env.DEV || process.env.NODE_ENV === "development";
  const isProd = import.meta.env.PROD || process.env.NODE_ENV === "production";

  const backendUrl = import.meta.env.VITE_API_URL || "";
  const hasSecureProtocol = backendUrl.startsWith("https://") || backendUrl.startsWith("/");

  // Check 1: HTTPS API endpoint configuration in production
  if (isProd && backendUrl && !hasSecureProtocol) {
    console.warn(
      `[Security Warning] Backend API URL is configured to use insecure protocol: "${backendUrl}". In production, HTTPS must be used.`
    );
  }

  // Check 2: Content Security Policy (CSP) presence
  if (typeof document !== "undefined") {
    const hasCspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!hasCspMeta && isDev) {
      console.warn(
        "[Security Warning] Content-Security-Policy meta tag is missing from the document."
      );
    }
  }

  // Check 3: Authentication configuration warnings if Google Client ID is placeholder
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  if (googleClientId && googleClientId.includes("your_google_client_id")) {
    console.warn(
      "[Security Warning] Google Client ID is using a placeholder value. Social login might not work."
    );
  }
};
