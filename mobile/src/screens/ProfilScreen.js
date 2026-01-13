import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

export default function ProfilScreen({ navigation }) {
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

    const MenuItem = ({ icon, title, subtitle, onPress, danger, badge }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
                <Ionicons name={icon} size={22} color={danger ? COLORS.error : COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
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

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Profil Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>KY</Text>
                </View>
                <Text style={styles.userName}>Kullanıcı Adı</Text>
                <Text style={styles.userEmail}>kullanici@email.com</Text>
                <TouchableOpacity style={styles.editButton}>
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
                    <Text style={styles.statValue}>2</Text>
                    <Text style={styles.statLabel}>Kulüp</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                        <Ionicons name="checkbox" size={20} color="#d97706" />
                    </View>
                    <Text style={styles.statValue}>5</Text>
                    <Text style={styles.statLabel}>Görev</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                        <Ionicons name="calendar" size={20} color="#16a34a" />
                    </View>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>Etkinlik</Text>
                </View>
            </View>

            {/* Menü */}
            <View style={styles.menuContainer}>
                <Text style={styles.menuSectionTitle}>Hesap</Text>
                <MenuItem
                    icon="wallet-outline"
                    title="Aidatlarım"
                    subtitle="Aidat durumunu kontrol et"
                    badge="1"
                    onPress={() => navigation.navigate('Aidatlarim')}
                />
                <MenuItem
                    icon="notifications-outline"
                    title="Bildirimler"
                    subtitle="Bildirim ayarlarını yönet"
                />
                <MenuItem
                    icon="settings-outline"
                    title="Ayarlar"
                    subtitle="Uygulama ayarları"
                />
            </View>

            <View style={styles.menuContainer}>
                <Text style={styles.menuSectionTitle}>Destek</Text>
                <MenuItem
                    icon="help-circle-outline"
                    title="Yardım"
                    subtitle="SSS ve destek"
                />
                <MenuItem
                    icon="information-circle-outline"
                    title="Hakkında"
                    subtitle="Uygulama bilgileri"
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});
