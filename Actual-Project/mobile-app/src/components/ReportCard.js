import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../styles/theme';

const ReportCard = ({
    report,
    onPress,
}) => {
    const {
        vehicleName = 'Vehicle Assessment',
        date = new Date().toLocaleDateString(),
        costMin = 0,
        costMax = 0,
        thumbnail = null,
        detectionCount = 0,
    } = report || {};

    const formatCost = (min, max) => {
        if (min === 0 && max === 0) return 'Pending';
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {thumbnail ? (
                    <Image source={{ uri: thumbnail }} style={styles.image} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="car-outline" size={32} color={colors.textLight} />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{vehicleName}</Text>
                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.date}>{date}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <View style={styles.issuesBadge}>
                        <Text style={styles.issuesText}>{detectionCount} issues</Text>
                    </View>
                </View>
            </View>

            <View style={styles.costContainer}>
                <Text style={styles.costLabel}>Est. Cost</Text>
                <Text style={styles.cost}>{formatCost(costMin, costMax)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16, fontWeight: '400',
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        
        marginBottom: spacing.xs,
    },
    date: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    issuesBadge: {
        backgroundColor: colors.surfaceSecondary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    issuesText: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        fontWeight: '500',
    },
    costContainer: {
        alignItems: 'flex-end',
    },
    costLabel: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    cost: {
        fontSize: 14, fontWeight: '400',
        fontWeight: '600',
        color: colors.primary,
    },
});

export default ReportCard;
