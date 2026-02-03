import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components';
import { theme } from '../styles';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

export function HomeScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleStartAssessment = () => {
        navigation.navigate('Camera');
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.gradient}
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.container}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoGradient}
                        >
                            <Text style={styles.logoIcon}>🚗</Text>
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <Text style={styles.title}>Digital Surveyor</Text>
                        <Text style={styles.subtitle}>AI-Powered Damage Assessment</Text>
                    </Animated.View>
                </View>

                {/* Features */}
                <Animated.View
                    style={[
                        styles.featuresContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.feature}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>📸</Text>
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Smart Capture</Text>
                            <Text style={styles.featureDescription}>
                                Guided camera overlay ensures quality photos
                            </Text>
                        </View>
                    </View>

                    <View style={styles.feature}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>🧠</Text>
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>AI Analysis</Text>
                            <Text style={styles.featureDescription}>
                                Advanced vision detects damage instantly
                            </Text>
                        </View>
                    </View>

                    <View style={styles.feature}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>💰</Text>
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>Instant Estimate</Text>
                            <Text style={styles.featureDescription}>
                                Get accurate repair costs in seconds
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* CTA Button */}
                <Animated.View
                    style={[
                        styles.ctaContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Button
                        title="Start Assessment"
                        onPress={handleStartAssessment}
                        size="lg"
                    />
                    <Text style={styles.ctaHint}>
                        Point your camera at the vehicle damage
                    </Text>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        justifyContent: 'space-between',
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: theme.spacing.xxl,
    },
    logoContainer: {
        marginBottom: theme.spacing.xl,
    },
    logoGradient: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.glow,
    },
    logoIcon: {
        fontSize: 48,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.display,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    featuresContainer: {
        gap: theme.spacing.md,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    featureEmoji: {
        fontSize: 24,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    featureDescription: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },
    ctaContainer: {
        alignItems: 'center',
        paddingBottom: theme.spacing.xl,
    },
    ctaHint: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.md,
    },
});
