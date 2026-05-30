const requiredEnvVarGroups = [
  ["VITE_API_URL", "REACT_APP_API_URL"],
];

const optionalEnvVars = {
  REACT_APP_SENTRY_DSN: "",
  REACT_APP_GITHUB_REPO: "SandeepVashishtha/Eventra",
  REACT_APP_PUBLIC_URL: "https://eventra.sandeepvashishtha.tech",
};

const getEnvVar = (keyOrKeys, fallback = "") => {
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  const value = keys.map((key) => process.env[key]).find((item) => item !== undefined && item !== null && item !== "");

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (fallback !== "") {
      return fallback;
    }

    console.error(
      `[ENV ERROR] Missing required environment variable: ${keys.join(" or ")}`
    );

    return "";
  }

  return value;
};

export const validateEnvironment = () => {
  const missingVars = requiredEnvVarGroups.filter(
    (group) => !group.some((key) => process.env[key])
  );

  if (missingVars.length > 0) {
    console.error(
      `[ENV VALIDATION FAILED] Missing variables: ${missingVars.map((group) => group.join(" or ")).join(", ")}`
    );
  }
};

validateEnvironment();

export const ENV = {
  API_URL: getEnvVar(["VITE_API_URL", "REACT_APP_API_URL"]),
  SENTRY_DSN: getEnvVar(
    "REACT_APP_SENTRY_DSN",
    optionalEnvVars.REACT_APP_SENTRY_DSN
  ),
  GITHUB_REPO: getEnvVar(
    "REACT_APP_GITHUB_REPO",
    optionalEnvVars.REACT_APP_GITHUB_REPO
  ),
  PUBLIC_URL: getEnvVar(
    "REACT_APP_PUBLIC_URL",
    optionalEnvVars.REACT_APP_PUBLIC_URL
  ),
};