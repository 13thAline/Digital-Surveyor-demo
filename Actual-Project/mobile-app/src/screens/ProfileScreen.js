import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const ProfileScreen = ({ navigation }) => {
    const { user, updateProfile, signOut } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        city: user?.city || '',
        state: user?.state || '',
        address: user?.address || '',
    });
    const [loading, setLoading] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        const result = await updateProfile(formData);
        setLoading(false);

        if (result.success) {
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully.');
        } else {
            Alert.alert('Error', result.error || 'Failed to update profile.');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            city: user?.city || '',
            state: user?.state || '',
            address: user?.address || '',
        });
        setIsEditing(false);
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: signOut,
                },
            ]
        );
    };

    const ProfileItem = ({ icon, label, value }) => (
        <View style={styles.profileItem}>
            <View style={styles.profileItemIcon}>
                <Ionicons name={icon} size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.profileItemContent}>
                <Text style={styles.profileItemLabel}>{label}</Text>
                <Text style={styles.profileItemValue}>{value || 'Not provided'}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                {!isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButton}>Edit</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleCancel}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={48} color={colors.primary} />
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                </View>

                {isEditing ? (
                    /* Edit Mode */
                    <View style={styles.editForm}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>

                        <Input
                            label="Full Name"
                            value={formData.name}
                            onChangeText={(v) => updateField('name', v)}
                            placeholder="Enter your full name"
                            autoCapitalize="words"
                            icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(v) => updateField('email', v)}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChangeText={(v) => updateField('phone', v)}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Location</Text>
                        <Text style={styles.sectionHint}>This information will be included in your PDF reports</Text>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Input
                                    label="City"
                                    value={formData.city}
                                    onChangeText={(v) => updateField('city', v)}
                                    placeholder="City"
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Input
                                    label="State"
                                    value={formData.state}
                                    onChangeText={(v) => updateField('state', v)}
                                    placeholder="State"
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>

                        <Input
                            label="Address"
                            value={formData.address}
                            onChangeText={(v) => updateField('address', v)}
                            placeholder="Enter your street address"
                            autoCapitalize="words"
                            icon={<Ionicons name="home-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Button
                            title="Save Changes"
                            onPress={handleSave}
                            loading={loading}
                            style={styles.saveButton}
                        />
                    </View>
                ) : (
                    /* View Mode */
                    <View style={styles.profileInfo}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.profileCard}>
                            <ProfileItem icon="person-outline" label="Full Name" value={user?.name} />
                            <ProfileItem icon="mail-outline" label="Email" value={user?.email} />
                            <ProfileItem icon="call-outline" label="Phone" value={user?.phone} />
                        </View>

                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.profileCard}>
                            <ProfileItem icon="location-outline" label="City" value={user?.city} />
                            <ProfileItem icon="map-outline" label="State" value={user?.state} />
                            <ProfileItem icon="home-outline" label="Address" value={user?.address} />
                        </View>

                        {/* Sign Out Button */}
                        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                            <Ionicons name="log-out-outline" size={20} color={colors.error} />
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    headerTitle: {
        fontSize: 22, fontWeight: '600',
        color: colors.text,
    },
    editButton: {
        fontSize: 16, fontWeight: '400',
        color: colors.primary,
        fontWeight: '600',
    },
    cancelButton: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
        fontWeight: '600',
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    userName: {
        fontSize: 22, fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    sectionHint: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: spacing.md,
        marginTop: -spacing.sm,
    },
    profileCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.xl,
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    profileItemIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    profileItemContent: {
        flex: 1,
    },
    profileItemLabel: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    profileItemValue: {
        fontSize: 16, fontWeight: '400',
        color: colors.text,
    },
    editForm: {
        marginTop: spacing.md,
    },
    row: {
        flexDirection: 'row',
        
    },
    halfInput: {
        flex: 1,
    },
    saveButton: {
        marginTop: spacing.xl,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        
        backgroundColor: colors.error + '10',
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.md,
        marginTop: spacing.xl,
    },
    signOutText: {
        fontSize: 16, fontWeight: '600',
        color: colors.error,
    },
    profileInfo: {},
});

export default ProfileScreen;
