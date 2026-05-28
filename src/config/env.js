const requiredEnvVars = [
  "VITE_API_URL",
];

const optionalEnvVars = {
  VITE_SENTRY_DSN: "",
  VITE_GITHUB_REPO: "SandeepVashishtha/Eventra",
  VITE_PUBLIC_URL: "https://eventra.sandeepvashishtha.tech",
};

const getEnvVar = (key, fallback = "") => {
  const value = import.meta.env[key];

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (fallback !== "") {
      return fallback;
    }

    console.error(
      `[ENV ERROR] Missing required environment variable: ${key}`
    );

    return "";
  }

  return value;
};

export const validateEnvironment = () => {
  const missingVars = requiredEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missingVars.length > 0) {
    console.error(
      `[ENV VALIDATION FAILED] Missing variables: ${missingVars.join(", ")}`
    );
  }
};

validateEnvironment();

export const ENV = {
  API_URL: getEnvVar("VITE_API_URL"),
  SENTRY_DSN: getEnvVar(
    "VITE_SENTRY_DSN",
    optionalEnvVars.VITE_SENTRY_DSN
  ),
  GITHUB_REPO: getEnvVar(
    "VITE_GITHUB_REPO",
    optionalEnvVars.VITE_GITHUB_REPO
  ),
  PUBLIC_URL: getEnvVar(
    "VITE_PUBLIC_URL",
    optionalEnvVars.VITE_PUBLIC_URL
  ),
};