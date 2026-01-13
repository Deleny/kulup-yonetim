import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

export default function BaskanPanelScreen({ navigation, route }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [kulup, setKulup] = useState(null);
    const [stats, setStats] = useState({
        uyeSayisi: 0,
        bekleyenTalep: 0,
        aktifEtkinlik: 0,
        bekleyenGorev: 0,
        odenmemisAidat: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Demo data
            setKulup({
                id: 1,
                ad: 'Yazilim Kulubu',
                aciklama: 'Yazilim gelistirme ve teknoloji kulubu',
            });
            setStats({
                uyeSayisi: 45,
                bekleyenTalep: 3,
                aktifEtkinlik: 2,
                bekleyenGorev: 8,
                odenmemisAidat: 12,
            });
        } catch (error) {
            Alert.alert('Hata', 'Veriler yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    };

    const QuickAction = ({ icon, title, count, color, onPress, badge }) => (
        <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
                {badge > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.actionTitle}>{title}</Text>
            {count !== undefined && <Text style={styles.actionCount}>{count}</Text>}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Kulup Header */}
            <View style={styles.header}>
                <View style={styles.kulupAvatar}>
                    <Text style={styles.kulupAvatarText}>{kulup?.ad?.charAt(0) || 'K'}</Text>
                </View>
                <Text style={styles.kulupAd}>{kulup?.ad}</Text>
                <Text style={styles.kulupAciklama}>{kulup?.aciklama}</Text>
                <View style={styles.rolBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#d97706" />
                    <Text style={styles.rolText}>Kulup Baskani</Text>
                </View>
            </View>

            {/* Istatistikler */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.uyeSayisi}</Text>
                    <Text style={styles.statLabel}>Uye</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.aktifEtkinlik}</Text>
                    <Text style={styles.statLabel}>Etkinlik</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, stats.bekleyenTalep > 0 && { color: COLORS.warning }]}>
                        {stats.bekleyenTalep}
                    </Text>
                    <Text style={styles.statLabel}>Bekleyen</Text>
                </View>
            </View>

            {/* Hizli Islemler */}
            <Text style={styles.sectionTitle}>Yonetim</Text>
            <View style={styles.actionsGrid}>
                <QuickAction
                    icon="people"
                    title="Uyeler"
                    count={stats.uyeSayisi}
                    color={COLORS.primary}
                    badge={stats.bekleyenTalep}
                    onPress={() => navigation.navigate('UyeYonetim')}
                />
                <QuickAction
                    icon="calendar"
                    title="Etkinlikler"
                    count={stats.aktifEtkinlik}
                    color="#10b981"
                    onPress={() => navigation.navigate('EtkinlikYonetim')}
                />
                <QuickAction
                    icon="checkbox"
                    title="Gorevler"
                    count={stats.bekleyenGorev}
                    color="#f59e0b"
                    onPress={() => navigation.navigate('GorevYonetim')}
                />
                <QuickAction
                    icon="wallet"
                    title="Aidatlar"
                    count={stats.odenmemisAidat}
                    color="#dc2626"
                    badge={stats.odenmemisAidat}
                    onPress={() => navigation.navigate('AidatYonetim')}
                />
            </View>

            {/* Son Aktiviteler */}
            <Text style={styles.sectionTitle}>Son Islemler</Text>
            <View style={styles.activityCard}>
                <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: '#dcfce7' }]}>
                        <Ionicons name="person-add" size={16} color="#16a34a" />
                    </View>
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>Ahmet Yilmaz uyelik talebi gonderdi</Text>
                        <Text style={styles.activityTime}>2 saat once</Text>
                    </View>
                </View>
                <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: '#dbeafe' }]}>
                        <Ionicons name="calendar" size={16} color="#2563eb" />
                    </View>
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>Yeni etkinlik olusturuldu</Text>
                        <Text style={styles.activityTime}>1 gun once</Text>
                    </View>
                </View>
                <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: '#fef3c7' }]}>
                        <Ionicons name="cash" size={16} color="#d97706" />
                    </View>
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>Mehmet Kaya aidat odedi</Text>
                        <Text style={styles.activityTime}>2 gun once</Text>
                    </View>
                </View>
            </View>

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
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.primary,
        marginBottom: SIZES.md,
    },
    kulupAvatarText: {
        fontSize: 32,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    kulupAd: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    kulupAciklama: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginTop: SIZES.xs,
    },
    rolBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
        marginTop: SIZES.md,
        gap: SIZES.xs,
    },
    rolText: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: '#d97706',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        margin: SIZES.lg,
        padding: SIZES.lg,
        ...SHADOWS.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    statLabel: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.gray200,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.text,
        marginHorizontal: SIZES.lg,
        marginTop: SIZES.lg,
        marginBottom: SIZES.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.md,
        gap: SIZES.md,
    },
    quickAction: {
        width: '47%',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.error,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    actionTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    actionCount: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    activityCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        marginHorizontal: SIZES.lg,
        ...SHADOWS.sm,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    activityText: {
        fontSize: SIZES.fontMd,
        color: COLORS.text,
    },
    activityTime: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});
