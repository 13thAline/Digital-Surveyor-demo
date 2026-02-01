import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAssessment } from '../context/AssessmentContext';
import { analyzeDamage } from '../services/api';
import { theme } from '../styles';

type ProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Processing'>;

interface Props {
    navigation: ProcessingScreenNavigationProp;
}

const STATUS_MESSAGES = [
    'Uploading image...',
    'Detecting vehicle parts...',
    'Analyzing damage...',
    'Calculating severity...',
    'Generating estimate...',
];

export function ProcessingScreen({ navigation }: Props) {
    const { capturedImageUri, setDamageResult, setAnalysisImages, setError, setIsProcessing } = useAssessment();
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start animations
        startAnimations();

        // Status message cycling
        const statusInterval = setInterval(() => {
            setCurrentStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
        }, 700);

        // Process the image
        processImage();

        return () => {
            clearInterval(statusInterval);
        };
    }, []);

    const startAnimations = () => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotate animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Progress animation
        Animated.timing(progressAnim, {
            toValue: 100,
            duration: 3500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const processImage = async () => {
        if (!capturedImageUri) {
            setError('No image to analyze');
            navigation.replace('Home');
            return;
        }

        setIsProcessing(true);

        try {
            const result = await analyzeDamage(capturedImageUri);

            // Set the analysis images (annotated + heatmap)
            setAnalysisImages(
                result.annotatedImageUrl || null,
                result.heatmapUrl || null
            );

            setDamageResult(result);
            navigation.replace('Results');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Analysis failed');
            navigation.replace('Home');
        }
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const spinReverse = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['360deg', '0deg'],
    });

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            {/* Animated rings */}
            <View style={styles.animationContainer}>
                <Animated.View
                    style={[
                        styles.ring,
                        styles.ringOuter,
                        {
                            transform: [{ scale: pulseAnim }, { rotate: spin }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.ring,
                        styles.ringMiddle,
                        {
                            transform: [{ scale: pulseAnim }, { rotate: spinReverse }],
                        },
                    ]}
                />
                <View style={styles.centerIcon}>
                    <Text style={styles.iconText}>🧠</Text>
                </View>
            </View>

            {/* Status text */}
            <View style={styles.statusContainer}>
                <Text style={styles.title}>Analyzing Damage</Text>
                <Text style={styles.statusText}>
                    {STATUS_MESSAGES[currentStatusIndex]}
                </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Info text */}
            <Text style={styles.infoText}>
                Our AI is detecting parts and measuring damage depth
            </Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    animationContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    ring: {
        position: 'absolute',
        borderRadius: 100,
        borderWidth: 2,
    },
    ringOuter: {
        width: 180,
        height: 180,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    ringMiddle: {
        width: 140,
        height: 140,
        borderColor: theme.colors.secondary,
        opacity: 0.6,
    },
    centerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        ...theme.shadows.glow,
    },
    iconText: {
        fontSize: 36,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xxl,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    statusText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.primary,
        height: 24,
    },
    progressContainer: {
        width: '100%',
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    progressBackground: {
        height: 6,
        backgroundColor: theme.colors.backgroundTertiary,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.full,
    },
    infoText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
});
