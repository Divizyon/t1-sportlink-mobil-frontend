// API Configuration
const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log(`Loading API URL from env: ${EXPO_API_URL || 'Not found, using fallback'}`);

// Support both direct API URL and extracting API URL from base URL
export const API_URL = EXPO_API_URL || process.env.EXPO_PUBLIC_API || 'http://localhost:3000/api';

// For WebSocket connections, we need the base URL without the /api path
export const SOCKET_URL = API_URL.endsWith('/api')
  ? API_URL.substring(0, API_URL.length - 4) // Remove '/api'
  : API_URL;

console.log(`Configured API URL: ${API_URL}`);
console.log(`Configured Socket URL: ${SOCKET_URL}`);

// Other app-wide configuration values can be added here
export const APP_VERSION = '1.0.0';

// Feature flags
export const FEATURES = {
  REAL_TIME_NOTIFICATIONS: true,
  LOCATION_TRACKING: true,
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  SOCKET_CONNECT: 10000, // 10 seconds
};

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  PROFILE: 1000 * 60 * 5, // 5 minutes
  EVENTS: 1000 * 60 * 2, // 2 minutes
  MESSAGES: 1000 * 30, // 30 seconds
}; 