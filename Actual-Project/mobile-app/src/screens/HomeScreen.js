import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ReportCard from '../components/ReportCard';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { APP_NAME } from '../config/constants';

const REPORTS_STORAGE_KEY = '@saved_reports';

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [recentReports, setRecentReports] = useState([]);

    useEffect(() => {
        loadReports();

        // Refresh reports when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            loadReports();
        });

        return unsubscribe;
    }, [navigation]);

    const loadReports = async () => {
        try {
            const saved = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
            if (saved) {
                const reports = JSON.parse(saved);
                setRecentReports(reports.slice(0, 3)); // Show last 3
            }
        } catch (error) {
            console.error('Failed to load reports:', error);
        }
    };

    const howItWorks = [
        {
            icon: 'cloud-upload-outline',
            title: 'Upload Photos',
            description: 'Take or upload photos',
        },
        {
            icon: 'analytics-outline',
            title: 'AI Analysis',
            description: 'AI detects damages',
        },
        {
            icon: 'document-text-outline',
            title: 'Get Report',
            description: 'Receive detailed report',
        },
    ];

    return (
        <SafeAreaView style={styles.container} >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.appName}>{APP_NAME}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.avatarButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Ionicons name="person-circle" size={36} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Hero Card */}
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>Assess Car Damage{'\n'}Instantly with AI</Text>
                        <Text style={styles.heroSubtitle}>
                            Upload 3-6 photos to get a detailed repair estimate and damage report in seconds.
                        </Text>
                        <Button
                            title="Start New Assessment"
                            variant="secondary"
                            onPress={() => navigation.navigate('NewAssessment')}
                            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textWhite} />}
                            style={styles.heroButton}
                        />
                    </View>
                    <View style={styles.heroImageContainer}>
                        <Ionicons name="car-sport" size={100} color="rgba(255,255,255,0.2)" />
                    </View>
                </LinearGradient>

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How it works</Text>
                    <View style={styles.stepsContainer}>
                        {howItWorks.map((step, index) => (
                            <View key={index} style={styles.stepItem}>
                                <View style={styles.stepIconContainer}>
                                    <Ionicons name={step.icon} size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDescription}>{step.description}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recent Reports */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Reports</Text>
                        {recentReports.length > 0 && (
                            <TouchableOpacity onPress={() => navigation.navigate('History')}>
                                <Text style={styles.viewAllLink}>View All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {recentReports.length > 0 ? (
                        recentReports.map((report, index) => (
                            <ReportCard
                                key={report.id || index}
                                report={report}
                                onPress={() => navigation.navigate('Results', { report })}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyReports}>
                            <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
                            <Text style={styles.emptyText}>No reports yet</Text>
                            <Text style={styles.emptySubtext}>
                                Start your first assessment to see reports here
                            </Text>
                        </View>
                    )}
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
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appName: {
        fontSize: 22, fontWeight: '600',
        color: colors.text,
    },
    avatarButton: {
        padding: spacing.xs,
    },
    heroCard: {
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xxl,
        overflow: 'hidden',
        position: 'relative',
    },
    heroContent: {
        flex: 1,
        zIndex: 1,
    },
    heroTitle: {
        fontSize: 28, fontWeight: '700',
        color: colors.textWhite,
        marginBottom: spacing.md,
    },
    heroSubtitle: {
        fontSize: 16, fontWeight: '400',
        color: 'rgba(255,255,255,0.85)',
        marginBottom: spacing.xl,
        
    },
    heroButton: {
        alignSelf: 'flex-start',
    },
    heroImageContainer: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        opacity: 0.5,
    },
    section: {
        marginBottom: spacing.xxl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '600',
        color: colors.text,
    },
    viewAllLink: {
        fontSize: 14, fontWeight: '400',
        color: colors.primary,
        fontWeight: '600',
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    stepItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    stepIconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    stepTitle: {
        fontSize: 14, fontWeight: '400',
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    stepDescription: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
    },
    emptyReports: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
    },
    emptyText: {
        fontSize: 16, fontWeight: '400',
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: 14, fontWeight: '400',
        color: colors.textLight,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
});

export default HomeScreen;
