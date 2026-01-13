import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !sifre) {
            Alert.alert('Hata', 'Email ve şifre gereklidir');
            return;
        }

        setLoading(true);
        try {
            // API çağrısı - backend hazır olduğunda aktif edilecek
            // const response = await api.post('/api/auth/login', { email, sifre });
            // await AsyncStorage.setItem('userToken', response.data.token);
            
            // Şimdilik direkt geç
            await AsyncStorage.setItem('userEmail', email);
            navigation.replace('Main');
        } catch (error) {
            Alert.alert('Hata', 'Giriş başarısız. Email veya şifre hatalı.');
        } finally {
            setLoading(false);
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
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>KY</Text>
                        </View>
                        <Text style={styles.appName}>Kulüp Yönetimi</Text>
                        <Text style={styles.subtitle}>Kampüs Kulüp Takip Sistemi</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Hoş Geldiniz</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.gray400} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="ornek@email.com"
                                    placeholderTextColor={COLORS.gray400}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Şifre</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={COLORS.gray400}
                                    value={sifre}
                                    onChangeText={setSifre}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={COLORS.gray400}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>veya</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.registerButtonText}>Yeni Hesap Oluştur</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SIZES.xxxl,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radiusXl,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.primary,
        marginBottom: SIZES.lg,
    },
    logoText: {
        fontSize: 32,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    appName: {
        fontSize: SIZES.fontXxxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    subtitle: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginTop: SIZES.xs,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusXxl,
        padding: SIZES.xxl,
        ...SHADOWS.lg,
    },
    welcomeText: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SIZES.xxl,
    },
    inputGroup: {
        marginBottom: SIZES.lg,
    },
    label: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.gray600,
        marginBottom: SIZES.sm,
        marginLeft: SIZES.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        paddingHorizontal: SIZES.md,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        marginLeft: SIZES.sm,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        height: 52,
        marginTop: SIZES.md,
        gap: SIZES.sm,
        ...SHADOWS.primary,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SIZES.xxl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.gray200,
    },
    dividerText: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray400,
        paddingHorizontal: SIZES.lg,
    },
    registerButton: {
        borderWidth: 2,
        borderColor: COLORS.gray100,
        borderRadius: SIZES.radiusMd,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButtonText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.bold,
        color: COLORS.gray700,
    },
});
