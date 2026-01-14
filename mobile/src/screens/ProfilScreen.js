import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';

export default function ProfilScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ adSoyad: '', email: '', rol: '' });
    const [stats, setStats] = useState({ kulup: 0, gorev: 0, etkinlik: 0 });
    const [isBaskan, setIsBaskan] = useState(false);
    const [baskanKulupAd, setBaskanKulupAd] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    // Ekran her açıldığında profil bilgilerini yenile
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadProfile();
        });
        return unsubscribe;
    }, [navigation]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');

            if (userId) {
                // Profil bilgilerini çek
                const response = await api.get(`/api/profil/${userId}`);
                const data = response.data;

                setUser({
                    adSoyad: data.adSoyad || 'Kullanıcı',
                    email: data.email || '',
                    rol: data.rol || ''
                });

                setStats({
                    kulup: data.uyelikSayisi ?? 0,
                    gorev: data.gorevSayisi ?? 0,
                    etkinlik: data.etkinlikSayisi ?? 0
                });

                await AsyncStorage.setItem('adSoyad', data.adSoyad);
                await AsyncStorage.setItem('userEmail', data.email);

                // Backend'den başkanlık durumunu TAZE olarak kontrol et
                try {
                    const baskanRes = await api.get(`/api/user/${userId}/baskan-kulup`);
                    if (baskanRes.data.baskan === true) {
                        setIsBaskan(true);
                        setBaskanKulupAd(baskanRes.data.kulupAd || '');
                        await AsyncStorage.setItem('baskanKulupId', baskanRes.data.kulupId.toString());
                        await AsyncStorage.setItem('baskanKulupAd', baskanRes.data.kulupAd || '');
                    } else {
                        // Başkan DEĞİL - temizle
                        setIsBaskan(false);
                        setBaskanKulupAd('');
                        await AsyncStorage.removeItem('baskanKulupId');
                        await AsyncStorage.removeItem('baskanKulupAd');
                    }
                } catch (e) {
                    // API hatası - başkan değil kabul et
                    setIsBaskan(false);
                    setBaskanKulupAd('');
                }
            }
        } catch (error) {
            console.log('Profil yükleme hatası:', error.message);
            const adSoyad = await AsyncStorage.getItem('adSoyad') || 'Kullanıcı';
            const email = await AsyncStorage.getItem('userEmail') || '';
            setUser({ adSoyad, email, rol: '' });
            setIsBaskan(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    };

    const MenuItem = ({ icon, title, subtitle, onPress, danger, badge, highlight }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[
                styles.menuIcon,
                danger && styles.menuIconDanger,
                highlight && styles.menuIconHighlight
            ]}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={danger ? COLORS.error : highlight ? '#d97706' : COLORS.primary}
                />
            </View>
            <View style={styles.menuContent}>
                <Text style={[
                    styles.menuTitle,
                    danger && styles.menuTitleDanger,
                    highlight && styles.menuTitleHighlight
                ]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {badge && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray300} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const initials = user.adSoyad.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase() || 'KY';

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profil Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{user.adSoyad}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {isBaskan && (
                        <View style={styles.baskanBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#d97706" />
                            <Text style={styles.baskanBadgeText}>Kulüp Başkanı</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('ProfilDuzenle')}
                    >
                        <Ionicons name="pencil" size={16} color={COLORS.primary} />
                        <Text style={styles.editButtonText}>Profili Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {/* İstatistikler */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: COLORS.primaryLight }]}>
                            <Ionicons name="people" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.statValue}>{stats.kulup}</Text>
                        <Text style={styles.statLabel}>Kulüp</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                            <Ionicons name="checkbox" size={20} color="#d97706" />
                        </View>
                        <Text style={styles.statValue}>{stats.gorev}</Text>
                        <Text style={styles.statLabel}>Görev</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                            <Ionicons name="calendar" size={20} color="#16a34a" />
                        </View>
                        <Text style={styles.statValue}>{stats.etkinlik}</Text>
                        <Text style={styles.statLabel}>Etkinlik</Text>
                    </View>
                </View>

                {/* Başkan Menüsü */}
                {isBaskan && (
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuSectionTitle}>Kulüp Yönetimi</Text>
                        <MenuItem
                            icon="shield-outline"
                            title="Başkan Paneli"
                            subtitle={baskanKulupAd || 'Kulübünüzü yönetin'}
                            onPress={() => navigation.navigate('BaskanMain')}
                            highlight
                        />
                        <MenuItem
                            icon="settings-outline"
                            title="Kulüp Ayarları"
                            subtitle="Kulüp bilgilerini düzenle"
                            onPress={() => navigation.navigate('KulupAyarlari')}
                            highlight
                        />
                    </View>
                )}

                {/* Hesap Menüsü */}
                <View style={styles.menuContainer}>
                    <Text style={styles.menuSectionTitle}>Hesap</Text>
                    <MenuItem
                        icon="wallet-outline"
                        title="Aidatlarım"
                        subtitle="Aidat durumunu kontrol et"
                        onPress={() => navigation.navigate('Aidatlarim')}
                    />
                    <MenuItem
                        icon="notifications-outline"
                        title="Bildirimler"
                        subtitle="Bildirim ayarlarını yönet"
                        onPress={() => navigation.navigate('Ayarlar')}
                    />
                    <MenuItem
                        icon="settings-outline"
                        title="Ayarlar"
                        subtitle="Uygulama ayarları"
                        onPress={() => navigation.navigate('Ayarlar')}
                    />
                </View>

                <View style={styles.menuContainer}>
                    <Text style={styles.menuSectionTitle}>Destek</Text>
                    <MenuItem
                        icon="help-circle-outline"
                        title="Yardım"
                        subtitle="SSS ve destek"
                        onPress={() => Alert.alert('Yardım', 'Destek için: destek@kulubyonetim.com')}
                    />
                    <MenuItem
                        icon="information-circle-outline"
                        title="Hakkında"
                        subtitle="Uygulama bilgileri"
                        onPress={() => Alert.alert('Kulüp Yönetimi', 'Versiyon 1.0.0\n\nKampüs Kulüp Takip Sistemi')}
                    />
                </View>

                <View style={[styles.menuContainer, { marginBottom: SIZES.xxxl }]}>
                    <MenuItem
                        icon="log-out-outline"
                        title="Çıkış Yap"
                        onPress={handleLogout}
                        danger
                    />
                </View>
            </ScrollView>

            {/* AI FAB - Sol Alt */}
            <TouchableOpacity
                style={styles.aiFab}
                onPress={() => navigation.navigate('AiAsistan')}
                activeOpacity={0.8}
            >
                <Ionicons name="sparkles" size={24} color={COLORS.white} />
            </TouchableOpacity>
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
    header: {
        alignItems: 'center',
        paddingVertical: SIZES.xxl,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: SIZES.radiusXxl,
        borderBottomRightRadius: SIZES.radiusXxl,
        ...SHADOWS.md,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: SIZES.radiusXxl,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.primary,
        marginBottom: SIZES.lg,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    userName: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    userEmail: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginTop: SIZES.xs,
    },
    baskanBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
        marginTop: SIZES.md,
        gap: SIZES.xs,
    },
    baskanBadgeText: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: '#d97706',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SIZES.lg,
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
        backgroundColor: COLORS.primaryLight,
        borderRadius: SIZES.radiusFull,
        gap: SIZES.xs,
    },
    editButtonText: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.primary,
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
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    statValue: {
        fontSize: SIZES.fontXl,
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
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    menuSectionTitle: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.gray400,
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconDanger: {
        backgroundColor: COLORS.errorLight,
    },
    menuIconHighlight: {
        backgroundColor: '#fef3c7',
    },
    menuContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    menuTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    menuTitleDanger: {
        color: COLORS.error,
    },
    menuTitleHighlight: {
        color: '#d97706',
    },
    menuSubtitle: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    badgeContainer: {
        backgroundColor: COLORS.error,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 2,
        borderRadius: SIZES.radiusFull,
        marginRight: SIZES.sm,
    },
    badgeText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    aiFab: {
        position: 'absolute',
        left: SIZES.lg,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
