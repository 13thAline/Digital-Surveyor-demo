import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const SignUpScreen = ({ navigation }) => {
    const { signUp } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: '',
        state: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateForm = () => {
        const { name, email, password, confirmPassword, city, state } = formData;

        if (!name || !email || !password) {
            return 'Please fill in required fields (name, email, password)';
        }

        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }

        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }

        if (!email.includes('@')) {
            return 'Please enter a valid email address';
        }

        if (!city || !state) {
            return 'Please provide your city and state for the report';
        }

        return null;
    };

    const handleSignUp = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        const result = await signUp(formData);

        setLoading(false);
        if (!result.success) {
            setError(result.error || 'Sign up failed');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Create Account</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <Text style={styles.subtitle}>
                        Sign up to start assessing vehicle damage with AI
                    </Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={18} color={colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Personal Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>

                        <Input
                            label="Full Name *"
                            value={formData.name}
                            onChangeText={(v) => updateField('name', v)}
                            placeholder="Enter your full name"
                            autoCapitalize="words"
                            icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Input
                            label="Email *"
                            value={formData.email}
                            onChangeText={(v) => updateField('email', v)}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChangeText={(v) => updateField('phone', v)}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
                        />
                    </View>

                    {/* Location Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location (for Report)</Text>
                        <Text style={styles.sectionHint}>
                            This information will be included in your PDF reports
                        </Text>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Input
                                    label="City *"
                                    value={formData.city}
                                    onChangeText={(v) => updateField('city', v)}
                                    placeholder="City"
                                    autoCapitalize="words"
                                    icon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Input
                                    label="State *"
                                    value={formData.state}
                                    onChangeText={(v) => updateField('state', v)}
                                    placeholder="State"
                                    autoCapitalize="characters"
                                    icon={<Ionicons name="map-outline" size={20} color={colors.textSecondary} />}
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
                    </View>

                    {/* Password Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Security</Text>

                        <Input
                            label="Password *"
                            value={formData.password}
                            onChangeText={(v) => updateField('password', v)}
                            placeholder="Create a password (min 6 characters)"
                            secureTextEntry
                            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Input
                            label="Confirm Password *"
                            value={formData.confirmPassword}
                            onChangeText={(v) => updateField('confirmPassword', v)}
                            placeholder="Confirm your password"
                            secureTextEntry
                            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                        />
                    </View>

                    <Button
                        title="Create Account"
                        onPress={handleSignUp}
                        loading={loading}
                        style={styles.signupButton}
                    />

                    <View style={styles.signinContainer}>
                        <Text style={styles.signinText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.signinLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22, fontWeight: '600',
        color: colors.text,
    },
    placeholder: {
        width: 40,
    },
    subtitle: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: spacing.xxl,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error + '10',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        
    },
    errorText: {
        fontSize: 14, fontWeight: '400',
        color: colors.error,
        flex: 1,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    sectionHint: {
        fontSize: 12, fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        
    },
    halfInput: {
        flex: 1,
    },
    signupButton: {
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    signinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    signinText: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
    },
    signinLink: {
        fontSize: 16, fontWeight: '400',
        color: colors.primary,
        fontWeight: '600',
    },
});

export default SignUpScreen;
