import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import { APP_NAME, APP_TAGLINE } from '../config/constants';

const LoginScreen = ({ navigation }) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await signIn(email, password);

        setLoading(false);
        if (!result.success) {
            setError(result.error || 'Login failed');
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
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark]}
                            style={styles.logoContainer}
                        >
                            <Ionicons name="car-sport" size={40} color={colors.textWhite} />
                        </LinearGradient>
                        <Text style={styles.appName}>{APP_NAME}</Text>
                        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Text style={styles.formTitle}>Welcome Back</Text>
                        <Text style={styles.formSubtitle}>Sign in to continue</Text>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={18} color={colors.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginButton}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.signupLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
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
        alignItems: 'center',
        marginTop: spacing.xxxl,
        marginBottom: spacing.xxxl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    appName: {
        fontSize: 28, fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    tagline: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    formTitle: {
        fontSize: 22, fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    formSubtitle: {
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
    loginButton: {
        marginTop: spacing.md,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xxl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        fontSize: 12, fontWeight: '400',
        color: colors.textLight,
        marginHorizontal: spacing.md,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 16, fontWeight: '400',
        color: colors.textSecondary,
    },
    signupLink: {
        fontSize: 16, fontWeight: '400',
        color: colors.primary,
        fontWeight: '600',
    },
});

export default LoginScreen;
