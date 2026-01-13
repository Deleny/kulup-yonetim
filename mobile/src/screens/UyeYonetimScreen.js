import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UyeYonetimScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('uyeler');
    const [uyeler, setUyeler] = useState([]);
    const [talepler, setTalepler] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const kulupId = await AsyncStorage.getItem('baskanKulupId');
            if (!kulupId) {
                Alert.alert('Hata', 'Kulüp bilgisi bulunamadı');
                return;
            }

            // Üyeleri API'den çek
            const response = await api.get(`/api/kulup/${kulupId}/uyeler`);
            const uyeData = response.data.map(u => ({
                id: u.id,
                adSoyad: u.user?.adSoyad || 'Bilinmiyor',
                email: u.user?.email || '',
                pozisyon: u.pozisyon || 'Uye',
                katilimTarihi: u.kayitTarihi
            }));
            setUyeler(uyeData);
            // Talepler için ayrı endpoint gerekebilir, şimdilik boş
            setTalepler([]);
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

    const handleApprove = (talep) => {
        Alert.alert(
            'Onayla',
            `${talep.adSoyad} uyelik talebini onaylamak istiyor musunuz?`,
            [
                { text: 'Iptal', style: 'cancel' },
                {
                    text: 'Onayla', onPress: () => {
                        setTalepler(prev => prev.filter(t => t.id !== talep.id));
                        Alert.alert('Basarili', 'Uyelik talebi onaylandi');
                    }
                },
            ]
        );
    };

    const handleReject = (talep) => {
        Alert.alert(
            'Reddet',
            `${talep.adSoyad} uyelik talebini reddetmek istiyor musunuz?`,
            [
                { text: 'Iptal', style: 'cancel' },
                {
                    text: 'Reddet', style: 'destructive', onPress: () => {
                        setTalepler(prev => prev.filter(t => t.id !== talep.id));
                        Alert.alert('Bilgi', 'Uyelik talebi reddedildi');
                    }
                },
            ]
        );
    };

    const handleRemoveUye = (uye) => {
        Alert.alert(
            'Uyeyi Cikar',
            `${uye.adSoyad} kulupten cikarilsin mi?`,
            [
                { text: 'Iptal', style: 'cancel' },
                {
                    text: 'Cikar', style: 'destructive', onPress: () => {
                        setUyeler(prev => prev.filter(u => u.id !== uye.id));
                    }
                },
            ]
        );
    };

    const handleChangePozisyon = (uye) => {
        Alert.alert(
            'Pozisyon Değiştir',
            `${uye.adSoyad} için yeni pozisyon seçin:`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Üye', onPress: () => {
                        setUyeler(prev => prev.map(u =>
                            u.id === uye.id ? { ...u, pozisyon: 'Uye' } : u
                        ));
                    }
                },
                {
                    text: 'Yönetici', onPress: () => {
                        setUyeler(prev => prev.map(u =>
                            u.id === uye.id ? { ...u, pozisyon: 'Yonetici' } : u
                        ));
                    }
                },
            ]
        );
    };

    const renderUye = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.adSoyad.charAt(0)}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.name}>{item.adSoyad}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.infoRow}>
                    <View style={[styles.badge, item.pozisyon === 'Yonetici' && styles.badgeAdmin]}>
                        <Text style={[styles.badgeText, item.pozisyon === 'Yonetici' && styles.badgeTextAdmin]}>
                            {item.pozisyon}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleChangePozisyon(item)}>
                    <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveUye(item)}>
                    <Ionicons name="close" size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTalep = ({ item }) => (
        <View style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: COLORS.warning }]}>
                <Text style={styles.avatarText}>{item.adSoyad.charAt(0)}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.name}>{item.adSoyad}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.ogrenciNo}>No: {item.ogrenciNo}</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item)}>
                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item)}>
                    <Ionicons name="close" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'uyeler' && styles.tabActive]}
                    onPress={() => setActiveTab('uyeler')}
                >
                    <Text style={[styles.tabText, activeTab === 'uyeler' && styles.tabTextActive]}>
                        Uyeler ({uyeler.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'talepler' && styles.tabActive]}
                    onPress={() => setActiveTab('talepler')}
                >
                    <Text style={[styles.tabText, activeTab === 'talepler' && styles.tabTextActive]}>
                        Talepler ({talepler.length})
                    </Text>
                    {talepler.length > 0 && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>{talepler.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeTab === 'uyeler' ? uyeler : talepler}
                renderItem={activeTab === 'uyeler' ? renderUye : renderTalep}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>
                            {activeTab === 'uyeler' ? 'Henuz uye yok' : 'Bekleyen talep yok'}
                        </Text>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SIZES.sm,
        paddingTop: Platform.OS === 'ios' ? SIZES.lg : SIZES.sm,
        ...SHADOWS.sm,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusMd,
        gap: SIZES.xs,
    },
    tabActive: {
        backgroundColor: COLORS.primaryLight,
    },
    tabText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.medium,
        color: COLORS.gray500,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: FONTS.semibold,
    },
    tabBadge: {
        backgroundColor: COLORS.error,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 2,
        borderRadius: SIZES.radiusFull,
    },
    tabBadgeText: {
        fontSize: 11,
        fontWeight: FONTS.bold,
        color: COLORS.white,
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
        ...SHADOWS.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: SIZES.fontXl,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    cardContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    name: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    email: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    ogrenciNo: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        marginTop: SIZES.xs,
    },
    badge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 2,
        borderRadius: SIZES.radiusSm,
    },
    badgeAdmin: {
        backgroundColor: '#fef3c7',
    },
    badgeText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.medium,
        color: COLORS.primary,
    },
    badgeTextAdmin: {
        color: '#d97706',
    },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.errorLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: SIZES.sm,
    },
    approveButton: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        backgroundColor: '#16a34a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButton: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SIZES.xxxl,
    },
    emptyText: {
        fontSize: SIZES.fontMd,
        color: COLORS.gray400,
        marginTop: SIZES.md,
    },
});
