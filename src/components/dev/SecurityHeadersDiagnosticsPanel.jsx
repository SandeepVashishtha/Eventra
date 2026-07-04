import {
  getSecurityHeadersDiagnostics,
} from "../../utils/securityHeadersDiagnostics";

const SecurityHeadersDiagnosticsPanel = () => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const diagnostics =
    getSecurityHeadersDiagnostics();

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md rounded-xl border bg-white dark:bg-gray-900 p-4 shadow-lg">
      <h3 className="mb-3 font-bold">
        Security Headers Diagnostics
      </h3>

      <div className="space-y-2">
        {diagnostics.map((item) => (
          <div
            key={item.name}
            className="rounded border p-2"
          >
            <div className="font-semibold">
              {item.name}
            </div>

            <div
              className={`text-sm ${
                item.status === "success"
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {item.value}
            </div>

            <div className="text-xs text-gray-500">
              {item.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityHeadersDiagnosticsPanel;