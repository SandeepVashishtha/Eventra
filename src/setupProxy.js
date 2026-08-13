/**
 * Express dev-server entrypoint for the Eventra API gateway.
 *
 * The gateway behaviour (dynamic targets, correlation tracing, timeout guards
 * and 502 error handling) lives in `proxyGateway.cjs` so it can be unit tested
 * in isolation. This file only wires it into the dev server.
 */

const gateway = require("./proxyGateway.cjs");

const { primary, fallback } = gateway.resolveTargets();

module.exports = function setupProxy(app) {
  return gateway.setupApiProxy(app);
};

module.exports.PRIMARY_TARGET = primary;
module.exports.FALLBACK_TARGET = fallback;
