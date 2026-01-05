/**
 * Logger utility - chỉ log trong môi trường development
 * Sử dụng thay vì console.log để tránh log trong production
 */

// Check if in development mode - works with Vite
const isDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');

export const logger = {
    log: (...args: any[]) => {
        if (isDev) {
            console.log(...args);
        }
    },

    info: (...args: any[]) => {
        if (isDev) {
            console.info(...args);
        }
    },

    warn: (...args: any[]) => {
        if (isDev) {
            console.warn(...args);
        }
    },

    error: (...args: any[]) => {
        // Luôn log errors, kể cả trong production
        console.error(...args);
    },

    debug: (...args: any[]) => {
        if (isDev) {
            console.debug(...args);
        }
    },

    // Group logs với title
    group: (title: string, fn: () => void) => {
        if (isDev) {
            console.group(title);
            fn();
            console.groupEnd();
        }
    },
};

export default logger;
