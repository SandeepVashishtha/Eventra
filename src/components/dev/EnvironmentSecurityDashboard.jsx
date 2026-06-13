import { requiredEnvVars } from "../../config/env";

const EnvironmentSecurityDashboard = () => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const checks = requiredEnvVars.map((name) => {
    const value = process.env[name];

    if (!value) {
      return {
        name,
        status: "error",
        message: "Missing environment variable.",
      };
    }

    if (
      process.env.NODE_ENV === "production" &&
      String(value).includes("localhost")
    ) {
      return {
        name,
        status: "warning",
        message:
          "Localhost URL detected in production configuration.",
      };
    }

    return {
      name,
      status: "success",
      message:
        "Environment variable configured correctly.",
    };
  });

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-md rounded-xl border bg-white dark:bg-gray-900 p-4 shadow-lg"
    >
      <h3 className="mb-3 font-bold">
        Environment Security Dashboard
      </h3>

      <div className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.name}
            className="rounded border p-2"
          >
            <div className="font-semibold">
              {check.name}
            </div>

            <div
              className={`text-sm ${
                check.status === "error"
                  ? "text-red-500"
                  : check.status === "warning"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              {check.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentSecurityDashboard;