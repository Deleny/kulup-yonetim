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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';

export default function EtkinliklerScreen() {
    const [etkinlikler, setEtkinlikler] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEtkinlik, setSelectedEtkinlik] = useState(null);

    useEffect(() => {
        loadEtkinlikler();
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
});
