const runtimeEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

const requiredEnvVars = {
  API_URL: ["VITE_API_URL", "REACT_APP_API_URL"],
};

const getEnvVar = (key, fallback = "") => {
  const value = import.meta.env[key];

const getFirstDefinedEnvValue = (keys = []) => {
  for (const key of keys) {
    const value = runtimeEnv[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

const getEnvVar = (keys, fallback = "", { required = false, label } = {}) => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  const value = getFirstDefinedEnvValue(keyList);

  if (value) {
    return value;
  }

  if (fallback !== "") {
    return fallback;
  }

  if (required) {
    console.error(
      `[ENV ERROR] Missing required environment variable: ${label || keyList.join(" or ")}`
    );
  }

  return "";
};

export const validateEnvironment = () => {
const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key]);

  if (missingVars.length > 0) {
    console.error(`[ENV VALIDATION FAILED] Missing variables: ${missingVars.join(", ")}`);
  }
};

validateEnvironment();

export const ENV = {
  API_URL: getEnvVar(requiredEnvVars.API_URL, "", {
    required: true,
    label: "API_URL",
  }),
  GITHUB_REPO: getEnvVar(
    optionalEnvVars.GITHUB_REPO.keys,
    optionalEnvVars.GITHUB_REPO.fallback
  ),
  PUBLIC_URL: getEnvVar(
    optionalEnvVars.PUBLIC_URL.keys,
    optionalEnvVars.PUBLIC_URL.fallback
  ),
};

export const SENTRY_DSN = getEnvVar(
  optionalEnvVars.SENTRY_DSN.keys,
  optionalEnvVars.SENTRY_DSN.fallback
);

export const isSentryEnabled = Boolean(
  SENTRY_DSN && import.meta.env.MODE === "production"
);
