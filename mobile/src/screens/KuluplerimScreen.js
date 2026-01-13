import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';

export default function KuluplerimScreen({ navigation }) {
    const [kulupler, setKulupler] = useState([]);
    const [aktifKulupler, setAktifKulupler] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedKulup, setSelectedKulup] = useState(null);
    const [ogrenciNo, setOgrenciNo] = useState('');
    const [telefon, setTelefon] = useState('');
    const [kulupAd, setKulupAd] = useState('');
    const [kulupAciklama, setKulupAciklama] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isUserBaskan, setIsUserBaskan] = useState(false);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // Üyelik verilerini yükle
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId') || '1';

            // Aktif kulüpleri çek
            const kuluplerResponse = await api.get('/api/kulupler');

            // Kullanıcının üyelikleri
            const uyeliklerResponse = await api.get(`/api/uye/${userId}/uyelikler`);
            let uyelikData = uyeliklerResponse.data.map(u => ({
                id: u.id,
                uyelikId: u.id,
                kulupId: u.kulup?.id,
                ad: u.kulup?.ad || 'Bilinmiyor',
                pozisyon: u.pozisyon || 'Üye',
                uyeSayisi: u.kulup?.uyeler?.length || 0,
                aciklama: u.kulup?.aciklama || '',
                isBaskan: false
            }));

            // Başkanın kulübünü ayrıca çek ve listeye ekle
            try {
                const baskanRes = await api.get(`/api/user/${userId}/baskan-kulup`);
                if (baskanRes.data.baskan) {
                    setIsUserBaskan(true);
                    const baskanKulupId = baskanRes.data.kulupId;
                    // Zaten üye listesinde var mı kontrol et
                    const mevcutMu = uyelikData.find(u => u.kulupId === baskanKulupId);
                    if (!mevcutMu) {
                        // Başkan ama üye olarak eklenmemiş, listeye ekle
                        uyelikData.unshift({
                            id: `baskan-${baskanKulupId}`,
                            uyelikId: null,
                            kulupId: baskanKulupId,
                            ad: baskanRes.data.kulupAd,
                            pozisyon: 'Başkan',
                            uyeSayisi: 0,
                            aciklama: baskanRes.data.kulupAciklama || '',
                            isBaskan: true
                        });
                    } else {
                        // Zaten üye, pozisyonu Başkan olarak güncelle
                        mevcutMu.pozisyon = 'Başkan';
                        mevcutMu.isBaskan = true;
                    }
                    // AsyncStorage'a başkan bilgisini kaydet
                    await AsyncStorage.setItem('baskanKulupId', baskanKulupId.toString());
                    await AsyncStorage.setItem('baskanKulupAd', baskanRes.data.kulupAd);
                } else {
                    // Başkan değil - kulüp oluşturma butonu görünsün
                    setIsUserBaskan(false);
                }
            } catch (e) {
                console.log('Başkan kulüp bilgisi alınamadı:', e.message);
                setIsUserBaskan(false);
            }

            setKulupler(uyelikData);

            // Zaten üye olunan kulüpleri filtrele
            const uyeOlunanKulupIds = uyelikData.map(u => u.kulupId).filter(Boolean);
            const filtrelenmisKulupler = (kuluplerResponse.data || []).filter(
                k => !uyeOlunanKulupIds.includes(k.id)
            );
            setAktifKulupler(filtrelenmisKulupler);

        } catch (error) {
            console.log('API hatası:', error.message);
            Alert.alert('Bağlantı Hatası', 'Kulüpler yüklenemedi. Backend bağlantısını kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    }, []);

    const handleJoinKulup = async () => {
        if (!ogrenciNo) {
            Alert.alert('Hata', 'Öğrenci numarası gereklidir');
            return;
        }

        try {
            // Gerçek API çağrısı
            const userId = await AsyncStorage.getItem('userId') || '1';
            await api.post(`/api/kulup/${selectedKulup.id}/katil`, {
                userId: parseInt(userId),
                ogrenciNo,
                telefon
            });

            Alert.alert('Başarılı', `${selectedKulup.ad} kulübüne katılım talebiniz alındı!`);
            setJoinModalVisible(false);
            setOgrenciNo('');
            setTelefon('');
            setSelectedKulup(null);
            loadData();
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.error || 'Katılım işlemi başarısız');
        }
    };

    // Kulüp oluşturma fonksiyonu
    const handleCreateKulup = async () => {
        if (!kulupAd.trim()) {
            Alert.alert('Hata', 'Kulüp adı gereklidir');
            return;
        }
        if (!kulupAciklama.trim()) {
            Alert.alert('Hata', 'Kulüp açıklaması gereklidir');
            return;
        }

        setIsCreating(true);
        try {
            const userId = await AsyncStorage.getItem('userId') || '1';
            await api.post('/api/kulup-olustur', {
                userId: parseInt(userId),
                ad: kulupAd.trim(),
                aciklama: kulupAciklama.trim()
            });

            Alert.alert(
                'Başarılı',
                'Kulüp başarıyla oluşturuldu! Admin onayından sonra aktif olacaktır.',
                [{ text: 'Tamam', onPress: () => { } }]
            );
            setCreateModalVisible(false);
            setKulupAd('');
            setKulupAciklama('');
            loadData();
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.error || 'Kulüp oluşturulurken bir hata oluştu');
        } finally {
            setIsCreating(false);
        }
    };

    // Kulüpten ayrılma fonksiyonu
    const handleLeaveKulup = (item) => {
        if (item.pozisyon === 'Yönetici' || item.pozisyon === 'Baskan') {
            Alert.alert('Uyarı', 'Kulüp başkanı olarak ayrılamazsınız');
            return;
        }

        Alert.alert(
            'Kulüpten Ayrıl',
            `${item.ad} kulübünden ayrılmak istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Ayrıl',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const userId = await AsyncStorage.getItem('userId') || '1';
                            await api.delete(`/api/uyelik/${item.uyelikId}/ayril`, {
                                data: { userId: parseInt(userId) }
                            });
                            Alert.alert('Başarılı', 'Kulüpten ayrıldınız');
                            loadData();
                        } catch (error) {
                            Alert.alert('Hata', error.response?.data?.error || 'Ayrılma işlemi başarısız');
                        }
                    }
                }
            ]
        );
    };

    // AI ile açıklama oluştur
    const generateAiDescription = async () => {
        if (!kulupAd.trim()) {
            Alert.alert('Hata', 'Önce kulüp adı girin');
            return;
        }
        setIsGeneratingAi(true);
        try {
            const response = await api.post('/ai/club-description', {
                clubName: kulupAd.trim()
            });
            if (response.data.description) {
                setKulupAciklama(response.data.description);
            }
        } catch (error) {
            console.log('AI hatası:', error.message);
            Alert.alert('AI Hatası', 'Açıklama oluşturulamadı. Lütfen manuel olarak yazın.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const openJoinModal = (kulup) => {
        setSelectedKulup(kulup);
        setJoinModalVisible(true);
    };

    const renderMyKulup = ({ item }) => {
        // Sadece Başkan olanlar panele erişebilir
        const isBaskan = item.isBaskan || item.pozisyon === 'Başkan';

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => isBaskan && navigation.navigate('BaskanMain')}
                onLongPress={() => !isBaskan && handleLeaveKulup(item)}
            >
                <View style={[styles.avatar, isBaskan && { backgroundColor: '#d97706' }]}>
                    <Text style={styles.avatarText}>{item.ad.charAt(0)}</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.kulupAd}>{item.ad}</Text>
                    <View style={styles.infoRow}>
                        <View style={[styles.badge, isBaskan && styles.badgeAdmin]}>
                            <Text style={[styles.badgeText, isBaskan && styles.badgeTextAdmin]}>
                                {item.pozisyon}
                            </Text>
                        </View>
                        {item.uyeSayisi > 0 && (
                            <Text style={styles.uyeSayisi}>
                                <Ionicons name="people-outline" size={14} color={COLORS.gray400} /> {item.uyeSayisi}
                            </Text>
                        )}
                    </View>
                    {!isBaskan && <Text style={styles.leaveHint}>Ayrılmak için basılı tutun</Text>}
                    {isBaskan && <Text style={[styles.leaveHint, { color: '#d97706' }]}>Panele gitmek için dokunun</Text>}
                </View>
                {isBaskan ? (
                    <View style={styles.manageIcon}>
                        <Ionicons name="shield-checkmark" size={20} color="#d97706" />
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.leaveButton}
                        onPress={() => handleLeaveKulup(item)}
                    >
                        <Ionicons name="exit-outline" size={18} color="#dc2626" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const renderAvailableKulup = ({ item }) => (
        <View style={styles.availableCard}>
            <View style={styles.availableAvatar}>
                <Text style={styles.availableAvatarText}>{item.ad.charAt(0)}</Text>
            </View>
            <View style={styles.availableContent}>
                <Text style={styles.availableAd}>{item.ad}</Text>
                <Text style={styles.availableAciklama} numberOfLines={1}>{item.aciklama}</Text>
                <Text style={styles.availableUye}>
                    <Ionicons name="people-outline" size={12} color={COLORS.gray400} /> {item.uyeSayisi} üye
                </Text>
            </View>
            <TouchableOpacity style={styles.joinButton} onPress={() => openJoinModal(item)}>
                <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={kulupler}
                renderItem={renderMyKulup}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListHeaderComponent={
                    <>
                        <Text style={styles.sectionTitle}>Üye Olduğum Kulüpler</Text>
                        {kulupler.length === 0 && (
                            <View style={styles.emptyCard}>
                                <Ionicons name="people-outline" size={40} color={COLORS.gray300} />
                                <Text style={styles.emptyText}>Henüz bir kulübe üye değilsiniz</Text>
                            </View>
                        )}
                    </>
                }
                ListFooterComponent={
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: SIZES.xl }]}>Kulüplere Katıl</Text>
                        {aktifKulupler.map((kulup) => (
                            <View key={kulup.id}>
                                {renderAvailableKulup({ item: kulup })}
                            </View>
                        ))}
                    </>
                }
            />

            {/* Kulübe Katıl Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={joinModalVisible}
                onRequestClose={() => setJoinModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Kulübe Katıl</Text>
                            <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        {selectedKulup && (
                            <View style={styles.selectedKulupInfo}>
                                <View style={styles.modalAvatar}>
                                    <Text style={styles.modalAvatarText}>{selectedKulup.ad.charAt(0)}</Text>
                                </View>
                                <Text style={styles.selectedKulupName}>{selectedKulup.ad}</Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Öğrenci Numarası *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 20210001"
                                value={ogrenciNo}
                                onChangeText={setOgrenciNo}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Telefon (Opsiyonel)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="05xx xxx xx xx"
                                value={telefon}
                                onChangeText={setTelefon}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleJoinKulup}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                            <Text style={styles.submitButtonText}>Katılım Talebi Gönder</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Kulüp Oluştur Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yeni Kulüp Oluştur</Text>
                            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#0ea5e9" />
                            <Text style={styles.infoText}>
                                Kulübünüz admin onayından sonra aktif olacaktır.
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Kulüp Adı *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Yazılım Kulübü"
                                value={kulupAd}
                                onChangeText={setKulupAd}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Açıklama *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Kulübünüzü kısaca tanıtın..."
                                value={kulupAciklama}
                                onChangeText={setKulupAciklama}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.aiButton, (!kulupAd.trim() || isGeneratingAi) && styles.aiButtonDisabled]}
                            onPress={generateAiDescription}
                            disabled={isGeneratingAi || !kulupAd.trim()}
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

                        <TouchableOpacity
                            style={[styles.submitButton, isCreating && styles.submitButtonDisabled]}
                            onPress={handleCreateKulup}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons name="add-circle" size={20} color={COLORS.white} />
                                    <Text style={styles.submitButtonText}>Kulüp Oluştur</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Kulüp Oluştur FAB Butonu - Sadece Başkan Olmayanlar Görebilir */}
            {!isUserBaskan && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setCreateModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color={COLORS.white} />
                </TouchableOpacity>
            )}
        </View>
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
    loadingText: {
        marginTop: SIZES.md,
        color: COLORS.gray500,
        fontSize: SIZES.fontMd,
    },
    listContent: {
        padding: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.text,
        marginBottom: SIZES.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        ...SHADOWS.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: SIZES.fontXl,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    cardContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    kulupAd: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
        marginBottom: SIZES.xs,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.md,
    },
    badge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusSm,
    },
    badgeAdmin: {
        backgroundColor: '#fef3c7',
    },
    badgeText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.medium,
        color: COLORS.primary,
    },
    badgeTextAdmin: {
        color: '#d97706',
    },
    uyeSayisi: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray400,
    },
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.xxl,
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    emptyText: {
        fontSize: SIZES.fontMd,
        color: COLORS.gray400,
        marginTop: SIZES.md,
    },
    availableCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginBottom: SIZES.sm,
        ...SHADOWS.sm,
    },
    availableAvatar: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    availableAvatarText: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.gray500,
    },
    availableContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    availableAd: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    availableAciklama: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    availableUye: {
        fontSize: SIZES.fontXs,
        color: COLORS.gray400,
        marginTop: 4,
    },
    joinButton: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radiusXxl,
        borderTopRightRadius: SIZES.radiusXxl,
        padding: SIZES.xxl,
        paddingBottom: SIZES.xxxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    modalTitle: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    selectedKulupInfo: {
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    modalAvatar: {
        width: 64,
        height: 64,
        borderRadius: SIZES.radiusLg,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    modalAvatarText: {
        fontSize: SIZES.fontXxxl,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    selectedKulupName: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    inputGroup: {
        marginBottom: SIZES.lg,
    },
    inputLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.gray600,
        marginBottom: SIZES.sm,
    },
    input: {
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.lg,
        gap: SIZES.sm,
        ...SHADOWS.primary,
    },
    submitButtonText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    manageIcon: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: SIZES.lg,
        bottom: SIZES.xxl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.primary,
        elevation: 8,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginBottom: SIZES.lg,
        gap: SIZES.sm,
    },
    infoText: {
        flex: 1,
        fontSize: SIZES.fontSm,
        color: '#0ea5e9',
    },
    textArea: {
        minHeight: 100,
        paddingTop: SIZES.md,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray400,
    },
    leaveHint: {
        fontSize: SIZES.fontXs,
        color: COLORS.gray400,
        marginTop: SIZES.xs,
    },
    leaveButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: SIZES.md,
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
