import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

export default function GorevlerimScreen() {
    const [gorevler, setGorevler] = useState([
        { id: 1, baslik: 'Sunum Hazırla', aciklama: 'Workshop için tanıtım sunumu hazırla', sonTarih: '14 Ocak', durum: 'BEKLIYOR', kulup: 'Yazılım Kulübü' },
        { id: 2, baslik: 'Poster Tasarımı', aciklama: 'Konser için afiş tasarımı', sonTarih: '18 Ocak', durum: 'DEVAM_EDIYOR', kulup: 'Müzik Kulübü' },
        { id: 3, baslik: 'Mekan Rezervasyonu', aciklama: 'Hackathon için salon rezervasyonu yap', sonTarih: '20 Ocak', durum: 'TAMAMLANDI', kulup: 'Yazılım Kulübü' },
    ]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
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

    const updateDurum = (id, yeniDurum) => {
        setGorevler(prev => prev.map(g => g.id === id ? { ...g, durum: yeniDurum } : g));
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
});
