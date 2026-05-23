const { createProxyMiddleware } = require("http-proxy-middleware");

const target =
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net";

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: true,
      logLevel: "warn",
      onProxyReq(proxyReq) {
        proxyReq.removeHeader("origin");
        proxyReq.removeHeader("referer");
      },
    }),
  );
};