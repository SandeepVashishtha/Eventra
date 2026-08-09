const SECURITY_CONFIG_KEYS = {
  API_ENDPOINT: "REACT_APP_API_URL",
  JWT_CONFIGURATION: "REACT_APP_JWT_ENABLED",
  CSP_CONFIGURATION: "REACT_APP_CSP_REPORT_URI",
};

const getRuntimeEnv = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }
  return {};
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
  config = getRuntimeEnv(),
  environment = getRuntimeEnv().NODE_ENV || getRuntimeEnv().MODE || "development"
) {
  const warnings = getSecurityConfigurationWarnings(
    config,
    environment
  );

  warnings.forEach((warning) => {
    console.warn(`[Security Configuration] ${warning}`);
  });

  const runtimeEnv = getRuntimeEnv();
  const isDev = runtimeEnv.DEV || environment === "development";
  const isProd = runtimeEnv.PROD || environment === "production";
  const backendUrl = runtimeEnv.VITE_API_URL || config.VITE_API_URL || "";
  const hasSecureProtocol = backendUrl.startsWith("https://") || backendUrl.startsWith("/");

  if (isProd && backendUrl && !hasSecureProtocol) {
    console.warn(
      `[Security Warning] Backend API URL is configured to use insecure protocol: "${backendUrl}". In production, HTTPS must be used.`
    );
  }

  if (typeof document !== "undefined") {
    const hasCspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!hasCspMeta && isDev) {
      console.warn(
        "[Security Warning] Content-Security-Policy meta tag is missing from the document."
      );
    }
  }

  const googleClientId = runtimeEnv.VITE_GOOGLE_CLIENT_ID || config.VITE_GOOGLE_CLIENT_ID || "";
  if (googleClientId && googleClientId.includes("your_google_client_id")) {
    console.warn(
      "[Security Warning] Google Client ID is using a placeholder value. Social login might not work."
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
    checkedKeys: Object.values(SECURITY_CONFIG_KEYS),
  };
}
