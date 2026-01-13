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

export default function KulupAyarlariScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [kulup, setKulup] = useState(null);
    const [ad, setAd] = useState('');
    const [aciklama, setAciklama] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    useEffect(() => {
        loadKulup();
    }, []);

    const loadKulup = async () => {
        try {
            const kulupId = await AsyncStorage.getItem('baskanKulupId');
            if (!kulupId) {
                Alert.alert('Hata', 'Kulüp bilgisi bulunamadı');
                navigation.goBack();
                return;
            }

            const response = await api.get(`/api/kulup/${kulupId}`);
            setKulup(response.data);
            setAd(response.data.ad || '');
            setAciklama(response.data.aciklama || '');
        } catch (error) {
            console.log('Kulüp yükleme hatası:', error);
            Alert.alert('Hata', 'Kulüp bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!ad.trim()) {
            Alert.alert('Hata', 'Kulüp adı boş olamaz');
            return;
        }

        setSaving(true);
        try {
            const kulupId = await AsyncStorage.getItem('baskanKulupId');
            await api.put(`/api/kulup/${kulupId}`, {
                ad: ad.trim(),
                aciklama: aciklama.trim(),
            });

            await AsyncStorage.setItem('baskanKulupAd', ad.trim());
            Alert.alert('Başarılı', 'Kulüp bilgileri güncellendi', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.error || 'Kulüp güncellenemedi');
        } finally {
            setSaving(false);
        }
    };

    // AI ile açıklama oluştur
    const generateAiDescription = async () => {
        if (!ad.trim()) {
            Alert.alert('Hata', 'Önce kulüp adı girin');
            return;
        }
        setIsGeneratingAi(true);
        try {
            const response = await api.post('/ai/club-description', {
                clubName: ad.trim()
            });
            if (response.data.description) {
                setAciklama(response.data.description);
            }
        } catch (error) {
            console.log('AI hatası:', error.message);
            Alert.alert('AI Hatası', 'Açıklama oluşturulamadı.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#d97706" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.kulupAvatar}>
                    <Text style={styles.kulupAvatarText}>{ad?.charAt(0) || 'K'}</Text>
                </View>
                <Text style={styles.kulupAdPreview}>{ad || 'Kulüp Adı'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kulüp Bilgileri</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kulüp Adı</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="business-outline" size={20} color={COLORS.gray400} />
                        <TextInput
                            style={styles.input}
                            value={ad}
                            onChangeText={setAd}
                            placeholder="Kulüp adını girin"
                            placeholderTextColor={COLORS.gray400}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Açıklama</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={aciklama}
                            onChangeText={setAciklama}
                            placeholder="Kulübünüzü tanıtın..."
                            placeholderTextColor={COLORS.gray400}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* AI ile Açıklama Oluştur Butonu */}
                <TouchableOpacity
                    style={[styles.aiButton, (!ad.trim() || isGeneratingAi) && styles.aiButtonDisabled]}
                    onPress={generateAiDescription}
                    disabled={isGeneratingAi || !ad.trim()}
                >
                    {isGeneratingAi ? (
                        <ActivityIndicator size="small" color="#8b5cf6" />
                    ) : (
                        <>
                            <Ionicons name="sparkles" size={18} color="#8b5cf6" />
                            <Text style={styles.aiButtonText}>AI ile Açıklama Oluştur</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Durum</Text>
                <View style={styles.statusItem}>
                    <View style={styles.statusIcon}>
                        <Ionicons
                            name={kulup?.aktif ? "checkmark-circle" : "time"}
                            size={24}
                            color={kulup?.aktif ? "#10b981" : "#f59e0b"}
                        />
                    </View>
                    <View style={styles.statusContent}>
                        <Text style={styles.statusTitle}>
                            {kulup?.aktif ? "Aktif" : "Onay Bekliyor"}
                        </Text>
                        <Text style={styles.statusSubtitle}>
                            {kulup?.aktif
                                ? "Kulübünüz aktif ve görünür durumda"
                                : "Admin onayı bekleniyor"}
                        </Text>
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

            <View style={{ height: SIZES.xxxl }} />
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
    header: {
        alignItems: 'center',
        paddingVertical: SIZES.xxl,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: SIZES.radiusXxl,
        borderBottomRightRadius: SIZES.radiusXxl,
        ...SHADOWS.md,
    },
    kulupAvatar: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radiusXl,
        backgroundColor: '#d97706',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    kulupAvatarText: {
        fontSize: 32,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    kulupAdPreview: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
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
    textAreaContainer: {
        height: 120,
        alignItems: 'flex-start',
        paddingTop: SIZES.md,
    },
    input: {
        flex: 1,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        marginLeft: SIZES.sm,
    },
    textArea: {
        marginLeft: 0,
        height: '100%',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.gray50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    statusTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    statusSubtitle: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d97706',
        borderRadius: SIZES.radiusMd,
        marginHorizontal: SIZES.lg,
        height: 52,
        gap: SIZES.sm,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: '#8b5cf6',
        paddingVertical: SIZES.md,
        gap: SIZES.sm,
        marginTop: SIZES.sm,
    },
    aiButtonDisabled: {
        opacity: 0.5,
    },
    aiButtonText: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: '#8b5cf6',
    },
});
