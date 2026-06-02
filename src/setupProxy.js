const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
