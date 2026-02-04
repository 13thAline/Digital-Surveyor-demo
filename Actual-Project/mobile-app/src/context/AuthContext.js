import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../config/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user data and token on app start
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem(TOKEN_STORAGE_KEY),
                AsyncStorage.getItem(USER_STORAGE_KEY)
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Optionally validate token with backend
                try {
                    const response = await fetch(`${BACKEND_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (!response.ok) {
                        // Token is invalid, clear storage
                        await clearAuth();
                    }
                } catch (error) {
                    // Network error - keep cached user for offline use
                    console.log('Could not validate token, using cached data');
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearAuth = async () => {
        await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
        setToken(null);
        setUser(null);
    };

    const signUp = async (userData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    phone: userData.phone || null,
                    city: userData.city,
                    state: userData.state,
                    address: userData.address || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Sign up failed' };
            }

            // Store token and user data
            await Promise.all([
                AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token),
                AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
            ]);

            setToken(data.token);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            console.error('Sign up error:', error);

            // Fallback to local storage if backend is unavailable
            if (error.message.includes('Network request failed')) {
                const newUser = {
                    id: Date.now().toString(),
                    ...userData,
                    createdAt: new Date().toISOString(),
                };
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
                setUser(newUser);
                return { success: true, message: 'Offline mode - data saved locally' };
            }

            return { success: false, error: error.message };
        }
    };

    const signIn = async (email, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Invalid email or password' };
            }

            // Store token and user data
            await Promise.all([
                AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token),
                AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
            ]);

            setToken(data.token);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            console.error('Sign in error:', error);

            // Fallback to local check if backend is unavailable
            if (error.message.includes('Network request failed')) {
                const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (userData) {
                    const storedUser = JSON.parse(userData);
                    if (storedUser.email === email) {
                        setUser(storedUser);
                        return { success: true, message: 'Offline login' };
                    }
                }
                return { success: false, error: 'Cannot connect to server. Please check your network.' };
            }

            return { success: false, error: error.message };
        }
    };

    const signOut = async () => {
        try {
            await clearAuth();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const updateProfile = async (updates) => {
        try {
            if (token) {
                const response = await fetch(`${BACKEND_URL}/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updates)
                });

                if (response.ok) {
                    const data = await response.json();
                    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
                    setUser(data.user);
                    return { success: true };
                }
            }

            // Fallback to local update
            const updatedUser = { ...user, ...updates };
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);

            // Fallback to local update
            const updatedUser = { ...user, ...updates };
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true };
        }
    };

    // Helper to get auth headers for API calls
    const getAuthHeaders = () => {
        if (token) {
            return { 'Authorization': `Bearer ${token}` };
        }
        return {};
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                signUp,
                signIn,
                signOut,
                updateProfile,
                getAuthHeaders,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
