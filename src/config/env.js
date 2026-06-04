const runtimeEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

const requiredEnvVars = {
  API_URL: ["VITE_API_URL", "REACT_APP_API_URL"],
};

const optionalEnvVars = {
  GITHUB_REPO: {
    keys: ["VITE_GITHUB_REPO", "REACT_APP_GITHUB_REPO"],
    fallback: "SandeepVashishtha/Eventra",
  },
  PUBLIC_URL: {
    keys: ["VITE_PUBLIC_URL", "REACT_APP_PUBLIC_URL"],
    fallback: "https://eventra.sandeepvashishtha.tech",
  },
  SENTRY_DSN: {
    keys: ["VITE_SENTRY_DSN", "REACT_APP_SENTRY_DSN"],
    fallback: "",
  },
};

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
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, keys]) => !getFirstDefinedEnvValue(keys))
    .map(([label, keys]) => `${label} (${keys.join(" or ")})`);

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

const currentMode = runtimeEnv.MODE || runtimeEnv.NODE_ENV || "development";

export const isSentryEnabled = Boolean(SENTRY_DSN && currentMode === "production");
