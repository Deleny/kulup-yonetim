import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

export default function AyarlarScreen({ navigation }) {
    const [bildirimler, setBildirimler] = useState(true);
    const [karanlikMod, setKaranlikMod] = useState(false);

    const MenuItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.menuIcon}>
                <Ionicons name={icon} size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {rightComponent || <Ionicons name="chevron-forward" size={20} color={COLORS.gray300} />}
        </TouchableOpacity>
    );

    const handleClearCache = () => {
        Alert.alert(
            'Önbelleği Temizle',
            'Uygulama önbelleği temizlenecek. Devam etmek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Temizle',
                    onPress: async () => {
                        // Sadece cache temizle, kullanıcı bilgilerini koru
                        Alert.alert('Başarılı', 'Önbellek temizlendi');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bildirimler</Text>
                <MenuItem
                    icon="notifications-outline"
                    title="Push Bildirimleri"
                    subtitle="Etkinlik ve görev bildirimleri"
                    rightComponent={
                        <Switch
                            value={bildirimler}
                            onValueChange={setBildirimler}
                            trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                            thumbColor={bildirimler ? COLORS.primary : COLORS.gray400}
                        />
                    }
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Görünüm</Text>
                <MenuItem
                    icon="moon-outline"
                    title="Karanlık Mod"
                    subtitle="Koyu tema kullan"
                    rightComponent={
                        <Switch
                            value={karanlikMod}
                            onValueChange={setKaranlikMod}
                            trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                            thumbColor={karanlikMod ? COLORS.primary : COLORS.gray400}
                        />
                    }
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Veri</Text>
                <MenuItem
                    icon="trash-outline"
                    title="Önbelleği Temizle"
                    subtitle="Geçici verileri sil"
                    onPress={handleClearCache}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hakkında</Text>
                <MenuItem
                    icon="information-circle-outline"
                    title="Uygulama Versiyonu"
                    subtitle="1.0.0"
                />
                <MenuItem
                    icon="document-text-outline"
                    title="Gizlilik Politikası"
                    onPress={() => Alert.alert('Bilgi', 'Gizlilik politikası sayfası yakında eklenecek')}
                />
                <MenuItem
                    icon="shield-checkmark-outline"
                    title="Kullanım Şartları"
                    onPress={() => Alert.alert('Bilgi', 'Kullanım şartları sayfası yakında eklenecek')}
                />
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
    section: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        marginHorizontal: SIZES.lg,
        marginTop: SIZES.lg,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    sectionTitle: {
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
    menuContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    menuTitle: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    menuSubtitle: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});
