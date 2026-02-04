// API Configuration
// Backend server (Node.js) for auth and analysis
export const BACKEND_URL = 'http://10.1.59.37:5000';

// AI server (Python/FastAPI) for serving static files (images)
export const AI_SERVER_URL = 'http://10.1.59.37:8000';

// For backward compatibility - points to backend for analysis
export const API_URL = BACKEND_URL;

// App Configuration
export const APP_NAME = 'AutoAssess';
export const APP_TAGLINE = 'Assess Car Damage Instantly with AI';

// Photo Configuration
export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 6;

// Default User Location (can be updated in profile)
export const DEFAULT_LOCATION = {
    city: '',
    state: '',
};

// Auth Configuration
export const TOKEN_STORAGE_KEY = '@auth_token';
export const USER_STORAGE_KEY = '@user_data';
