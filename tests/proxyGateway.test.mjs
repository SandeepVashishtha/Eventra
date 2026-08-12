import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const gateway = require("../src/proxyGateway.cjs");

const {
  resolveTargets,
  buildProxyConfig,
  createGatewayHooks,
  generateCorrelationId,
  setupApiProxy,
  DEFAULT_PRIMARY_TARGET,
  DEFAULT_FALLBACK_TARGET,
  DEFAULT_TIMEOUT_MS,
} = gateway;

const silentLogger = { log() {}, error() {} };

function createProxyReq() {
  const headers = {};
  return {
    path: "/api/events",
    headers,
    setHeader(name, value) {
      headers[name] = value;
    },
  };
}

function createRes() {
  return {
    headersSent: false,
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// --- Target resolution -----------------------------------------------------
assert.deepEqual(resolveTargets({}), {
  primary: DEFAULT_PRIMARY_TARGET,
  fallback: DEFAULT_FALLBACK_TARGET,
});

assert.deepEqual(
  resolveTargets({
    API_PROXY_TARGET: "http://localhost:8080",
    API_PROXY_FALLBACK_TARGET: "http://localhost:9090",
  }),
  { primary: "http://localhost:8080", fallback: "http://localhost:9090" }
);

// --- Proxy configuration ---------------------------------------------------
const devConfig = buildProxyConfig({ NODE_ENV: "development" });
assert.equal(devConfig.target, DEFAULT_PRIMARY_TARGET);
assert.equal(devConfig.changeOrigin, true);
assert.equal(devConfig.secure, false);
assert.equal(devConfig.logLevel, "debug");
assert.equal(devConfig.timeout, DEFAULT_TIMEOUT_MS);
assert.equal(devConfig.proxyTimeout, DEFAULT_TIMEOUT_MS);
assert.deepEqual(devConfig.pathRewrite, {});

const prodConfig = buildProxyConfig({
  NODE_ENV: "production",
  API_PROXY_TARGET: "https://api.eventra.dev",
  PROXY_LOG_LEVEL: "warn",
  PROXY_STRIP_PREFIX: "true",
});
assert.equal(prodConfig.target, "https://api.eventra.dev");
assert.equal(prodConfig.secure, true);
assert.equal(prodConfig.logLevel, "warn");
assert.deepEqual(prodConfig.pathRewrite, { "^/api": "" });

// --- Correlation ids -------------------------------------------------------
const correlationId = generateCorrelationId();
assert.match(correlationId, /^req-\d+-[a-z0-9]+$/);
assert.notEqual(correlationId, generateCorrelationId());

// --- onProxyReq tracing headers -------------------------------------------
const devHooks = createGatewayHooks({ NODE_ENV: "development" }, { logger: silentLogger });

const generatedReq = createProxyReq();
devHooks.onProxyReq(generatedReq, {
  method: "GET",
  url: "/api/events",
  ip: "203.0.113.9",
  headers: { host: "eventra.local" },
});
assert.equal(generatedReq.headers["X-Forwarded-For"], "203.0.113.9");
assert.equal(generatedReq.headers["X-Forwarded-Host"], "eventra.local");
assert.equal(generatedReq.headers["X-Proxy-Source"], "Eventra-Express-Gateway");
assert.match(generatedReq.headers["X-Correlation-ID"], /^req-/);
assert.equal(generatedReq.headers.Authorization, undefined);

const forwardedReq = createProxyReq();
devHooks.onProxyReq(forwardedReq, {
  method: "POST",
  url: "/api/events",
  connection: { remoteAddress: "198.51.100.4" },
  headers: {
    host: "eventra.local",
    "x-correlation-id": "trace-123",
    authorization: "Bearer token-abc",
  },
});
assert.equal(forwardedReq.headers["X-Forwarded-For"], "198.51.100.4");
assert.equal(forwardedReq.headers["X-Correlation-ID"], "trace-123");
assert.equal(forwardedReq.headers.Authorization, "Bearer token-abc");

const anonymousReq = createProxyReq();
devHooks.onProxyReq(anonymousReq, { method: "GET", url: "/api/health", headers: {} });
assert.equal(anonymousReq.headers["X-Forwarded-For"], "");
assert.equal(anonymousReq.headers["X-Forwarded-Host"], "");

// --- Logging is suppressed in production ----------------------------------
const logged = [];
const recordingLogger = { log: (...args) => logged.push(args), error: () => {} };

createGatewayHooks({ NODE_ENV: "development" }, { logger: recordingLogger }).onProxyReq(
  createProxyReq(),
  { method: "GET", url: "/api/events", headers: {} }
);
assert.equal(logged.length, 1);

createGatewayHooks({ NODE_ENV: "production" }, { logger: recordingLogger }).onProxyReq(
  createProxyReq(),
  { method: "GET", url: "/api/events", headers: {} }
);
assert.equal(logged.length, 1, "production requests are not logged");

// --- onProxyRes security headers ------------------------------------------
const proxyRes = { statusCode: 200, headers: {} };
devHooks.onProxyRes(proxyRes, { method: "GET", url: "/api/events" });
assert.equal(proxyRes.headers["x-content-type-options"], "nosniff");
assert.equal(proxyRes.headers["x-frame-options"], "SAMEORIGIN");

const prodProxyRes = { statusCode: 500, headers: {} };
createGatewayHooks({ NODE_ENV: "production" }, { logger: recordingLogger }).onProxyRes(
  prodProxyRes,
  { method: "GET", url: "/api/events" }
);
assert.equal(prodProxyRes.headers["x-frame-options"], "SAMEORIGIN");
assert.equal(logged.length, 1, "production responses are not logged");

// --- onError 502 guard -----------------------------------------------------
const errorHooks = createGatewayHooks(
  { NODE_ENV: "development", API_PROXY_TARGET: "http://localhost:8080" },
  { logger: silentLogger }
);

const errorRes = createRes();
errorHooks.onError(new Error("ECONNRESET"), { method: "GET", url: "/api/events" }, errorRes);
assert.equal(errorRes.statusCode, 502);
assert.equal(errorRes.body.error.code, "BAD_GATEWAY");
assert.equal(errorRes.body.error.target, "http://localhost:8080");
assert.equal(
  errorRes.body.error.message,
  "Unable to communicate with Eventra backend service."
);
assert.ok(!Number.isNaN(Date.parse(errorRes.body.error.timestamp)));

const sentRes = createRes();
sentRes.headersSent = true;
errorHooks.onError(new Error("ETIMEDOUT"), { method: "GET", url: "/api/events" }, sentRes);
assert.equal(sentRes.statusCode, null, "does not write after headers are sent");

assert.doesNotThrow(() =>
  errorHooks.onError(new Error("ECONNREFUSED"), { method: "GET", url: "/api/events" }, undefined)
);

// --- setupApiProxy wiring --------------------------------------------------
const registered = [];
const app = {
  use(path, handler) {
    registered.push({ path, handler });
  },
};

const middleware = () => {};
const factoryCalls = [];
const returned = setupApiProxy(app, {
  env: { NODE_ENV: "development", API_PROXY_TARGET: "http://localhost:8080" },
  logger: silentLogger,
  createProxyMiddleware: (context, options) => {
    factoryCalls.push({ context, options });
    return middleware;
  },
});

assert.equal(factoryCalls.length, 1);
assert.equal(factoryCalls[0].context, "/api");
assert.equal(factoryCalls[0].options.target, "http://localhost:8080");
assert.equal(factoryCalls[0].options.timeout, DEFAULT_TIMEOUT_MS);
assert.equal(typeof factoryCalls[0].options.onProxyReq, "function");
assert.equal(typeof factoryCalls[0].options.onProxyRes, "function");
assert.equal(typeof factoryCalls[0].options.onError, "function");
assert.equal(returned, middleware);
assert.deepEqual(registered, [{ path: "/api", handler: middleware }]);

console.log("proxyGateway tests passed");
