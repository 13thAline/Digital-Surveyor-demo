import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const STORAGE_KEY = '@user_data';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user data on app start
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEY);
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (userData) => {
        try {
            const newUser = {
                id: Date.now().toString(),
                ...userData,
                createdAt: new Date().toISOString(),
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
            setUser(newUser);
            return { success: true };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    };

    const signIn = async (email, password) => {
        try {
            // For demo purposes, we just check if user exists with matching email
            const userData = await AsyncStorage.getItem(STORAGE_KEY);
            if (userData) {
                const storedUser = JSON.parse(userData);
                if (storedUser.email === email) {
                    setUser(storedUser);
                    return { success: true };
                }
            }
            return { success: false, error: 'Invalid email or password' };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const updateProfile = async (updates) => {
        try {
            const updatedUser = { ...user, ...updates };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                signUp,
                signIn,
                signOut,
                updateProfile,
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
