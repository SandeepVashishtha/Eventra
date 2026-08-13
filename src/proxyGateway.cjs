/**
 * Enterprise Microservices Reverse Proxy & API Gateway Module
 *
 * Pure, dependency-injectable implementation of the Express API gateway used by
 * `setupProxy.js`. Keeping the logic here (CommonJS, no side effects at import
 * time) allows the target resolution, tracing hooks and error guards to be unit
 * tested without booting an Express server or installing the proxy middleware.
 */

const DEFAULT_PRIMARY_TARGET =
  "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net";

const DEFAULT_FALLBACK_TARGET =
  "https://eventra-backend-secondary.centralindia-01.azurewebsites.net";

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Resolves upstream targets from the environment with safe fallbacks.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @returns {{ primary: string, fallback: string }}
 */
function resolveTargets(env = process.env) {
  return {
    primary: env.API_PROXY_TARGET || DEFAULT_PRIMARY_TARGET,
    fallback: env.API_PROXY_FALLBACK_TARGET || DEFAULT_FALLBACK_TARGET,
  };
}

/**
 * Generates a correlation id for distributed tracing across microservices.
 *
 * @returns {string}
 */
function generateCorrelationId() {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Builds the static proxy options (target, timeouts, path rewrite).
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 */
function buildProxyConfig(env = process.env) {
  const { primary } = resolveTargets(env);

  return {
    target: primary,
    changeOrigin: true,
    secure: env.NODE_ENV === "production",
    logLevel: env.PROXY_LOG_LEVEL || "debug",

    // Timeout settings (prevents hanging gateway connections)
    timeout: DEFAULT_TIMEOUT_MS, // connection timeout
    proxyTimeout: DEFAULT_TIMEOUT_MS, // target response timeout

    // Path Rewrite: Strips `/api` prefix if backend controllers expect root routes
    pathRewrite: env.PROXY_STRIP_PREFIX === "true" ? { "^/api": "" } : {},
  };
}

/**
 * Builds the request/response/error hooks for the gateway.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @param {{ logger?: Console }} [deps]
 */
function createGatewayHooks(env = process.env, deps = {}) {
  const logger = deps.logger || console;
  const { primary } = resolveTargets(env);

  return {
    /** Appends tracing headers and forwards auth tokens upstream. */
    onProxyReq(proxyReq, req) {
      const clientIp = req.ip || (req.connection && req.connection.remoteAddress) || "";
      proxyReq.setHeader("X-Forwarded-For", clientIp);
      proxyReq.setHeader("X-Forwarded-Host", (req.headers && req.headers.host) || "");
      proxyReq.setHeader("X-Proxy-Source", "Eventra-Express-Gateway");

      const correlationId =
        (req.headers && req.headers["x-correlation-id"]) || generateCorrelationId();
      proxyReq.setHeader("X-Correlation-ID", correlationId);

      if (req.headers && req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }

      if (env.NODE_ENV !== "production") {
        logger.log(`[Proxy Outgoing] ${req.method} ${req.url} -> ${primary}${proxyReq.path}`);
      }
    },

    /** Hardens the gateway response before it reaches the browser. */
    onProxyRes(proxyRes, req) {
      proxyRes.headers["x-content-type-options"] = "nosniff";
      proxyRes.headers["x-frame-options"] = "SAMEORIGIN";

      if (env.NODE_ENV !== "production") {
        logger.log(`[Proxy Response] ${proxyRes.statusCode} for ${req.method} ${req.url}`);
      }
    },

    /** Converts upstream failures into a structured 502 JSON payload. */
    onError(err, req, res) {
      logger.error("[Proxy Error] Connection to upstream backend failed:", err.message);

      if (!res || res.headersSent) {
        return;
      }

      res.status(502).json({
        error: {
          code: "BAD_GATEWAY",
          message: "Unable to communicate with Eventra backend service.",
          target: primary,
          timestamp: new Date().toISOString(),
        },
      });
    },
  };
}

/**
 * Loads `http-proxy-middleware` lazily so importing this module (for tests or
 * tooling) never requires the dev-server dependency to be installed.
 */
function defaultProxyFactory() {
  return require("http-proxy-middleware").createProxyMiddleware;
}

/**
 * Registers the API gateway on an Express application instance.
 *
 * @param {import('express').Application} app
 * @param {{ env?: NodeJS.ProcessEnv, createProxyMiddleware?: Function, logger?: Console }} [deps]
 */
function setupApiProxy(app, deps = {}) {
  const env = deps.env || process.env;
  const createProxyMiddleware = deps.createProxyMiddleware || defaultProxyFactory();

  const apiProxy = createProxyMiddleware("/api", {
    ...buildProxyConfig(env),
    ...createGatewayHooks(env, deps),
  });

  app.use("/api", apiProxy);

  return apiProxy;
}

module.exports = setupApiProxy;
module.exports.setupApiProxy = setupApiProxy;
module.exports.resolveTargets = resolveTargets;
module.exports.buildProxyConfig = buildProxyConfig;
module.exports.createGatewayHooks = createGatewayHooks;
module.exports.generateCorrelationId = generateCorrelationId;
module.exports.DEFAULT_PRIMARY_TARGET = DEFAULT_PRIMARY_TARGET;
module.exports.DEFAULT_FALLBACK_TARGET = DEFAULT_FALLBACK_TARGET;
module.exports.DEFAULT_TIMEOUT_MS = DEFAULT_TIMEOUT_MS;
