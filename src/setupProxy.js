const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy Request] ${req.method} ${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        console.log(`[Proxy Request Headers] Origin: ${req.headers['origin']}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[Proxy Response] ${req.method} ${req.url} -> Status: ${proxyRes.statusCode}`);
      }
    })
  );
};
