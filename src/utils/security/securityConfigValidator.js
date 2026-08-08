const SECURITY_CONFIG_KEYS = {
  API_ENDPOINT: "VITE_API_URL",
  JWT_CONFIGURATION: "VITE_JWT_ENABLED",
  CSP_CONFIGURATION: "VITE_CSP_REPORT_URI",
};

export const validateSecurityConfiguration = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  const backendUrl = import.meta.env.VITE_API_URL || "";

  // Check 1: HTTPS API endpoint configuration in production
  const hasSecureProtocol =
    backendUrl.startsWith("https://") ||
    backendUrl.startsWith("/");

  if (isProd && backendUrl && !hasSecureProtocol) {
    console.warn(
      `[Security Warning] Backend API URL is configured to use insecure protocol: "${backendUrl}". In production, HTTPS must be used.`
    );
  }

  // Check 2: Content Security Policy (CSP) presence
  if (typeof document !== "undefined") {
    const hasCspMeta = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    );

    if (!hasCspMeta && isDev) {
      console.warn(
        "[Security Warning] Content-Security-Policy meta tag is missing from the document."
      );
    }
  }

  // Check 3: Google Client ID configuration
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  if (
    googleClientId &&
    googleClientId.includes("your_google_client_id")
  ) {
    console.warn(
      "[Security Warning] Google Client ID is using a placeholder value. Social login might not work."
    );
  }
};

export default validateSecurityConfiguration;