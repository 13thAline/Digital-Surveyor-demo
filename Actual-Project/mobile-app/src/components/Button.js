import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../styles/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon = null,
    style = {},
}) => {
    const getButtonStyle = () => {
        const baseStyle = [styles.button, styles[size]];

        switch (variant) {
            case 'secondary':
                baseStyle.push(styles.secondary);
                break;
            case 'outline':
                baseStyle.push(styles.outline);
                break;
            case 'ghost':
                baseStyle.push(styles.ghost);
                break;
            default:
                baseStyle.push(styles.primary);
        }

        if (disabled) {
            baseStyle.push(styles.disabled);
        }

        return baseStyle;
    };

    const getTextStyle = () => {
        const baseStyle = [styles.text];

        switch (variant) {
            case 'outline':
            case 'ghost':
                baseStyle.push(styles.textOutline);
                break;
            case 'secondary':
                baseStyle.push(styles.textWhite);
                break;
            default:
                baseStyle.push(styles.textWhite);
        }

        if (size === 'small') {
            baseStyle.push(styles.textSmall);
        }

        return baseStyle;
    };

    return (
        <TouchableOpacity
            style={[...getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textWhite}
                />
            ) : (
                <>
                    {icon}
                    <Text style={getTextStyle()}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        
    },
    // Sizes
    small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
    },
    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
    // Text styles
    text: {
        fontSize: 16,
        fontWeight: '600',
        
    },
    textWhite: {
        color: colors.textWhite,
    },
    textOutline: {
        color: colors.primary,
    },
    textSmall: {
        fontSize: 14,
    },
});

export default Button;
