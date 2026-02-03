export const theme = {
    colors: {
        // Primary palette - vibrant teal/cyan accent
        primary: '#00D4AA',
        primaryLight: '#4DFFDE',
        primaryDark: '#00A88A',

        // Secondary palette - electric blue
        secondary: '#6366F1',
        secondaryLight: '#818CF8',
        secondaryDark: '#4F46E5',

        // Background colors - sleek dark mode
        background: '#0A0E14',
        backgroundSecondary: '#141A24',
        backgroundTertiary: '#1C242F',

        // Surface colors with glassmorphism
        surface: 'rgba(28, 36, 47, 0.8)',
        surfaceLight: 'rgba(44, 56, 72, 0.6)',

        // Text colors
        text: '#FFFFFF',
        textSecondary: '#A0AEC0',
        textMuted: '#718096',

        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Border colors
        border: 'rgba(255, 255, 255, 0.1)',
        borderLight: 'rgba(255, 255, 255, 0.05)',

        // Overlay for camera
        overlay: 'rgba(0, 0, 0, 0.6)',
        greenBox: '#00FF88',
    },

    typography: {
        fontFamily: {
            regular: 'Inter_400Regular',
            medium: 'Inter_500Medium',
            semiBold: 'Inter_600SemiBold',
            bold: 'Inter_700Bold',
        },
        sizes: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 22,
            xxl: 28,
            xxxl: 36,
            display: 48,
        },
        lineHeights: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64,
    },

    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
        glow: {
            shadowColor: '#00D4AA',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
        },
    },
};

export type Theme = typeof theme;
