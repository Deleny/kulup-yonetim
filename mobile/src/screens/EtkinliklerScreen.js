import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EtkinliklerScreen() {
    const [etkinlikler, setEtkinlikler] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEtkinlik, setSelectedEtkinlik] = useState(null);
    const [isBaskan, setIsBaskan] = useState(false);
    const [kulupId, setKulupId] = useState(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        baslik: '',
        aciklama: '',
        tarih: '',
        saat: '',
        konum: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateMode, setDateMode] = useState('date');
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadEtkinlikler();
        checkBaskanStatus();
    }, []);

    const loadEtkinlikler = async () => {
        try {
            const response = await api.get('/api/etkinlikler');
            const data = response.data.map(e => ({
                id: e.id,
                baslik: e.baslik,
                aciklama: e.aciklama || '',
                kulup: e.kulup?.ad || 'Bilinmiyor',
                tarih: formatTarih(e.tarih),
                saat: e.saat || '00:00',
                konum: e.konum || 'Belirtilmedi',
                durum: e.durum || 'PLANLANDI'
            }));
            setEtkinlikler(data);
        } catch (error) {
            console.log('API hatası:', error.message);
            Alert.alert('Bağlantı Hatası', 'Etkinlikler yüklenemedi. Backend bağlantısını kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const checkBaskanStatus = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const response = await api.get(`/api/user/${userId}/baskan-kulup`);
            if (response.data.baskan) {
                setIsBaskan(true);
                setKulupId(response.data.kulupId);
            }
        } catch (error) {
            console.log('Başkan kontrolü hatası:', error.message);
        }
    };

    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            if (dateMode === 'date') {
                const formatted = date.toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, tarih: formatted }));
            } else {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                setFormData(prev => ({ ...prev, saat: `${hours}:${minutes}` }));
            }
        }
    };

    const handleCreateEtkinlik = async () => {
        if (!formData.baslik.trim()) {
            Alert.alert('Hata', 'Etkinlik başlığı gereklidir');
            return;
        }
        if (!formData.tarih) {
            Alert.alert('Hata', 'Tarih seçiniz');
            return;
        }

        try {
            await api.post('/api/baskan/etkinlik-ekle', {
                kulupId: kulupId,
                baslik: formData.baslik.trim(),
                aciklama: formData.aciklama.trim(),
                tarih: formData.tarih,
                saat: formData.saat || '00:00',
                konum: formData.konum.trim() || 'Belirtilmedi',
            });

            Alert.alert('Başarılı', 'Etkinlik oluşturuldu!');
            closeCreateModal();
            setFormData({ baslik: '', aciklama: '', tarih: '', saat: '', konum: '' });
            loadEtkinlikler();
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.error || 'Etkinlik oluşturulamadı');
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadEtkinlikler().finally(() => setRefreshing(false));
    }, []);

    const getDurumStyle = (durum) => {
        switch (durum) {
            case 'YAKIN':
                return { bg: '#fef3c7', color: '#d97706' };
            case 'DEVAM_EDIYOR':
                return { bg: '#dcfce7', color: '#16a34a' };
            default:
                return { bg: COLORS.gray100, color: COLORS.gray500 };
        }
    };

    const openEtkinlikDetail = (etkinlik) => {
        setSelectedEtkinlik(etkinlik);
        setModalVisible(true);
    };

    const closeCreateModal = () => {
        setCreateModalVisible(false);
        setShowDatePicker(false);
    };

    const handleIlgiGoster = () => {
        Alert.alert('Başarılı', `"${selectedEtkinlik?.baslik}" etkinliğine ilgi gösterdiniz!`);
        setModalVisible(false);
    };

    const renderEtkinlik = ({ item }) => {
        const durumStyle = getDurumStyle(item.durum);
        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => openEtkinlikDetail(item)}>
                <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{item.tarih.split(' ')[0]}</Text>
                    <Text style={styles.dateMonth}>{item.tarih.split(' ')[1]}</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.baslik}>{item.baslik}</Text>
                    <View style={[styles.durumBadge, { backgroundColor: durumStyle.bg }]}>
                        <Text style={[styles.durumText, { color: durumStyle.color }]}>{item.durum}</Text>
                    </View>
                    <View style={styles.kulupBadge}>
                        <Text style={styles.kulupText}>{item.kulup}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={14} color={COLORS.gray400} />
                            <Text style={styles.infoText}>{item.saat}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={14} color={COLORS.gray400} />
                            <Text style={styles.infoText}>{item.konum}</Text>
                        </View>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray300} />
            </TouchableOpacity>
        );
    };

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
                data={etkinlikler}
                renderItem={renderEtkinlik}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>Yaklaşan etkinlik yok</Text>
                    </View>
                }
            />

            {/* Etkinlik Detay Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Etkinlik Detayı</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        {selectedEtkinlik && (
                            <>
                                <View style={styles.modalDateBox}>
                                    <Text style={styles.modalDateDay}>{selectedEtkinlik.tarih.split(' ')[0]}</Text>
                                    <Text style={styles.modalDateMonth}>{selectedEtkinlik.tarih.split(' ')[1]}</Text>
                                </View>

                                <Text style={styles.modalEtkinlikTitle}>{selectedEtkinlik.baslik}</Text>

                                <View style={styles.modalKulupBadge}>
                                    <Ionicons name="people" size={14} color={COLORS.primary} />
                                    <Text style={styles.modalKulupText}>{selectedEtkinlik.kulup}</Text>
                                </View>

                                <View style={styles.modalInfoRow}>
                                    <View style={styles.modalInfoItem}>
                                        <Ionicons name="time-outline" size={18} color={COLORS.gray500} />
                                        <Text style={styles.modalInfoText}>{selectedEtkinlik.saat}</Text>
                                    </View>
                                    <View style={styles.modalInfoItem}>
                                        <Ionicons name="location-outline" size={18} color={COLORS.gray500} />
                                        <Text style={styles.modalInfoText}>{selectedEtkinlik.konum}</Text>
                                    </View>
                                </View>

                                {selectedEtkinlik.aciklama ? (
                                    <View style={styles.modalAciklama}>
                                        <Text style={styles.modalAciklamaTitle}>Açıklama</Text>
                                        <Text style={styles.modalAciklamaText}>{selectedEtkinlik.aciklama}</Text>
                                    </View>
                                ) : null}

                                <TouchableOpacity style={styles.ilgiButton} onPress={handleIlgiGoster}>
                                    <Ionicons name="heart" size={20} color={COLORS.white} />
                                    <Text style={styles.ilgiButtonText}>İlgi Göster</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Etkinlik Oluştur Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={closeCreateModal}
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
                            <Text style={styles.modalTitle}>Yeni Etkinlik</Text>
                            <TouchableOpacity onPress={closeCreateModal}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Etkinlik Adı *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Yazılım Semineri"
                                value={formData.baslik}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, baslik: text }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Açıklama</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Etkinlik hakkında bilgi..."
                                value={formData.aciklama}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, aciklama: text }))}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Tarih *</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => { setDateMode('date'); setShowDatePicker(true); }}
                                >
                                    <Text style={{ color: formData.tarih ? COLORS.text : COLORS.gray400 }}>
                                        {formData.tarih || 'Tarih Seç'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: SIZES.md }]}>
                                <Text style={styles.inputLabel}>Saat</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => { setDateMode('time'); setShowDatePicker(true); }}
                                >
                                    <Text style={{ color: formData.saat ? COLORS.text : COLORS.gray400 }}>
                                        {formData.saat || 'Saat Seç'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showDatePicker && (
                            <View style={styles.datePickerWrapper}>
                                <DateTimePicker
                                    value={selectedDate}
                                    mode={dateMode}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    textColor={Platform.OS === 'ios' ? COLORS.text : undefined}
                                    onChange={handleDateChange}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Konum</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Konferans Salonu"
                                value={formData.konum}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, konum: text }))}
                            />
                        </View>

                        <TouchableOpacity style={styles.createButton} onPress={handleCreateEtkinlik}>
                            <Ionicons name="add-circle" size={20} color={COLORS.white} />
                            <Text style={styles.createButtonText}>Etkinlik Oluştur</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
            </Modal>

            {/* FAB - Sadece Başkanlar için */}
            {isBaskan && (
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
    },
    listContent: {
        padding: SIZES.lg,
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
    dateBox: {
        width: 56,
        height: 56,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateDay: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    dateMonth: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.medium,
        color: COLORS.white,
        textTransform: 'uppercase',
    },
    cardContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    baslik: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
        marginBottom: SIZES.xs,
    },
    durumBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SIZES.sm,
        paddingVertical: 2,
        borderRadius: SIZES.radiusSm,
        marginBottom: SIZES.xs,
    },
    durumText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.semibold,
    },
    kulupBadge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusSm,
        marginBottom: SIZES.sm,
    },
    kulupText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.medium,
        color: COLORS.primary,
    },
    infoRow: {
        flexDirection: 'row',
        gap: SIZES.lg,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.xs,
    },
    infoText: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
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
        alignItems: 'center',
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
        width: '100%',
        marginBottom: SIZES.xl,
    },
    modalTitle: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    modalDateBox: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radiusLg,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    modalDateDay: {
        fontSize: 32,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    modalDateMonth: {
        fontSize: SIZES.fontSm,
        color: COLORS.white,
        textTransform: 'uppercase',
    },
    modalEtkinlikTitle: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SIZES.md,
    },
    modalKulupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        marginBottom: SIZES.lg,
        gap: SIZES.xs,
    },
    modalKulupText: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.medium,
        color: COLORS.primary,
    },
    modalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SIZES.xxl,
        marginBottom: SIZES.lg,
    },
    modalInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.sm,
    },
    modalInfoText: {
        fontSize: SIZES.fontMd,
        color: COLORS.gray600,
    },
    modalAciklama: {
        width: '100%',
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    modalAciklamaTitle: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.gray500,
        marginBottom: SIZES.sm,
    },
    modalAciklamaText: {
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        lineHeight: 22,
    },
    ilgiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ec4899',
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.lg,
        paddingHorizontal: SIZES.xxl,
        gap: SIZES.sm,
        width: '100%',
    },
    ilgiButtonText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    inputGroup: {
        marginBottom: SIZES.md,
        width: '100%',
    },
    inputLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.gray600,
        marginBottom: SIZES.xs,
    },
    input: {
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.md,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputRow: {
        flexDirection: 'row',
        width: '100%',
    },
    datePickerWrapper: {
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        paddingVertical: SIZES.sm,
        marginBottom: SIZES.md,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.lg,
        gap: SIZES.sm,
        width: '100%',
        marginTop: SIZES.md,
        ...SHADOWS.primary,
    },
    createButtonText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.bold,
        color: COLORS.white,
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
});
