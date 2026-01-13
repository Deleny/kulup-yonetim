import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

export default function EtkinliklerScreen() {
    const [etkinlikler, setEtkinlikler] = useState([
        { id: 1, baslik: 'Yazılım Workshop', kulup: 'Yazılım Kulübü', tarih: '15 Ocak', saat: '14:00', konum: 'A-101', durum: 'YAKIN' },
        { id: 2, baslik: 'Konser Gecesi', kulup: 'Müzik Kulübü', tarih: '20 Ocak', saat: '19:00', konum: 'Amfi Tiyatro', durum: 'YAKIN' },
        { id: 3, baslik: 'Hackathon 2024', kulup: 'Yazılım Kulübü', tarih: '25 Ocak', saat: '09:00', konum: 'Konferans Salonu', durum: 'PLANLANDI' },
        { id: 4, baslik: 'Fotoğraf Sergisi', kulup: 'Fotoğrafçılık', tarih: '30 Ocak', saat: '10:00', konum: 'Galeri', durum: 'PLANLANDI' },
    ]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
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

    const renderEtkinlik = ({ item }) => {
        const durumStyle = getDurumStyle(item.durum);
        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
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
});
