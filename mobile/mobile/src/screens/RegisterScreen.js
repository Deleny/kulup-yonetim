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
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
    const [adSoyad, setAdSoyad] = useState('');
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!adSoyad || !email || !sifre) {
            Alert.alert('Hata', 'Tüm alanları doldurun');
            return;
        }

        setLoading(true);
        try {
            // Gerçek API çağrısı
            await api.post('/api/auth/register', { email, sifre, adSoyad });

            Alert.alert('Başarılı', 'Hesabınız oluşturuldu!', [
                { text: 'Tamam', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            const msg = error.response?.data?.error || 'Kayıt başarısız';
            Alert.alert('Hata', msg);
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
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Ionicons name="person-add" size={36} color={COLORS.white} />
                        </View>
                        <Text style={styles.title}>Hesap Oluştur</Text>
                        <Text style={styles.subtitle}>Kulüp yönetim sistemine katılın</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ad Soyad</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={COLORS.gray400} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Adınız Soyadınız"
                                    placeholderTextColor={COLORS.gray400}
                                    value={adSoyad}
                                    onChangeText={setAdSoyad}
                                />
                            </View>
                        </View>

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
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                            <Text style={styles.buttonText}>
                                {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginLinkText}>
                                Zaten hesabınız var mı? <Text style={styles.loginLinkBold}>Giriş Yap</Text>
                            </Text>
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
        marginBottom: SIZES.xxl,
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
    title: {
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
    loginLink: {
        marginTop: SIZES.xxl,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
    },
    loginLinkBold: {
        fontWeight: FONTS.bold,
        color: COLORS.primary,
    },
});
