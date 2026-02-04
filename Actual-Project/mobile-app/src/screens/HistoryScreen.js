import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportCard from '../components/ReportCard';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const REPORTS_STORAGE_KEY = '@saved_reports';

const HistoryScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadReports();

        const unsubscribe = navigation.addListener('focus', () => {
            loadReports();
        });

        return unsubscribe;
    }, [navigation]);

    const loadReports = async () => {
        try {
            const saved = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
            if (saved) {
                setReports(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load reports:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReports();
        setRefreshing(false);
    };

    const deleteReport = async (reportId) => {
        Alert.alert(
            'Delete Report',
            'Are you sure you want to delete this report?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedReports = reports.filter(r => r.id !== reportId);
                            await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));
                            setReports(updatedReports);
                        } catch (error) {
                            console.error('Failed to delete report:', error);
                        }
                    },
                },
            ]
        );
    };

    const clearAllReports = () => {
        Alert.alert(
            'Clear All Reports',
            'Are you sure you want to delete all reports? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(REPORTS_STORAGE_KEY);
                            setReports([]);
                        } catch (error) {
                            console.error('Failed to clear reports:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderReport = ({ item }) => (
        <ReportCard
            report={item}
            onPress={() => navigation.navigate('Results', { report: item })}
        />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptySubtitle}>
                Your assessment history will appear here after you complete your first damage analysis.
            </Text>
            <TouchableOpacity
                style={styles.startButton}
                onPress={() => navigation.navigate('NewAssessment')}
            >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.startButtonText}>Start New Assessment</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>History</Text>
                {reports.length > 0 && (
                    <TouchableOpacity onPress={clearAllReports}>
                        <Text style={styles.clearButton}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Reports Count */}
            {reports.length > 0 && (
                <View style={styles.countContainer}>
                    <Text style={styles.countText}>{reports.length} Report{reports.length !== 1 ? 's' : ''}</Text>
                </View>
            )}

            <FlatList
                data={reports}
                renderItem={renderReport}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />
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
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    headerTitle: {
        fontSize: 22, fontWeight: '600',
        color: colors.text,
    },
    clearButton: {
        fontSize: 14, fontWeight: '400',
        color: colors.error,
        fontWeight: '600',
    },
    countContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    countText: {
        fontSize: 14, fontWeight: '400',
        color: colors.textSecondary,
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: spacing.sm,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.xxxl,
    },
    emptyTitle: {
        fontSize: 18, fontWeight: '600',
        color: colors.text,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
        
        marginBottom: spacing.xl,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        
        backgroundColor: colors.primary + '15',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
    },
    startButtonText: {
        fontSize: 16, fontWeight: '600',
        color: colors.primary,
    },
});

export default HistoryScreen;
