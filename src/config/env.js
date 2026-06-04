const requiredEnvVars = ["REACT_APP_API_URL"];

const optionalEnvVars = {
  REACT_APP_GITHUB_REPO: "SandeepVashishtha/Eventra",
  REACT_APP_PUBLIC_URL: "https://eventra.sandeepvashishtha.tech",
};

const getEnvVar = (key, fallback = "") => {
  const value = import.meta.env[key];

  if (value === undefined || value === null || value === "") {
    if (fallback !== "") {
      return fallback;
    }

    console.error(`[ENV ERROR] Missing required environment variable: ${key}`);

    return "";
  }

  return value;
};

export const validateEnvironment = () => {
const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key]);

  if (missingVars.length > 0) {
    console.error(`[ENV VALIDATION FAILED] Missing variables: ${missingVars.join(", ")}`);
  }
};

validateEnvironment();

export const ENV = {
  API_URL: getEnvVar("REACT_APP_API_URL"),
  GITHUB_REPO: getEnvVar("REACT_APP_GITHUB_REPO", optionalEnvVars.REACT_APP_GITHUB_REPO),
  PUBLIC_URL: getEnvVar("REACT_APP_PUBLIC_URL", optionalEnvVars.REACT_APP_PUBLIC_URL),
};

export const SENTRY_DSN = getEnvVar("REACT_APP_SENTRY_DSN", "");

export const isSentryEnabled = Boolean(
  SENTRY_DSN && import.meta.env.MODE === "production"
);
