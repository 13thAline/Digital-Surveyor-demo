import { Platform } from 'react-native';
import Constants from 'expo-constants';


const getLocalIP = () => {
    // For web, always use localhost
    if (Platform.OS === 'web') {
        return 'localhost';
    }

    // Try to get the IP from Expo's debugger host (works in Expo Go)
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        // debuggerHost is in format "192.168.1.100:8081", extract just the IP
        const ip = debuggerHost.split(':')[0];
        if (ip && ip !== 'localhost') {
            return ip;
        }
    }

    // Fallback IP (update this if auto-detection fails)
    return '10.131.171.219';
};

const LOCAL_IP = getLocalIP();

// Backend server (Node.js) for auth and analysis
export const BACKEND_URL = `http://${LOCAL_IP}:5000`;

// AI server (Python/FastAPI) for serving static files (images)  
export const AI_SERVER_URL = `http://${LOCAL_IP}:8000`;

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

