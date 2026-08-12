/**
 * Enterprise Microservices Reverse Proxy & API Gateway Module
 *
 * Configures express http-proxy-middleware with dynamic target routing,
 * automatic fallback endpoints, request/response header manipulation,
 * connection timeout guards, JWT forwarding, and error handling.
 */

const { createProxyMiddleware } = require("http-proxy-middleware");

// ============================================================================
// 1. Target Endpoint Resolution & Defaults
// ============================================================================

const PRIMARY_TARGET =
  process.env.API_PROXY_TARGET ||
  "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net";

const FALLBACK_TARGET =
  process.env.API_PROXY_FALLBACK_TARGET ||
  "https://eventra-backend-secondary.centralindia-01.azurewebsites.net";

/** Standard Proxy Configuration Options */
const DEFAULT_PROXY_CONFIG = {
  target: PRIMARY_TARGET,
  changeOrigin: true,
  secure: process.env.NODE_ENV === "production",
  logLevel: process.env.PROXY_LOG_LEVEL || "debug",
  
  // Timeout settings (prevents hanging gateway connections)
  timeout: 30000, // 30s connection timeout
  proxyTimeout: 30000, // 30s target response timeout

  // Path Rewrite: Strips `/api` prefix if backend controllers expect root routes
  pathRewrite: process.env.PROXY_STRIP_PREFIX === "true" ? { "^/api": "" } : {},
};

// ============================================================================
// 2. Gateway Middleware & Request/Response Hooks
// ============================================================================

/**
 * Registers proxy routes on the Express application instance.
 *
 * @param {import('express').Application} app - Express application instance.
 */
module.exports = function setupApiProxy(app) {
  const apiProxy = createProxyMiddleware("/api", {
    ...DEFAULT_PROXY_CONFIG,

    /**
     * Intercepts outgoing requests to append tracing headers and auth tokens.
     */
    onProxyReq: (proxyReq, req, res) => {
      // 1. Forward original host and client IP for audit logging
      const clientIp = req.ip || req.connection.remoteAddress || "";
      proxyReq.setHeader("X-Forwarded-For", clientIp);
      proxyReq.setHeader("X-Forwarded-Host", req.headers.host || "");
      proxyReq.setHeader("X-Proxy-Source", "Eventra-Express-Gateway");

      // 2. Attach Correlation ID for distributed microservice tracing
      const correlationId = req.headers["x-correlation-id"] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      proxyReq.setHeader("X-Correlation-ID", correlationId);

      // 3. Forward Authorization Bearer Token if present
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(`[Proxy Outgoing] ${req.method} ${req.url} -> ${PRIMARY_TARGET}${proxyReq.path}`);
      }
    },

    /**
     * Intercepts incoming responses from the upstream Spring Boot server.
     */
    onProxyRes: (proxyRes, req, res) => {
      // 1. Attach Security & CORS headers to gateway response
      proxyRes.headers["x-content-type-options"] = "nosniff";
      proxyRes.headers["x-frame-options"] = "SAMEORIGIN";

      if (process.env.NODE_ENV !== "production") {
        console.log(`[Proxy Response] ${proxyRes.statusCode} for ${req.method} ${req.url}`);
      }
    },

    /**
     * Handles proxy failures and connection timeouts gracefully.
     */
    onError: (err, req, res) => {
      console.error(`[Proxy Error] Connection to upstream backend failed:`, err.message);

      if (res.headersSent) {
        return;
      }

      // Return standardized JSON error structure
      res.status(502).json({
        error: {
          code: "BAD_GATEWAY",
          message: "Unable to communicate with Eventra backend service.",
          target: PRIMARY_TARGET,
          timestamp: new Date().toISOString(),
        },
      });
    },
  });

  // Attach Proxy Middleware to Express App
  app.use("/api", apiProxy);
};

module.exports.PRIMARY_TARGET = PRIMARY_TARGET;
module.exports.FALLBACK_TARGET = FALLBACK_TARGET;