import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing } from '../styles/theme';

const DamageItem = ({
    damage,
    showChevron = true,
}) => {
    const {
        partDetected = 'Part',
        damageType = 'Damage',
        severityScore = 0,
    } = damage || {};

    const getSeverityInfo = (score) => {
        if (score >= 70) {
            return {
                label: 'Needs Replacement',
                color: colors.severity.high,
                icon: 'alert-circle',
            };
        } else if (score >= 40) {
            return {
                label: 'Major Repair',
                color: colors.severity.medium,
                icon: 'alert-circle-outline',
            };
        } else {
            return {
                label: 'Repairable',
                color: colors.severity.low,
                icon: 'checkmark-circle',
            };
        }
    };

    const severityInfo = getSeverityInfo(severityScore);

    const getPartIcon = (part) => {
        const partLower = part.toLowerCase();
        if (partLower.includes('bumper')) return 'car-outline';
        if (partLower.includes('headlight') || partLower.includes('light')) return 'flashlight-outline';
        if (partLower.includes('hood')) return 'car-sport-outline';
        if (partLower.includes('door')) return 'enter-outline';
        if (partLower.includes('windshield') || partLower.includes('window')) return 'tablet-landscape-outline';
        if (partLower.includes('mirror')) return 'resize-outline';
        if (partLower.includes('wheel') || partLower.includes('tire')) return 'ellipse-outline';
        return 'construct-outline';
    };

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: severityInfo.color + '15' }]}>
                <Ionicons
                    name={getPartIcon(partDetected)}
                    size={22}
                    color={severityInfo.color}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.partName}>{partDetected}</Text>
                <Text style={styles.damageType}>
                    {damageType} • <Text style={{ color: severityInfo.color }}>{severityInfo.label}</Text>
                </Text>
            </View>

            {showChevron && (
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textLight}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    partName: {
        fontSize: 16, fontWeight: '400',
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    damageType: {
        fontSize: 14, fontWeight: '400',
        color: colors.textSecondary,
    },
});

export default DamageItem;
