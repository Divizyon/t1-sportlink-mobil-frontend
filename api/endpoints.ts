export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    CHANGE_PASSWORD: '/user/change-password',
    NOTIFICATIONS: '/user/notifications',
    SETTINGS: '/user/settings',
  },

  // Sport endpoints
  SPORT: {
    LIST: '/sports',
    DETAIL: (id: string) => `/sports/${id}`,
    CATEGORIES: '/sports/categories',
    EVENTS: '/sports/events',
    EVENT_DETAIL: (id: string) => `/sports/events/${id}`,
  },

  // Team endpoints
  TEAM: {
    LIST: '/teams',
    DETAIL: (id: string) => `/teams/${id}`,
    MEMBERS: (id: string) => `/teams/${id}/members`,
    STATS: (id: string) => `/teams/${id}/stats`,
  },

  // Match endpoints
  MATCH: {
    LIST: '/matches',
    DETAIL: (id: string) => `/matches/${id}`,
    LIVE: '/matches/live',
    UPCOMING: '/matches/upcoming',
    PAST: '/matches/past',
  },

  // Tournament endpoints
  TOURNAMENT: {
    LIST: '/tournaments',
    DETAIL: (id: string) => `/tournaments/${id}`,
    STANDINGS: (id: string) => `/tournaments/${id}/standings`,
    SCHEDULE: (id: string) => `/tournaments/${id}/schedule`,
  },

  // News endpoints
  NEWS: {
    LIST: '/news',
    DETAIL: (id: string) => `/news/${id}`,
    CATEGORIES: '/news/categories',
  },

  // Search endpoints
  SEARCH: {
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions',
  },
} as const; 