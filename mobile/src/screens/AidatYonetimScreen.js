import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AidatYonetimScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('tum');
    const [aidatlar, setAidatlar] = useState([]);
    const [kulupId, setKulupId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        tutar: '',
        donem: '',
    });
    const [stats, setStats] = useState({
        toplam: 0,
        odenen: 0,
        bekleyen: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const storedKulupId = await AsyncStorage.getItem('baskanKulupId');
            if (!storedKulupId) {
                Alert.alert('Hata', 'Kulüp bilgisi bulunamadı');
                return;
            }
            setKulupId(parseInt(storedKulupId));

            // Üyeleri ve aidatlarını çek
            const uyeRes = await api.get(`/api/kulup/${storedKulupId}/uyeler`);
            let tumAidatlar = [];

            for (const uye of uyeRes.data) {
                try {
                    const aidatRes = await api.get(`/api/uye/${uye.id}/aidatlar`);
                    const aidatData = aidatRes.data.map(a => ({
                        id: a.id,
                        uye: uye.user?.adSoyad || 'Bilinmiyor',
                        tutar: a.tutar || 0,
                        donem: a.donem || '',
                        odendi: a.odendi || false,
                        odemeTarihi: a.odemeTarihi
                    }));
                    tumAidatlar = [...tumAidatlar, ...aidatData];
                } catch (e) { }
            }
            setAidatlar(tumAidatlar);

            const odenen = tumAidatlar.filter(a => a.odendi).reduce((sum, a) => sum + a.tutar, 0);
            const bekleyen = tumAidatlar.filter(a => !a.odendi).reduce((sum, a) => sum + a.tutar, 0);
            setStats({ toplam: odenen + bekleyen, odenen, bekleyen });
        } catch (error) {
            console.log('Veri yükleme hatası:', error.message);
            Alert.alert('Hata', 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    };

    const handleCreateAidat = async () => {
        if (!formData.tutar || !formData.donem) {
            Alert.alert('Hata', 'Tutar ve dönem zorunludur');
            return;
        }

        try {
            // Tüm üyelere aidat tanımla
            const uyeRes = await api.get(`/api/kulup/${kulupId}/uyeler`);
            for (const uye of uyeRes.data) {
                await api.post('/api/baskan/aidat-ekle', {
                    uyeId: uye.id,
                    tutar: formData.tutar,
                    donem: formData.donem
                });
            }
            Alert.alert('Başarılı', 'Aidat tüm üyelere tanımlandı');
            setModalVisible(false);
            setFormData({ tutar: '', donem: '' });
            loadData();
        } catch (error) {
            Alert.alert('Hata', 'Aidat tanımlanamadı');
        }
    };

    const handleMarkPaid = (aidat) => {
        Alert.alert(
            'Ödendi Olarak İşaretle',
            `${aidat.uye} için ${aidat.tutar} TL ödeme onaylansın mı?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Onayla', onPress: async () => {
                        try {
                            await api.put(`/api/aidat/${aidat.id}/odeme`);
                            loadData();
                        } catch (error) {
                            Alert.alert('Hata', 'Ödeme işaretlenemedi');
                        }
                    }
                },
            ]
        );
    };

    const filteredAidatlar = activeTab === 'tum'
        ? aidatlar
        : activeTab === 'odenen'
            ? aidatlar.filter(a => a.odendi)
            : aidatlar.filter(a => !a.odendi);

    const renderAidat = ({ item }) => (
        <View style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: item.odendi ? '#dcfce7' : '#fef3c7' }]}>
                <Text style={[styles.avatarText, { color: item.odendi ? '#16a34a' : '#d97706' }]}>
                    {item.uye.charAt(0)}
                </Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.uyeName}>{item.uye}</Text>
                <Text style={styles.donem}>{item.donem}</Text>
                {item.odendi && (
                    <Text style={styles.odemeTarihi}>
                        <Ionicons name="checkmark-circle" size={12} color="#16a34a" /> {item.odemeTarihi}
                    </Text>
                )}
            </View>
            <View style={styles.rightSection}>
                <Text style={[styles.tutar, { color: item.odendi ? '#16a34a' : '#d97706' }]}>
                    {item.tutar} TL
                </Text>
                {!item.odendi && (
                    <TouchableOpacity style={styles.paidButton} onPress={() => handleMarkPaid(item)}>
                        <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                )}
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
            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.odenen} TL</Text>
                    <Text style={styles.statLabel}>Odenen</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.bekleyen} TL</Text>
                    <Text style={styles.statLabel}>Bekleyen</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {['tum', 'odenen', 'bekleyen'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === 'tum' ? 'Tumu' : tab === 'odenen' ? 'Odenen' : 'Bekleyen'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredAidatlar}
                renderItem={renderAidat}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>Aidat kaydı yok</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={28} color={COLORS.white} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Aidat Tanimla</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalInfo}>
                            Tum uyelere aidat tanimlanacaktir.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tutar (TL) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="100"
                                value={formData.tutar}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, tutar: text }))}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Donem *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2024 Bahar"
                                value={formData.donem}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, donem: text }))}
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleCreateAidat}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                            <Text style={styles.submitButtonText}>Tanimla</Text>
                        </TouchableOpacity>
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
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        margin: SIZES.lg,
        padding: SIZES.lg,
        borderRadius: SIZES.radiusLg,
        ...SHADOWS.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: '#16a34a',
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
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: SIZES.lg,
        backgroundColor: COLORS.gray100,
        borderRadius: SIZES.radiusMd,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: SIZES.sm,
        alignItems: 'center',
        borderRadius: SIZES.radiusSm,
    },
    tabActive: {
        backgroundColor: COLORS.white,
    },
    tabText: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.medium,
        color: COLORS.gray500,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: FONTS.semibold,
    },
    listContent: {
        padding: SIZES.lg,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        marginBottom: SIZES.sm,
        ...SHADOWS.sm,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
    },
    cardContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    uyeName: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    donem: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
    },
    odemeTarihi: {
        fontSize: SIZES.fontXs,
        color: '#16a34a',
        marginTop: 2,
    },
    rightSection: {
        alignItems: 'flex-end',
        gap: SIZES.sm,
    },
    tutar: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
    },
    paidButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#16a34a',
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
    fab: {
        position: 'absolute',
        bottom: SIZES.xxl,
        right: SIZES.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.primary,
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    modalTitle: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    modalInfo: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        backgroundColor: COLORS.primaryLight,
        padding: SIZES.md,
        borderRadius: SIZES.radiusMd,
        marginBottom: SIZES.lg,
    },
    inputGroup: {
        marginBottom: SIZES.lg,
    },
    inputLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: FONTS.semibold,
        color: COLORS.gray600,
        marginBottom: SIZES.sm,
    },
    input: {
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.lg,
        gap: SIZES.sm,
        marginTop: SIZES.md,
        ...SHADOWS.primary,
    },
    submitButtonText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
});
