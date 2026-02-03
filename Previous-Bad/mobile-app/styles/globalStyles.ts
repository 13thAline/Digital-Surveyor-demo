import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    centeredContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    // Cards with glassmorphism
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.md,
    },

    cardLight: {
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },

    // Text styles
    heading: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xxxl,
        color: theme.colors.text,
        lineHeight: theme.typography.sizes.xxxl * theme.typography.lineHeights.tight,
    },

    subheading: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.xl,
        color: theme.colors.text,
        lineHeight: theme.typography.sizes.xl * theme.typography.lineHeights.normal,
    },

    bodyText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.relaxed,
    },

    caption: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },

    // Button styles
    buttonPrimary: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flexDirection: 'row' as const,
        ...theme.shadows.glow,
    },

    buttonPrimaryText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.background,
    },

    buttonSecondary: {
        backgroundColor: 'transparent',
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flexDirection: 'row' as const,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },

    buttonSecondaryText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.primary,
    },

    // Input styles
    input: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },

    // Row layouts
    row: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },

    rowSpaceBetween: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },

    // Spacing helpers
    mt_sm: { marginTop: theme.spacing.sm },
    mt_md: { marginTop: theme.spacing.md },
    mt_lg: { marginTop: theme.spacing.lg },
    mt_xl: { marginTop: theme.spacing.xl },

    mb_sm: { marginBottom: theme.spacing.sm },
    mb_md: { marginBottom: theme.spacing.md },
    mb_lg: { marginBottom: theme.spacing.lg },
    mb_xl: { marginBottom: theme.spacing.xl },

    p_md: { padding: theme.spacing.md },
    p_lg: { padding: theme.spacing.lg },
    p_xl: { padding: theme.spacing.xl },
});
