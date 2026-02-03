import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { theme } from '../styles';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style,
}: ButtonProps) {
    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const buttonStyles: ViewStyle[] = [
        styles.base,
        styles[`size_${size}`],
        disabled && styles.disabled,
        style as ViewStyle,
    ].filter(Boolean) as ViewStyle[];

    const textStyles: TextStyle[] = [
        styles.text,
        styles[`textSize_${size}`],
        variant === 'primary' && styles.textPrimary,
        variant === 'secondary' && styles.textSecondary,
        variant === 'outline' && styles.textOutline,
        disabled && styles.textDisabled,
    ].filter(Boolean) as TextStyle[];

    const content = (
        <>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? theme.colors.background : theme.colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </>
    );

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                disabled={disabled || loading}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={disabled
                        ? [theme.colors.textMuted, theme.colors.textMuted]
                        : [theme.colors.primary, theme.colors.primaryDark]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[buttonStyles, styles.gradient]}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[
                buttonStyles,
                variant === 'secondary' && styles.secondary,
                variant === 'outline' && styles.outline,
            ]}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {content}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    gradient: {
        ...theme.shadows.glow,
    },
    secondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    disabled: {
        opacity: 0.5,
    },
    size_sm: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
    },
    size_md: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.md,
    },
    size_lg: {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xxl,
        borderRadius: theme.borderRadius.lg,
    },
    text: {
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    textSize_sm: {
        fontSize: theme.typography.sizes.sm,
    },
    textSize_md: {
        fontSize: theme.typography.sizes.lg,
    },
    textSize_lg: {
        fontSize: theme.typography.sizes.xl,
    },
    textPrimary: {
        color: theme.colors.background,
    },
    textSecondary: {
        color: theme.colors.text,
    },
    textOutline: {
        color: theme.colors.primary,
    },
    textDisabled: {
        color: theme.colors.textMuted,
    },
});
