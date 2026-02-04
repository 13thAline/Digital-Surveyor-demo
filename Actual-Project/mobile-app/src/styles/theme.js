// Theme configuration for the app

export const colors = {
    primary: '#2563EB', // Blue - main action color
    primaryDark: '#1D4ED8',
    primaryLight: '#3B82F6',

    secondary: '#10B981', // Green - success/find repair shop
    secondaryDark: '#059669',

    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',

    text: '#1E293B',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
    textWhite: '#FFFFFF',

    border: '#E2E8F0',
    borderLight: '#F1F5F9',

    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',

    severity: {
        high: '#EF4444',
        medium: '#F59E0B',
        low: '#10B981',
    },

    overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const borderRadius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
};

// Typography styles - explicitly typed for Android compatibility
export const typography = {
    h1: {
        fontSize: 28,
        fontWeight: '700',
    },
    h2: {
        fontSize: 22,
        fontWeight: '600',
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};
