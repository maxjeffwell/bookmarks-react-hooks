// API configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:3001'
  },
  production: {
    apiUrl: '/api' // same-origin via the k8s ingress (Vercel retired 2026-10-01)
  }
};

const environment = process.env.NODE_ENV || 'development';
// Allow environment variable to override the configured API URL
const apiUrl = process.env.REACT_APP_API_BASE_URL || config[environment].apiUrl;

// Use advanced bookmarks API with full CRUD support
const apiEndpoint = 'bookmarks';

export { apiUrl, apiEndpoint };