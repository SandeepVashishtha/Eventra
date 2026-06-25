const { createProxyMiddleware } = require("http-proxy-middleware");

const isDev = process.env.NODE_ENV !== "production";

// Resolve backend target for proxy (Node.js context)
// Resolution order matches centralized config: BACKEND_URL > VITE_API_URL > REACT_APP_API_URL
// Falls back to localhost:8080 in development if none set
const resolveBackendTarget = () => {
  const envUrl =
    process.env.VITE_API_URL || process.env.BACKEND_URL || process.env.REACT_APP_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "").replace(/\/api$/, "");
  }
  return "http://localhost:8080";
};

const backendTarget = resolveBackendTarget();

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: backendTarget,
      changeOrigin: true,
      logLevel: isDev ? "warn" : "silent",
      onProxyReq: isDev
        ? (proxyReq, req) => {
            console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.host}${proxyReq.path}`);
          }
        : undefined,
    })
  );
};
