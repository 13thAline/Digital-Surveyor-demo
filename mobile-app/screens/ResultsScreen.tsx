import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    StatusBar,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DamageCard, Button, ImageGallery } from '../components';
import { useAssessment } from '../context/AssessmentContext';
import { generateReport } from '../services/api';
import { theme } from '../styles';

type ResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;

interface Props {
    navigation: ResultsScreenNavigationProp;
}

export function ResultsScreen({ navigation }: Props) {
    const { damageResult, capturedImageUri, annotatedImageUri, heatmapUri, resetAssessment } = useAssessment();
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleNewAssessment = () => {
        resetAssessment();
        navigation.replace('Home');
    };

    const handleGenerateReport = async () => {
        if (!damageResult) return;

        setIsGeneratingReport(true);
        try {
            const pdfUrl = await generateReport(damageResult);

            if (pdfUrl) {
                Alert.alert(
                    'Report Generated',
                    'Your PDF report has been created. Would you like to open it?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open PDF',
                            onPress: () => Linking.openURL(pdfUrl)
                        },
                    ]
                );
            } else {
                Alert.alert('Error', 'Failed to generate report. Please try again.');
            }
        } catch (error) {
            console.error('Report generation error:', error);
            Alert.alert('Error', 'Failed to generate report. Please check your connection.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    if (!damageResult) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No results available</Text>
                <Button
                    title="Go Home"
                    onPress={handleNewAssessment}
                    style={{ marginTop: theme.spacing.xl }}
                />
            </View>
        );
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.gradient}
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <Animated.View
                        style={[
                            styles.header,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.successIcon}>✓</Text>
                        <Text style={styles.title}>Assessment Complete</Text>
                        <Text style={styles.subtitle}>
                            AI analysis finished in under 5 seconds
                        </Text>
                    </Animated.View>

                    {/* Photo Gallery - Original, Annotated, Heatmap */}
                    <Animated.View
                        style={[
                            styles.gallerySection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Photo Evidence</Text>
                        <ImageGallery
                            originalUri={capturedImageUri || undefined}
                            annotatedUri={damageResult.annotatedImageUrl || annotatedImageUri || undefined}
                            heatmapUri={damageResult.heatmapUrl || heatmapUri || undefined}
                        />
                    </Animated.View>

                    {/* Damage Card - Detection details */}
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <DamageCard
                            result={damageResult}
                        />
                    </Animated.View>

                    {/* Cost Breakdown */}
                    <Animated.View
                        style={[
                            styles.costSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Repair Estimate</Text>

                        <View style={styles.costCard}>
                            <View style={styles.costRow}>
                                <Text style={styles.costLabel}>Parts Cost</Text>
                                <Text style={styles.costValue}>
                                    {formatCurrency(damageResult.partsCost)}
                                </Text>
                            </View>

                            <View style={styles.costRow}>
                                <Text style={styles.costLabel}>Labor Cost</Text>
                                <Text style={styles.costValue}>
                                    {formatCurrency(damageResult.laborCost)}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.costRow}>
                                <Text style={styles.totalLabel}>Total Estimate</Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(damageResult.estimatedCost)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.disclaimer}>
                            * Estimate based on average market rates. Actual costs may vary.
                        </Text>
                    </Animated.View>

                    {/* Formula explanation */}
                    <Animated.View
                        style={[
                            styles.formulaSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.formulaTitle}>How we calculated this</Text>
                        <Text style={styles.formulaText}>
                            (Base Part Price + Labor Cost) × Damage Severity × Location Multiplier
                        </Text>
                    </Animated.View>
                </ScrollView>

                {/* Action buttons */}
                <Animated.View
                    style={[
                        styles.actions,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <Button
                        title={isGeneratingReport ? "Generating..." : "Generate PDF Report"}
                        variant="outline"
                        onPress={handleGenerateReport}
                        disabled={isGeneratingReport}
                        style={{ marginBottom: theme.spacing.md }}
                    />
                    <Button
                        title="New Assessment"
                        onPress={handleNewAssessment}
                    />
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
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    errorText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.textSecondary,
    },
    header: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    successIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.success,
        textAlign: 'center',
        lineHeight: 60,
        fontSize: 32,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xxl,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
    },
    gallerySection: {
        marginBottom: theme.spacing.lg,
    },
    costSection: {
        marginTop: theme.spacing.xl,
    },
    sectionTitle: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    costCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    costLabel: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
    },
    costValue: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.sm,
    },
    totalLabel: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
    },
    totalValue: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xl,
        color: theme.colors.primary,
    },
    disclaimer: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },
    formulaSection: {
        marginTop: theme.spacing.xl,
        backgroundColor: theme.colors.backgroundTertiary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    formulaTitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.xs,
    },
    formulaText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    actions: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
});
