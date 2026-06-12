const { createProxyMiddleware } = require("http-proxy-middleware");

const isDev = process.env.NODE_ENV !== "production";

// Read backend target from environment variables; fall back to localhost for local development.
// Set BACKEND_URL (or REACT_APP_API_URL / VITE_API_URL) in your .env to point at a remote backend.
const backendTarget =
  process.env.BACKEND_URL ||
  process.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL?.replace("/api", "") ||
  "http://localhost:8080";

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
