import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';

export default function ProfilDuzenleScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adSoyad, setAdSoyad] = useState('');
    const [email, setEmail] = useState('');
    const [eskiSifre, setEskiSifre] = useState('');
    const [yeniSifre, setYeniSifre] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const storedAdSoyad = await AsyncStorage.getItem('adSoyad');
            const storedEmail = await AsyncStorage.getItem('userEmail');
            setAdSoyad(storedAdSoyad || '');
            setEmail(storedEmail || '');
        } catch (error) {
            console.log('Profil yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!adSoyad.trim()) {
            Alert.alert('Hata', 'Ad Soyad boş olamaz');
            return;
        }

        setSaving(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            await api.put(`/api/profil/${userId}`, {
                adSoyad: adSoyad.trim(),
                eskiSifre: eskiSifre || null,
                yeniSifre: yeniSifre || null,
            });

            await AsyncStorage.setItem('adSoyad', adSoyad.trim());
            Alert.alert('Başarılı', 'Profil güncellendi', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.error || 'Profil güncellenemedi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={COLORS.gray400} />
                        <TextInput
                            style={styles.input}
                            value={adSoyad}
                            onChangeText={setAdSoyad}
                            placeholder="Adınız Soyadınız"
                            placeholderTextColor={COLORS.gray400}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputContainer, styles.inputDisabled]}>
                        <Ionicons name="mail-outline" size={20} color={COLORS.gray400} />
                        <TextInput
                            style={[styles.input, { color: COLORS.gray400 }]}
                            value={email}
                            editable={false}
                        />
                    </View>
                    <Text style={styles.hint}>Email değiştirilemez</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
                <Text style={styles.sectionHint}>Şifrenizi değiştirmek istemiyorsanız boş bırakın</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mevcut Şifre</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} />
                        <TextInput
                            style={styles.input}
                            value={eskiSifre}
                            onChangeText={setEskiSifre}
                            placeholder="••••••••"
                            placeholderTextColor={COLORS.gray400}
                            secureTextEntry
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Yeni Şifre</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-open-outline" size={20} color={COLORS.gray400} />
                        <TextInput
                            style={styles.input}
                            value={yeniSifre}
                            onChangeText={setYeniSifre}
                            placeholder="••••••••"
                            placeholderTextColor={COLORS.gray400}
                            secureTextEntry
                        />
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={{ height: SIZES.xxxl + 60 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        margin: SIZES.lg,
        padding: SIZES.lg,
        ...SHADOWS.sm,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.text,
        marginBottom: SIZES.sm,
    },
    sectionHint: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray400,
        marginBottom: SIZES.lg,
    },
    inputGroup: {
        marginBottom: SIZES.lg,
    },
    label: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.gray600,
        marginBottom: SIZES.sm,
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
    inputDisabled: {
        backgroundColor: COLORS.gray100,
    },
    input: {
        flex: 1,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        marginLeft: SIZES.sm,
    },
    hint: {
        fontSize: SIZES.fontXs,
        color: COLORS.gray400,
        marginTop: SIZES.xs,
        marginLeft: SIZES.xs,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        marginHorizontal: SIZES.lg,
        height: 52,
        gap: SIZES.sm,
        ...SHADOWS.primary,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
});
