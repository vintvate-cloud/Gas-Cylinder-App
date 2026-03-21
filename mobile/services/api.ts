import axios from 'axios';
import { storage } from './storage';

// Development detection - __DEV__ is true in development builds, false in production
const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;

// API URL configuration
// In development: use localhost (ensure backend runs on same machine)
// In production: use the deployed backend URL
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
let BASE_URL: string;

if (envApiUrl) {
    // Explicit override takes priority
    BASE_URL = envApiUrl;
} else if (isDevelopment) {
    // Default to localhost in development
    console.warn('[API] Using localhost for development. Set EXPO_PUBLIC_API_URL to override.');
    BASE_URL = 'http://10.0.2.2:5000'; // 10.0.2.2 is Android emulator's localhost
} else {
    // Production fallback
    console.warn('[API] EXPO_PUBLIC_API_URL not set, using production fallback');
    BASE_URL = 'https://gas-cylinder-app.onrender.com';
}

// NOTE: Render deployment uses routes WITHOUT /api prefix
const api = axios.create({
    baseURL: `${BASE_URL}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the Bearer token to every request if it exists.
 */
api.interceptors.request.use(
    async (config) => {
        const token = await storage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Intercepts errors globally. If a 401 is detected, we can handle it here or in the component.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isLoginRequest) {
            // Signal a session expiry (component will handle the redirect via AuthContext)
            console.warn('[API] Unauthorized access - Session might be expired');
        }
        return Promise.reject(error);
    }
);

export default api;
