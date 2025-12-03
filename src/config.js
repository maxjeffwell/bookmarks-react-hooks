// API configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:3001'
  },
  production: {
    apiUrl: 'https://bookmarks-react-hooks.vercel.app/api'
  }
};

const environment = process.env.NODE_ENV || 'development';
// Allow environment variable to override the configured API URL
const apiUrl = process.env.REACT_APP_API_BASE_URL || config[environment].apiUrl;

// Use advanced bookmarks API with full CRUD support
const apiEndpoint = 'bookmarks';

export { apiUrl, apiEndpoint };