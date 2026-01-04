/**
 * Shared constants used across the application
 */

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 30000, // 30 seconds
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    REMEMBERED_USERNAME: 'rememberedUsername',
    THEME: 'theme',
} as const;

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORUM: '/forum',
    POST_DETAIL: '/forum/post/:postId',
    GROUP: '/forum/group/:groupId',
    PROFILE: '/profile/:userId',
    CHAT: '/chat',
    SETTINGS: '/settings',
} as const;

// Toast Duration (in milliseconds)
export const TOAST_DURATION = {
    SHORT: 2000,
    MEDIUM: 4000,
    LONG: 6000,
} as const;

// Date Formats (for Vietnamese)
export const DATE_FORMATS = {
    TIME_ONLY: { hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions,
    DATE_ONLY: { day: '2-digit', month: '2-digit', year: 'numeric' } as Intl.DateTimeFormatOptions,
    FULL: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;
