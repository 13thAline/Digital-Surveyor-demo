import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { resolveMediaUrl } from './mediaUrl';


const getLocalIP = () => {
    // A browser on another device must use the development computer's host.
    if (Platform.OS === 'web') {
        return globalThis.location?.hostname || 'localhost';
    }

    // Try to get the IP from Expo's debugger host (works in Expo Go)
    const debuggerHost = Constants.expoConfig?.hostUri ||
        Constants.manifest2?.extra?.expoClient?.hostUri ||
        Constants.manifest?.debuggerHost;
    if (debuggerHost) {
        // debuggerHost is in format "192.168.1.100:8081", extract just the IP
        const ip = new URL(debuggerHost.includes('://') ? debuggerHost : `http://${debuggerHost}`).hostname;
        if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
            return ip;
        }
    }

    // Android emulator reaches the development computer at this address.
    // Physical-device builds can set EXPO_PUBLIC_BACKEND_URL explicitly.
    return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const LOCAL_IP = getLocalIP();

// Backend server (Node.js) for auth and analysis
export const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || `http://${LOCAL_IP}:5000`).replace(/\/$/, '');
export const resolveImageUrl = (value) => resolveMediaUrl(value, BACKEND_URL);

// AI server (Python/FastAPI) for serving static files (images)  
export const AI_SERVER_URL = (process.env.EXPO_PUBLIC_AI_SERVER_URL || `http://${LOCAL_IP}:8000`).replace(/\/$/, '');

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
