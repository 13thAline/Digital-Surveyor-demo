import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../styles/theme';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon = null,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error = '',
    style = {},
    multiline = false,
    numberOfLines = 1,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focused,
                    error && styles.error,
                ]}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        
        color: colors.text,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
    },
    focused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    error: {
        borderColor: colors.error,
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: 16,
        fontWeight: '400',
        
        color: colors.text,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        fontWeight: '400',
        
        color: colors.error,
        marginTop: spacing.xs,
    },
});

export default Input;
