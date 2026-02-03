import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageGalleryProps {
    originalUri?: string;
    annotatedUri?: string;
    heatmapUri?: string;
}

type TabKey = 'original' | 'annotated' | 'heatmap';

interface Tab {
    key: TabKey;
    label: string;
    emoji: string;
    uri?: string;
}

export function ImageGallery({ originalUri, annotatedUri, heatmapUri }: ImageGalleryProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('original');
    const [modalVisible, setModalVisible] = useState(false);

    const tabs: Tab[] = [
        { key: 'original', label: 'Photo', emoji: '📷', uri: originalUri },
        { key: 'annotated', label: 'Damage', emoji: '🎯', uri: annotatedUri },
        { key: 'heatmap', label: 'Severity', emoji: '🌡️', uri: heatmapUri },
    ];

    const availableTabs = tabs.filter(tab => tab.uri);
    const activeImage = tabs.find(tab => tab.key === activeTab)?.uri;

    if (availableTabs.length === 0) {
        return (
            <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No images available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {availableTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            activeTab === tab.key && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                        <Text
                            style={[
                                styles.tabLabel,
                                activeTab === tab.key && styles.activeTabLabel,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Image Display */}
            <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.9}
            >
                {activeImage ? (
                    <>
                        <Image
                            source={{ uri: activeImage }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            style={styles.imageGradient}
                        />
                        <View style={styles.imageOverlay}>
                            <View style={styles.tapHint}>
                                <Text style={styles.tapHintText}>Tap to expand</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>Image loading...</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Description based on active tab */}
            <View style={styles.descriptionContainer}>
                {activeTab === 'original' && (
                    <Text style={styles.description}>
                        📸 Original captured photo of the vehicle damage
                    </Text>
                )}
                {activeTab === 'annotated' && (
                    <Text style={styles.description}>
                        🎯 AI-detected damage area with bounding box highlighting
                    </Text>
                )}
                {activeTab === 'heatmap' && (
                    <Text style={styles.description}>
                        🌡️ ZoeDepth severity map showing damage depth analysis
                    </Text>
                )}
            </View>

            {/* Fullscreen Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        {activeImage && (
                            <Image
                                source={{ uri: activeImage }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        )}
                        <View style={styles.modalClose}>
                            <Text style={styles.modalCloseText}>✕ Tap anywhere to close</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.backgroundSecondary,
        padding: theme.spacing.xs,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
        gap: 4,
    },
    activeTab: {
        backgroundColor: theme.colors.surface,
        ...theme.shadows.sm,
    },
    tabEmoji: {
        fontSize: 14,
    },
    tabLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
    },
    activeTabLabel: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    imageContainer: {
        height: 220,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: theme.spacing.md,
        right: theme.spacing.md,
    },
    tapHint: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
    },
    tapHintText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.text,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundSecondary,
    },
    placeholderText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },
    descriptionContainer: {
        padding: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    description: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    noImageContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    noImageText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: screenWidth,
        height: screenHeight * 0.8,
    },
    modalClose: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
    },
    modalCloseText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
    },
});
