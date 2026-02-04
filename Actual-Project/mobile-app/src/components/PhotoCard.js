import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../styles/theme';

const PhotoCard = ({
    photo = null,
    onPress,
    onRemove,
    size = 'medium',
}) => {
    const getSize = () => {
        switch (size) {
            case 'small':
                return 80;
            case 'large':
                return 150;
            default:
                return 110;
        }
    };

    const cardSize = getSize();

    if (photo) {
        return (
            <View style={[styles.container, { width: cardSize, height: cardSize }]}>
                <Image source={{ uri: photo }} style={styles.image} />
                {onRemove && (
                    <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.emptyContainer, { width: cardSize, height: cardSize }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name="add" size={32} color={colors.textLight} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
    },
    emptyContainer: {
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PhotoCard;
