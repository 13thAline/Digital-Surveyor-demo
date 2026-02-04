import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import DamageItem from '../components/DamageItem';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const REPORTS_STORAGE_KEY = '@saved_reports';

const ResultsScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const { analysisResult, photos, report } = route.params || {};

    // Use either new analysis or existing report
    const data = analysisResult || report?.analysisResult || {};
    const {
        detections = [],
        annotatedImageUrl = null,
        heatmapUrl = null,
        costEstimate = { total: { min: 0, max: 0 }, parts: { min: 0, max: 0 }, labor: { min: 0, max: 0 } },
    } = data;

    const [currentImage, setCurrentImage] = useState('annotated');
    const [saved, setSaved] = useState(!!report);

    // Get highest severity for badge
    const getOverallSeverity = () => {
        if (detections.length === 0) return null;
        const maxScore = Math.max(...detections.map(d => d.severityScore || 0));
        if (maxScore > 50) return { label: 'Replace Required', color: colors.severity.high };
        if (maxScore >= 20) return { label: 'May Need Repair', color: colors.severity.medium };
        return { label: 'Minor Damage', color: colors.severity.low };
    };

    const severity = getOverallSeverity();

    const formatCurrency = (min, max) => {
        return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
    };

    const saveReport = async () => {
        if (saved) return;

        try {
            const existingReports = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
            const reports = existingReports ? JSON.parse(existingReports) : [];

            const newReport = {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString(),
                vehicleName: 'Vehicle Assessment',
                thumbnail: photos?.[0] || annotatedImageUrl,
                costMin: costEstimate.total.min,
                costMax: costEstimate.total.max,
                detectionCount: detections.length,
                analysisResult: data,
                photos,
                createdAt: new Date().toISOString(),
            };

            reports.unshift(newReport);
            await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports.slice(0, 50)));
            setSaved(true);
            Alert.alert('Saved', 'Report has been saved to your history.');
        } catch (error) {
            console.error('Failed to save report:', error);
            Alert.alert('Error', 'Failed to save report.');
        }
    };

    const [pdfLoading, setPdfLoading] = useState(false);

    const handleGeneratePDF = async () => {
        setPdfLoading(true);
        try {
            const { BACKEND_URL } = await import('../config/constants');

            const response = await fetch(`${BACKEND_URL}/api/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    detections,
                    annotatedImageUrl,
                    heatmapUrl,
                    costEstimate,
                    userDetails: {
                        name: user?.name,
                        email: user?.email,
                        phone: user?.phone,
                        city: user?.city,
                        state: user?.state,
                        address: user?.address
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const data = await response.json();
            const pdfDownloadUrl = `${BACKEND_URL}${data.pdfUrl}`;

            // Ask user if they want to download/view the PDF
            Alert.alert(
                '✅ PDF Generated',
                `Your damage assessment report is ready!\n\n` +
                `• Customer: ${user?.name || 'N/A'}\n` +
                `• Issues Found: ${detections.length}\n` +
                `• Cost: ${formatCurrency(costEstimate.total.min, costEstimate.total.max)}`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Download PDF',
                        onPress: () => Linking.openURL(pdfDownloadUrl)
                    }
                ]
            );

        } catch (error) {
            console.error('PDF generation error:', error);
            Alert.alert(
                'Report Summary',
                `• Customer: ${user?.name || 'N/A'}\n` +
                `• Location: ${user?.city || 'N/A'}, ${user?.state || 'N/A'}\n` +
                `• Issues Found: ${detections.length}\n` +
                `• Estimated Cost: ${formatCurrency(costEstimate.total.min, costEstimate.total.max)}`,
                [{ text: 'OK' }]
            );
        } finally {
            setPdfLoading(false);
        }
    };

    const handleFindRepairShop = () => {
        const query = encodeURIComponent('auto body repair shop near me');
        Linking.openURL(`https://www.google.com/maps/search/${query}`);
    };

    const displayImage = currentImage === 'annotated' ? annotatedImageUrl : heatmapUrl;

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
                <Text style={styles.headerTitle}>Assessment Result</Text>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveReport}
                >
                    <Ionicons
                        name={saved ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={saved ? colors.primary : colors.text}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Display */}
                <View style={styles.imageSection}>
                    {displayImage ? (
                        <Image
                            source={{ uri: displayImage }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />
                    ) : photos?.[0] ? (
                        <Image
                            source={{ uri: photos[0] }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.noImagePlaceholder}>
                            <Ionicons name="image-outline" size={48} color={colors.textLight} />
                            <Text style={styles.noImageText}>No image available</Text>
                        </View>
                    )}

                    {/* Severity Badge */}
                    {severity && (
                        <View style={[styles.severityBadge, { backgroundColor: severity.color }]}>
                            <Text style={styles.severityText}>{severity.label}</Text>
                        </View>
                    )}

                    {/* Image Toggle */}
                    {annotatedImageUrl && heatmapUrl && (
                        <View style={styles.imageToggle}>
                            <TouchableOpacity
                                style={[styles.toggleButton, currentImage === 'annotated' && styles.toggleActive]}
                                onPress={() => setCurrentImage('annotated')}
                            >
                                <Text style={[styles.toggleText, currentImage === 'annotated' && styles.toggleTextActive]}>
                                    Annotated
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, currentImage === 'heatmap' && styles.toggleActive]}
                                onPress={() => setCurrentImage('heatmap')}
                            >
                                <Text style={[styles.toggleText, currentImage === 'heatmap' && styles.toggleTextActive]}>
                                    Depth Map
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Cost Estimate Card */}
                <View style={styles.costCard}>
                    <Text style={styles.costLabel}>Estimated Repair Cost</Text>
                    <Text style={styles.costValue}>
                        {formatCurrency(costEstimate.total.min, costEstimate.total.max)}
                    </Text>

                    <View style={styles.costBreakdown}>
                        <View style={styles.costRow}>
                            <Text style={styles.costItemLabel}>Replacement Parts</Text>
                            <Text style={styles.costItemValue}>
                                {formatCurrency(costEstimate.parts.min, costEstimate.parts.max)}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.costRow}>
                            <Text style={styles.costItemLabel}>Labor (4-6 hrs)</Text>
                            <Text style={styles.costItemValue}>
                                {formatCurrency(costEstimate.labor.min, costEstimate.labor.max)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Detected Issues */}
                <View style={styles.issuesSection}>
                    <View style={styles.issuesHeader}>
                        <Text style={styles.sectionTitle}>Detected Issues</Text>
                        <View style={styles.issueCount}>
                            <Text style={styles.issueCountText}>{detections.length} items found</Text>
                        </View>
                    </View>

                    {detections.length > 0 ? (
                        detections.map((detection, index) => (
                            <DamageItem
                                key={index}
                                damage={detection}
                                showChevron={false}
                            />
                        ))
                    ) : (
                        <View style={styles.noIssues}>
                            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                            <Text style={styles.noIssuesText}>No damage detected</Text>
                            <Text style={styles.noIssuesSubtext}>
                                Your vehicle appears to be in good condition
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.pdfButton, pdfLoading && styles.pdfButtonDisabled]}
                        onPress={handleGeneratePDF}
                        disabled={pdfLoading}
                    >
                        <Ionicons
                            name={pdfLoading ? "hourglass-outline" : "document-text-outline"}
                            size={20}
                            color={pdfLoading ? colors.textSecondary : colors.primary}
                        />
                        <Text style={[styles.pdfButtonText, pdfLoading && styles.pdfButtonTextDisabled]}>
                            {pdfLoading ? 'Generating...' : 'PDF'}
                        </Text>
                    </TouchableOpacity>

                    <Button
                        title="Find Repair Shop"
                        variant="secondary"
                        onPress={handleFindRepairShop}
                        icon={<Ionicons name="location-outline" size={20} color={colors.textWhite} />}
                        style={styles.repairButton}
                    />
                </View>
            </ScrollView>
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
    saveButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    imageSection: {
        marginBottom: spacing.xl,
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: 220,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surfaceSecondary,
    },
    noImagePlaceholder: {
        width: '100%',
        height: 220,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noImageText: {
        fontSize: 14, fontWeight: '400',
        color: colors.textLight,
        marginTop: spacing.sm,
    },
    severityBadge: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    severityText: {
        fontSize: 12, fontWeight: '400',
        fontWeight: '600',
        color: colors.textWhite,
    },
    imageToggle: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.xs,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    toggleButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    toggleActive: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        fontSize: 12, fontWeight: '400',
        fontWeight: '600',
        color: colors.textSecondary,
    },
    toggleTextActive: {
        color: colors.textWhite,
    },
    costCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    costLabel: {
        fontSize: 14, fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    costValue: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    costBreakdown: {
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    costItemLabel: {
        fontSize: 14, fontWeight: '400',
        color: colors.textSecondary,
    },
    costItemValue: {
        fontSize: 14, fontWeight: '400',
        fontWeight: '600',
        color: colors.text,
    },
    issuesSection: {
        marginBottom: spacing.xl,
    },
    issuesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '600',
        color: colors.text,
    },
    issueCount: {
        backgroundColor: colors.surfaceSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    issueCountText: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        fontWeight: '500',
    },
    noIssues: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
    },
    noIssuesText: {
        fontSize: 16, fontWeight: '400',
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
    },
    noIssuesSubtext: {
        fontSize: 14, fontWeight: '400',
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    actionButtons: {
        flexDirection: 'row',

    },
    pdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    pdfButtonText: {
        fontSize: 16, fontWeight: '600',
        color: colors.primary,
    },
    pdfButtonDisabled: {
        borderColor: colors.border,
        backgroundColor: colors.surfaceSecondary,
    },
    pdfButtonTextDisabled: {
        color: colors.textSecondary,
    },
    repairButton: {
        flex: 1,
    },
});

export default ResultsScreen;
