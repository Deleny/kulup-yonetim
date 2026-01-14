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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BaskanPanelScreen({ navigation, route }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [kulup, setKulup] = useState(null);
    const [kulupId, setKulupId] = useState(null);
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
            // AsyncStorage'dan başkan kulüp ID'sini al
            const storedKulupId = await AsyncStorage.getItem('baskanKulupId');
            if (!storedKulupId) {
                Alert.alert('Hata', 'Başkan kulüp bilgisi bulunamadı');
                navigation.goBack();
                return;
            }

            const id = parseInt(storedKulupId);
            setKulupId(id);

            // Kulüp bilgisi
            const kulupRes = await api.get(`/api/kulup/${id}`);
            setKulup(kulupRes.data);

            // İstatistikler
            const statsRes = await api.get(`/api/kulup/${id}/istatistikler`);
            const etkinlikRes = await api.get(`/api/kulup/${id}/etkinlikler`);

            setStats({
                uyeSayisi: statsRes.data.toplamUye || 0,
                bekleyenTalep: 0, // Backend'de ayrı endpoint gerekebilir
                aktifEtkinlik: etkinlikRes.data?.length || 0,
                bekleyenGorev: statsRes.data.bekleyenGorev || 0,
                odenmemisAidat: statsRes.data.bekleyenAidat || 0,
            });
        } catch (error) {
            console.log('Veri yükleme hatası:', error.message);
            Alert.alert('Hata', 'Veriler yüklenemedi. Backend bağlantısını kontrol edin.');
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
                {/* Geri Butonu */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                    <Text style={styles.backButtonText}>Üye Paneline Dön</Text>
                </TouchableOpacity>

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
    header: {
        alignItems: 'center',
        paddingVertical: SIZES.xxl,
        paddingTop: Platform.OS === 'ios' ? SIZES.xxxl : SIZES.xxl,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: SIZES.radiusXxl,
        borderBottomRightRadius: SIZES.radiusXxl,
        ...SHADOWS.md,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginLeft: SIZES.lg,
        marginBottom: SIZES.md,
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.md,
        backgroundColor: COLORS.primaryLight,
        borderRadius: SIZES.radiusMd,
        gap: SIZES.xs,
    },
    backButtonText: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.primary,
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
        textAlign: 'center',
        paddingHorizontal: SIZES.lg,
    },
    kulupAciklama: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginTop: SIZES.xs,
        textAlign: 'center',
        paddingHorizontal: SIZES.lg,
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
