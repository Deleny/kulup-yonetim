import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

export default function AidatlarimScreen() {
    const [aidatlar, setAidatlar] = useState([
        { id: 1, kulup: 'Yazılım Kulübü', donem: '2024 Bahar', tutar: 100, odendi: true, odemeTarihi: '15 Ocak 2024' },
        { id: 2, kulup: 'Müzik Kulübü', donem: '2024 Bahar', tutar: 150, odendi: false, odemeTarihi: null },
        { id: 3, kulup: 'Yazılım Kulübü', donem: '2023 Güz', tutar: 100, odendi: true, odemeTarihi: '10 Eylül 2023' },
    ]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const toplamBorc = aidatlar.filter(a => !a.odendi).reduce((sum, a) => sum + a.tutar, 0);
    const toplamOdenen = aidatlar.filter(a => a.odendi).reduce((sum, a) => sum + a.tutar, 0);

    const renderAidat = ({ item }) => (
        <View style={styles.card}>
            <View style={[styles.statusIndicator, item.odendi && styles.statusPaid]} />
            <View style={styles.cardContent}>
                <Text style={styles.kulupName}>{item.kulup}</Text>
                <Text style={styles.donem}>{item.donem}</Text>
                {item.odendi && item.odemeTarihi && (
                    <Text style={styles.odemeTarihi}>
                        <Ionicons name="checkmark-circle" size={12} color={COLORS.success} /> {item.odemeTarihi}
                    </Text>
                )}
            </View>
            <View style={styles.tutarContainer}>
                <Text style={[styles.tutar, !item.odendi && styles.tutarUnpaid]}>
                    {item.tutar} ₺
                </Text>
                <View style={[styles.badge, item.odendi ? styles.badgePaid : styles.badgeUnpaid]}>
                    <Text style={[styles.badgeText, item.odendi ? styles.badgeTextPaid : styles.badgeTextUnpaid]}>
                        {item.odendi ? 'Ödendi' : 'Bekliyor'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, styles.summaryCardDanger]}>
                    <Ionicons name="alert-circle" size={24} color="#dc2626" />
                    <View style={styles.summaryContent}>
                        <Text style={styles.summaryLabel}>Bekleyen</Text>
                        <Text style={[styles.summaryValue, { color: '#dc2626' }]}>{toplamBorc} ₺</Text>
                    </View>
                </View>
                <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
                    <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                    <View style={styles.summaryContent}>
                        <Text style={styles.summaryLabel}>Ödenen</Text>
                        <Text style={[styles.summaryValue, { color: '#16a34a' }]}>{toplamOdenen} ₺</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={aidatlar}
                renderItem={renderAidat}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={64} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>Aidat kaydı yok</Text>
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
    summaryContainer: {
        flexDirection: 'row',
        padding: SIZES.lg,
        gap: SIZES.md,
    },
    summaryCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.lg,
        borderRadius: SIZES.radiusLg,
        gap: SIZES.md,
        ...SHADOWS.sm,
    },
    summaryCardDanger: {
        backgroundColor: '#fef2f2',
    },
    summaryCardSuccess: {
        backgroundColor: '#f0fdf4',
    },
    summaryContent: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
    },
    summaryValue: {
        fontSize: SIZES.fontXl,
        fontWeight: FONTS.bold,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.xxl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        ...SHADOWS.sm,
    },
    statusIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        backgroundColor: '#fbbf24',
        marginRight: SIZES.md,
    },
    statusPaid: {
        backgroundColor: '#22c55e',
    },
    cardContent: {
        flex: 1,
    },
    kulupName: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    donem: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    odemeTarihi: {
        fontSize: SIZES.fontXs,
        color: COLORS.success,
        marginTop: 4,
    },
    tutarContainer: {
        alignItems: 'flex-end',
    },
    tutar: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    tutarUnpaid: {
        color: '#dc2626',
    },
    badge: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: 2,
        borderRadius: SIZES.radiusSm,
        marginTop: SIZES.xs,
    },
    badgePaid: {
        backgroundColor: '#dcfce7',
    },
    badgeUnpaid: {
        backgroundColor: '#fef3c7',
    },
    badgeText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.semibold,
    },
    badgeTextPaid: {
        color: '#16a34a',
    },
    badgeTextUnpaid: {
        color: '#d97706',
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
