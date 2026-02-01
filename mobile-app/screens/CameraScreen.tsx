import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CaptureOverlay, Button } from '../components';
import { useAssessment } from '../context/AssessmentContext';
import { analyzeImageForGlare, GlareAnalysisResult } from '../services/glareDetection';
import { theme } from '../styles';

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

interface Props {
    navigation: CameraScreenNavigationProp;
}

export function CameraScreen({ navigation }: Props) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzingGlare, setIsAnalyzingGlare] = useState(false);
    const [glareResult, setGlareResult] = useState<GlareAnalysisResult | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const { setCapturedImage: setContextImage } = useAssessment();

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <StatusBar barStyle="light-content" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    We need camera access to capture vehicle damage photos
                </Text>
                <Button
                    title="Grant Permission"
                    onPress={requestPermission}
                    style={{ marginTop: theme.spacing.xl }}
                />
            </View>
        );
    }

    const handleCapture = async () => {
        if (cameraRef.current) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });

                if (photo?.uri) {
                    setCapturedImage(photo.uri);

                    // Analyze for glare
                    setIsAnalyzingGlare(true);
                    try {
                        const result = await analyzeImageForGlare(photo.uri);
                        setGlareResult(result);

                        if (result.hasGlare) {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        }
                    } catch (glareError) {
                        console.log('Glare analysis failed, proceeding anyway');
                        setGlareResult(null);
                    } finally {
                        setIsAnalyzingGlare(false);
                    }
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to capture photo. Please try again.');
            }
        }
    };

    const handleRetake = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCapturedImage(null);
        setGlareResult(null);
    };

    const handleConfirm = async () => {
        if (capturedImage) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setContextImage(capturedImage);
            navigation.navigate('Processing');
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    // Preview mode after capture
    if (capturedImage) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <Image source={{ uri: capturedImage }} style={styles.preview} />

                {/* Loading overlay while analyzing glare */}
                {isAnalyzingGlare && (
                    <View style={styles.glareLoading}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.glareLoadingText}>Checking image quality...</Text>
                    </View>
                )}

                {/* Glare warning overlay */}
                {!isAnalyzingGlare && glareResult?.hasGlare && (
                    <View style={styles.glareWarning}>
                        <Text style={styles.glareWarningIcon}>⚠️</Text>
                        <Text style={styles.glareWarningTitle}>Glare Detected</Text>
                        <Text style={styles.glareWarningText}>{glareResult.message}</Text>
                        <Text style={styles.glareWarningSubtext}>
                            Photos with glare may affect damage assessment accuracy.
                        </Text>
                    </View>
                )}

                {/* Normal preview header when no glare */}
                {!isAnalyzingGlare && !glareResult?.hasGlare && (
                    <View style={styles.previewOverlay}>
                        <Text style={styles.previewTitle}>Photo Captured</Text>
                        <Text style={styles.previewText}>
                            Does this clearly show the damage?
                        </Text>
                    </View>
                )}

                {!isAnalyzingGlare && (
                    <View style={styles.previewActions}>
                        <Button
                            title="Retake"
                            variant="outline"
                            onPress={handleRetake}
                            style={{ flex: 1, marginRight: theme.spacing.md }}
                        />
                        <Button
                            title={glareResult?.hasGlare ? "Use Anyway" : "Analyze"}
                            onPress={handleConfirm}
                            style={{ flex: 1 }}
                        />
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Camera layer */}
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
            />

            {/* Overlay layer - positioned absolutely on top of camera */}
            <View style={styles.overlayContainer}>
                <CaptureOverlay />

                {/* Top bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.flipButton}
                        onPress={toggleCameraFacing}
                    >
                        <Text style={styles.flipButtonText}>🔄</Text>
                    </TouchableOpacity>
                </View>

                {/* Capture button */}
                <View style={styles.captureContainer}>
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={handleCapture}
                        activeOpacity={0.7}
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    camera: {
        ...StyleSheet.absoluteFillObject,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    permissionTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xxl,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    permissionText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: theme.spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: theme.colors.text,
    },
    flipButton: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipButtonText: {
        fontSize: 20,
    },
    captureContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.text,
        padding: 4,
        ...theme.shadows.lg,
    },
    captureButtonInner: {
        flex: 1,
        borderRadius: 36,
        backgroundColor: theme.colors.text,
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    preview: {
        flex: 1,
        resizeMode: 'cover',
    },
    previewOverlay: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    previewTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xxl,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    previewText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    previewActions: {
        position: 'absolute',
        bottom: 50,
        left: theme.spacing.xl,
        right: theme.spacing.xl,
        flexDirection: 'row',
    },
    glareLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    glareLoadingText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
    },
    glareWarning: {
        position: 'absolute',
        top: 80,
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        backgroundColor: 'rgba(245, 158, 11, 0.95)',
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    glareWarningIcon: {
        fontSize: 36,
        marginBottom: theme.spacing.sm,
    },
    glareWarningTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xl,
        color: '#1a1a1a',
        marginBottom: theme.spacing.xs,
    },
    glareWarningText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    glareWarningSubtext: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: '#333',
        textAlign: 'center',
    },
});
