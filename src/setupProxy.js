// This file is automatically loaded by create-react-app's webpack-dev-server
// It proxies /api requests to the backend server
// See: https://create-react-app.dev/docs/proxying-api-requests-in-development/

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.PROXY_TARGET || 'http://bookmarks-server:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to backend
      },
      logLevel: 'debug',
    })
  );
};
