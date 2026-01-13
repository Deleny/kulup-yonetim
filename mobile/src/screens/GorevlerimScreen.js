import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GorevlerimScreen() {
    const [gorevler, setGorevler] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [kulupUyeleri, setKulupUyeleri] = useState([]);
    const [formData, setFormData] = useState({
        baslik: '',
        aciklama: '',
        sonTarih: '',
        hedefUye: null,
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadGorevler();
    }, []);

    const loadGorevler = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId') || '1';
            // Yeni endpoint: userId ile TÜM görevleri çek
            const response = await api.get(`/api/user/${userId}/gorevler`);
            const data = response.data.map(g => ({
                id: g.id,
                baslik: g.baslik,
                aciklama: g.aciklama || '',
                sonTarih: formatTarih(g.sonTarih),
                durum: mapDurum(g.durum),
                kulup: g.uye?.kulup?.ad || 'Bilinmiyor'
            }));
            setGorevler(data);
        } catch (error) {
            console.log('API hatası:', error.message);
            Alert.alert('Bağlantı Hatası', 'Görevler yüklenemedi. Backend bağlantısını kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const loadKulupUyeleri = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await api.get(`/api/user/${userId}/kulup-uyeleri`);
            setKulupUyeleri(response.data || []);
        } catch (error) {
            console.log('Kulüp üyeleri yüklenemedi:', error.message);
        }
    };

    const formatTarih = (tarihStr) => {
        if (!tarihStr) return 'Belirsiz';
        const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const parts = tarihStr.split('-');
        if (parts.length === 3) {
            const gun = parseInt(parts[2]);
            const ay = aylar[parseInt(parts[1]) - 1];
            return `${gun} ${ay}`;
        }
        return tarihStr;
    };

    const mapDurum = (durum) => {
        const map = {
            'BEKLEMEDE': 'BEKLIYOR',
            'DEVAM': 'DEVAM_EDIYOR',
            'TAMAMLANDI': 'TAMAMLANDI'
        };
        return map[durum] || durum || 'BEKLIYOR';
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadGorevler().finally(() => setRefreshing(false));
    }, []);

    const getDurumConfig = (durum) => {
        switch (durum) {
            case 'BEKLIYOR':
                return { icon: 'time-outline', bg: '#fef3c7', color: '#d97706', text: 'Bekliyor' };
            case 'DEVAM_EDIYOR':
                return { icon: 'play-circle-outline', bg: '#dbeafe', color: '#2563eb', text: 'Devam Ediyor' };
            case 'TAMAMLANDI':
                return { icon: 'checkmark-circle-outline', bg: '#dcfce7', color: '#16a34a', text: 'Tamamlandı' };
            default:
                return { icon: 'help-circle-outline', bg: COLORS.gray100, color: COLORS.gray500, text: durum };
        }
    };

    const updateDurum = async (id, yeniDurum) => {
        setGorevler(prev => prev.map(g => g.id === id ? { ...g, durum: yeniDurum } : g));

        try {
            const backendDurum = {
                'BEKLIYOR': 'BEKLEMEDE',
                'DEVAM_EDIYOR': 'DEVAM',
                'TAMAMLANDI': 'TAMAMLANDI'
            }[yeniDurum];
            await api.post(`/api/gorev/${id}/durum`, { durum: backendDurum });
        } catch (error) {
            console.log('Durum güncelleme hatası:', error.message);
        }
    };

    const handleDurumChange = (gorev) => {
        const options = [
            { text: 'Bekliyor', onPress: () => updateDurum(gorev.id, 'BEKLIYOR') },
            { text: 'Devam Ediyor', onPress: () => updateDurum(gorev.id, 'DEVAM_EDIYOR') },
            { text: 'Tamamlandı', onPress: () => updateDurum(gorev.id, 'TAMAMLANDI') },
            { text: 'İptal', style: 'cancel' },
        ];
        Alert.alert('Görev Durumu', 'Yeni durumu seçin', options);
    };

    const handleOpenModal = async () => {
        await loadKulupUyeleri();
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setShowDatePicker(false);
    };

    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            const formatted = date.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, sonTarih: formatted }));
        }
    };

    const handleCreateGorev = async () => {
        if (!formData.baslik || !formData.hedefUye) {
            Alert.alert('Hata', 'Başlık ve atanacak üye zorunludur');
            return;
        }

        try {
            const userId = await AsyncStorage.getItem('userId');
            await api.post('/api/gorev-ekle', {
                atayanUserId: parseInt(userId),
                hedefUyeId: formData.hedefUye.uyeId,
                baslik: formData.baslik,
                aciklama: formData.aciklama,
                sonTarih: formData.sonTarih || null
            });

            closeModal();
            setFormData({ baslik: '', aciklama: '', sonTarih: '', hedefUye: null });
            Alert.alert('Başarılı', 'Görev oluşturuldu');
            loadGorevler();
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.error || 'Görev oluşturulamadı');
        }
    };

    const renderGorev = ({ item }) => {
        const durumConfig = getDurumConfig(item.durum);
        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={[styles.durumIcon, { backgroundColor: durumConfig.bg }]}
                    onPress={() => handleDurumChange(item)}
                >
                    <Ionicons name={durumConfig.icon} size={24} color={durumConfig.color} />
                </TouchableOpacity>
                <View style={styles.cardContent}>
                    <Text style={[styles.baslik, item.durum === 'TAMAMLANDI' && styles.tamamlandi]}>{item.baslik}</Text>
                    <Text style={styles.aciklama} numberOfLines={2}>{item.aciklama}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.kulupBadge}>
                            <Text style={styles.kulupText}>{item.kulup}</Text>
                        </View>
                        <View style={styles.tarihContainer}>
                            <Ionicons name="calendar-outline" size={12} color={COLORS.gray400} />
                            <Text style={styles.tarihText}>{item.sonTarih}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const bekleyenler = gorevler.filter(g => g.durum !== 'TAMAMLANDI');
    const tamamlananlar = gorevler.filter(g => g.durum === 'TAMAMLANDI');

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={bekleyenler}
                renderItem={renderGorev}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListHeaderComponent={
                    <Text style={styles.sectionTitle}>Aktif Görevler ({bekleyenler.length})</Text>
                }
                ListFooterComponent={
                    tamamlananlar.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: SIZES.xl }]}>
                                Tamamlanan ({tamamlananlar.length})
                            </Text>
                            {tamamlananlar.map(gorev => (
                                <View key={gorev.id}>{renderGorev({ item: gorev })}</View>
                            ))}
                        </>
                    )
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>Aktif görev yok</Text>
                    </View>
                }
            />

            {/* Görev Oluşturma FAB */}
            <TouchableOpacity style={styles.fab} onPress={handleOpenModal}>
                <Ionicons name="add" size={28} color={COLORS.white} />
            </TouchableOpacity>

            {/* Görev Oluşturma Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        style={styles.modalSheet}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                    >
                        <ScrollView
                            contentContainerStyle={styles.modalFormContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Yeni Görev</Text>
                                <TouchableOpacity onPress={closeModal}>
                                    <Ionicons name="close" size={24} color={COLORS.gray500} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Başlık *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Görev başlığı"
                                    placeholderTextColor={COLORS.gray400}
                                    value={formData.baslik}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, baslik: text }))}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Açıklama</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Görev açıklaması"
                                    placeholderTextColor={COLORS.gray400}
                                    value={formData.aciklama}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, aciklama: text }))}
                                    multiline
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Son Tarih</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={{ color: formData.sonTarih ? COLORS.text : COLORS.gray400 }}>
                                        {formData.sonTarih || 'Tarih Seç'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <View style={styles.datePickerWrapper}>
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        textColor={Platform.OS === 'ios' ? COLORS.text : undefined}
                                        onChange={handleDateChange}
                                    />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Atanacak Üye *</Text>
                                {kulupUyeleri.map(kulup => (
                                    <View key={kulup.kulupId} style={styles.kulupSection}>
                                        <Text style={styles.kulupSectionTitle}>{kulup.kulupAd}</Text>
                                        <View style={styles.uyeList}>
                                            {kulup.uyeler?.map(uye => (
                                                <TouchableOpacity
                                                    key={uye.uyeId}
                                                    style={[
                                                        styles.uyeChip,
                                                        formData.hedefUye?.uyeId === uye.uyeId && styles.uyeChipActive
                                                    ]}
                                                    onPress={() => setFormData(prev => ({ ...prev, hedefUye: uye }))}
                                                >
                                                    <Text style={[
                                                        styles.uyeChipText,
                                                        formData.hedefUye?.uyeId === uye.uyeId && styles.uyeChipTextActive
                                                    ]}>
                                                        {uye.adSoyad}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                                {kulupUyeleri.length === 0 && (
                                    <Text style={styles.noDataText}>Henüz bir kulüpte üye değilsiniz</Text>
                                )}
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleCreateGorev}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                                <Text style={styles.submitButtonText}>Görev Oluştur</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
    listContent: {
        padding: SIZES.lg,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.text,
        marginBottom: SIZES.md,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        ...SHADOWS.md,
    },
    durumIcon: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    baslik: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
        marginBottom: SIZES.xs,
    },
    tamamlandi: {
        textDecorationLine: 'line-through',
        color: COLORS.gray400,
    },
    aciklama: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
        marginBottom: SIZES.sm,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.md,
    },
    kulupBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 2,
        borderRadius: SIZES.radiusSm,
    },
    kulupText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.medium,
        color: COLORS.primary,
    },
    tarihContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tarihText: {
        fontSize: SIZES.fontXs,
        color: COLORS.gray400,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SIZES.xxxl,
    },
    emptyText: {
        fontSize: SIZES.fontMd,
        color: COLORS.gray400,
        marginTop: SIZES.lg,
    },
    fab: {
        position: 'absolute',
        bottom: SIZES.xxl,
        right: SIZES.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
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
        maxHeight: '80%',
    },
    modalSheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radiusXxl,
        borderTopRightRadius: SIZES.radiusXxl,
        maxHeight: '90%',
        width: '100%',
    },
    modalFormContent: {
        padding: SIZES.xxl,
        paddingBottom: SIZES.xxxl,
        flexGrow: 1,
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
    datePickerWrapper: {
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        paddingVertical: SIZES.sm,
        marginBottom: SIZES.lg,
    },
    kulupSection: {
        marginBottom: SIZES.md,
    },
    kulupSectionTitle: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.primary,
        marginBottom: SIZES.sm,
    },
    uyeList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.sm,
    },
    uyeChip: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        backgroundColor: COLORS.gray100,
        borderRadius: SIZES.radiusFull,
    },
    uyeChipActive: {
        backgroundColor: COLORS.primary,
    },
    uyeChipText: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray600,
    },
    uyeChipTextActive: {
        color: COLORS.white,
        fontWeight: FONTS.semibold,
    },
    noDataText: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray400,
        fontStyle: 'italic',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.lg,
        gap: SIZES.sm,
        marginTop: SIZES.md,
        ...SHADOWS.primary,
    },
    submitButtonText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
});
