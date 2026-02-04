import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PhotoCard from '../components/PhotoCard';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { analyzeMultipleImages } from '../services/api';
import { MAX_PHOTOS, MIN_PHOTOS } from '../config/constants';

const NewAssessmentScreen = ({ navigation }) => {
    const [photos, setPhotos] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Please grant camera and photo library permissions to use this feature.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const showImageOptions = async () => {
        if (photos.length >= MAX_PHOTOS) {
            Alert.alert('Maximum Photos', `You can only upload up to ${MAX_PHOTOS} photos.`);
            return;
        }

        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        Alert.alert(
            'Add Photo',
            'Choose how to add a photo',
            [
                {
                    text: 'Take Photo',
                    onPress: takePhoto,
                },
                {
                    text: 'Choose from Gallery',
                    onPress: pickFromGallery,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setPhotos(prev => [...prev, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: MAX_PHOTOS - photos.length,
            });

            if (!result.canceled && result.assets) {
                const newUris = result.assets.map(asset => asset.uri);
                setPhotos(prev => [...prev, ...newUris].slice(0, MAX_PHOTOS));
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Error', 'Failed to select photos. Please try again.');
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleAnalyze = async () => {
        if (photos.length < MIN_PHOTOS) {
            Alert.alert('More Photos Needed', `Please add at least ${MIN_PHOTOS} photo(s) to analyze.`);
            return;
        }

        setIsAnalyzing(true);

        try {
            const result = await analyzeMultipleImages(photos);

            if (result.success) {
                navigation.navigate('Results', {
                    analysisResult: result.data,
                    photos: photos,
                });
            } else {
                Alert.alert('Analysis Failed', result.error || 'Unable to analyze photos. Please try again.');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const tips = [
        {
            icon: 'sunny-outline',
            title: 'Ensure good lighting',
            description: 'Avoid strong shadows or glare on the damage.',
        },
        {
            icon: 'scan-outline',
            title: 'Capture context',
            description: 'Include the entire panel (e.g., full door), not just the scratch.',
        },
    ];

    // Create grid with empty slots
    const renderPhotoGrid = () => {
        const slots = [];
        for (let i = 0; i < MAX_PHOTOS; i++) {
            slots.push(
                <PhotoCard
                    key={i}
                    photo={photos[i] || null}
                    onPress={showImageOptions}
                    onRemove={photos[i] ? () => removePhoto(i) : null}
                />
            );
        }
        return slots;
    };

    return (
        <SafeAreaView style={styles.container} >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Assessment</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Instructions */}
                <Text style={styles.instructions}>
                    Upload 3-6 photos of the damaged vehicle from different angles for AI analysis.
                </Text>

                {/* Photo Counter */}
                <View style={styles.counterRow}>
                    <Text style={styles.counterLabel}>PHOTOS</Text>
                    <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>{photos.length}/{MAX_PHOTOS}</Text>
                    </View>
                    {photos.length >= MIN_PHOTOS && (
                        <View style={styles.readyBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.readyText}>Ready</Text>
                        </View>
                    )}
                </View>

                {/* Photo Grid */}
                <View style={styles.photoGrid}>
                    {renderPhotoGrid()}
                </View>

                {/* Tips Section */}
                <View style={styles.tipsSection}>
                    {tips.map((tip, index) => (
                        <View key={index} style={styles.tipItem}>
                            <View style={styles.tipIconContainer}>
                                <Ionicons name={tip.icon} size={18} color={colors.primary} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>{tip.title}</Text>
                                <Text style={styles.tipDescription}>{tip.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomAction}>
                <Button
                    title={isAnalyzing ? 'Analyzing...' : 'Analyze Damage'}
                    onPress={handleAnalyze}
                    loading={isAnalyzing}
                    disabled={photos.length < MIN_PHOTOS || isAnalyzing}
                    icon={!isAnalyzing && <Ionicons name="search-outline" size={20} color={colors.textWhite} />}
                    style={styles.analyzeButton}
                />
                {photos.length < MIN_PHOTOS && (
                    <Text style={styles.helperText}>
                        Add at least {MIN_PHOTOS} photo(s) to analyze
                    </Text>
                )}
            </View>

            {/* Loading Overlay */}
            {isAnalyzing && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingTitle}>Analyzing Damage</Text>
                        <Text style={styles.loadingText}>
                            Our AI is examining your photos...
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18, fontWeight: '600',
        color: colors.text,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 120,
    },
    instructions: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        
    },
    counterLabel: {
        fontSize: 12, fontWeight: '400',
        fontWeight: '600',
        color: colors.textSecondary,
        letterSpacing: 0.5,
    },
    counterBadge: {
        backgroundColor: colors.surfaceSecondary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    counterText: {
        fontSize: 12, fontWeight: '400',
        fontWeight: '600',
        color: colors.text,
    },
    readyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success + '15',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        
    },
    readyText: {
        fontSize: 12, fontWeight: '400',
        fontWeight: '600',
        color: colors.success,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        
        marginBottom: spacing.xl,
    },
    tipsSection: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    tipItem: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    tipIconContainer: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 14, fontWeight: '400',
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    tipDescription: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        
    },
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    analyzeButton: {
        width: '100%',
    },
    helperText: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    loadingCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xxl,
        alignItems: 'center',
        width: '80%',
        maxWidth: 280,
    },
    loadingTitle: {
        fontSize: 18, fontWeight: '600',
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    loadingText: {
        fontSize: 14, fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default NewAssessmentScreen;
