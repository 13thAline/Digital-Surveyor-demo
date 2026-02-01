import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles';
import { DamageResult } from '../context/AssessmentContext';

interface DamageCardProps {
    result: DamageResult;
    imageUri?: string;
}

export function DamageCard({ result, imageUri }: DamageCardProps) {
    const getSeverityColor = (score: number): string => {
        if (score < 30) return theme.colors.success;
        if (score < 60) return theme.colors.warning;
        return theme.colors.error;
    };

    const getSeverityLabel = (score: number): string => {
        if (score < 30) return 'Minor';
        if (score < 60) return 'Moderate';
        return 'Severe';
    };

    const severityColor = getSeverityColor(result.severityScore);
    const severityLabel = getSeverityLabel(result.severityScore);

    return (
        <View style={styles.container}>
            {/* Image preview */}
            {imageUri && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.imageGradient}
                    />
                    <View style={styles.damageOverlay}>
                        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                            <Text style={styles.severityBadgeText}>{severityLabel}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Detection info */}
            <View style={styles.infoSection}>
                <View style={styles.detectionRow}>
                    <View style={styles.detectionItem}>
                        <Text style={styles.label}>Part Detected</Text>
                        <Text style={styles.value}>{result.partDetected}</Text>
                    </View>
                    <View style={styles.detectionItem}>
                        <Text style={styles.label}>Damage Type</Text>
                        <Text style={styles.value}>{result.damageType}</Text>
                    </View>
                </View>

                {/* Severity meter */}
                <View style={styles.severitySection}>
                    <View style={styles.severityHeader}>
                        <Text style={styles.label}>Damage Severity</Text>
                        <Text style={[styles.severityPercent, { color: severityColor }]}>
                            {result.severityScore}%
                        </Text>
                    </View>
                    <View style={styles.meterBackground}>
                        <View
                            style={[
                                styles.meterFill,
                                {
                                    width: `${result.severityScore}%`,
                                    backgroundColor: severityColor,
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Confidence */}
                <View style={styles.confidenceRow}>
                    <Text style={styles.confidenceLabel}>AI Confidence</Text>
                    <Text style={styles.confidenceValue}>
                        {Math.round(result.confidenceScore * 100)}%
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.lg,
    },
    imageContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    damageOverlay: {
        position: 'absolute',
        top: theme.spacing.md,
        right: theme.spacing.md,
    },
    severityBadge: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
    },
    severityBadgeText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
    },
    infoSection: {
        padding: theme.spacing.lg,
    },
    detectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    detectionItem: {
        flex: 1,
    },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
    },
    severitySection: {
        marginBottom: theme.spacing.lg,
    },
    severityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    severityPercent: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xl,
    },
    meterBackground: {
        height: 8,
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
    },
    meterFill: {
        height: '100%',
        borderRadius: theme.borderRadius.full,
    },
    confidenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    confidenceLabel: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },
    confidenceValue: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.primary,
    },
});
