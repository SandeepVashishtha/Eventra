const { createProxyMiddleware } = require('http-proxy-middleware');

const PRODUCTION_BACKEND_URL = 'https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net';

const BACKEND_URL = process.env.VITE_API_URL
  || process.env.REACT_APP_API_URL
  || PRODUCTION_BACKEND_URL;

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
