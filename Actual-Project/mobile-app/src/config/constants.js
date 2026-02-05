import { Platform } from 'react-native';

// API Configuration
// Use localhost for web, IP address for mobile devices
const LOCAL_IP = '10.131.171.219';

// Backend server (Node.js) for auth and analysis
export const BACKEND_URL = Platform.OS === 'web'
    ? 'http://localhost:5000'
    : `http://${LOCAL_IP}:5000`;

// AI server (Python/FastAPI) for serving static files (images)  
export const AI_SERVER_URL = Platform.OS === 'web'
    ? 'http://localhost:8000'
    : `http://${LOCAL_IP}:8000`;

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
