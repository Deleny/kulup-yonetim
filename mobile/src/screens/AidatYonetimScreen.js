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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';

export default function AidatYonetimScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('tum');
    const [aidatlar, setAidatlar] = useState([]);
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
            const data = [
                { id: 1, uye: 'Ali Veli', tutar: 100, donem: '2024 Bahar', odendi: true, odemeTarihi: '2024-02-15' },
                { id: 2, uye: 'Ayse Yilmaz', tutar: 100, donem: '2024 Bahar', odendi: false },
                { id: 3, uye: 'Mehmet Kaya', tutar: 100, donem: '2024 Bahar', odendi: true, odemeTarihi: '2024-02-10' },
                { id: 4, uye: 'Zeynep Demir', tutar: 100, donem: '2024 Bahar', odendi: false },
                { id: 5, uye: 'Can Ozturk', tutar: 100, donem: '2024 Bahar', odendi: false },
            ];
            setAidatlar(data);
            
            const odenen = data.filter(a => a.odendi).reduce((sum, a) => sum + a.tutar, 0);
            const bekleyen = data.filter(a => !a.odendi).reduce((sum, a) => sum + a.tutar, 0);
            setStats({ toplam: data.length * 100, odenen, bekleyen });
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

    const handleCreateAidat = () => {
        if (!formData.tutar || !formData.donem) {
            Alert.alert('Hata', 'Tutar ve donem zorunludur');
            return;
        }
        Alert.alert('Basarili', 'Aidat tum uyelere tanimlandi');
        setModalVisible(false);
        setFormData({ tutar: '', donem: '' });
    };

    const handleMarkPaid = (aidat) => {
        Alert.alert(
            'Odendi Olarak Isaretle',
            `${aidat.uye} icin ${aidat.tutar} TL odeme onaylansın mi?`,
            [
                { text: 'Iptal', style: 'cancel' },
                { text: 'Onayla', onPress: () => {
                    setAidatlar(prev => prev.map(a => 
                        a.id === aidat.id ? { ...a, odendi: true, odemeTarihi: new Date().toISOString().split('T')[0] } : a
                    ));
                }},
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
