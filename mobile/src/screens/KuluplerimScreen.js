import React, { useState, useEffect, useCallback } from 'react';
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
import api from '../services/api';

export default function KuluplerimScreen({ navigation }) {
    const [kulupler, setKulupler] = useState([]);
    const [aktifKulupler, setAktifKulupler] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [selectedKulup, setSelectedKulup] = useState(null);
    const [ogrenciNo, setOgrenciNo] = useState('');
    const [telefon, setTelefon] = useState('');

    // Demo data - API hazır olduğunda kaldırılacak
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // API çağrısı - backend hazır olduğunda
            // const response = await api.get('/api/kulupler');
            // setAktifKulupler(response.data);
            
            // Demo data
            setKulupler([
                { id: 1, ad: 'Yazılım Kulübü', pozisyon: 'Üye', uyeSayisi: 45, aciklama: 'Yazılım geliştirme ve teknoloji kulübü' },
                { id: 2, ad: 'Müzik Kulübü', pozisyon: 'Yönetici', uyeSayisi: 32, aciklama: 'Müzik etkinlikleri ve konserler' },
            ]);
            setAktifKulupler([
                { id: 3, ad: 'Spor Kulübü', uyeSayisi: 78, aciklama: 'Kampüs spor etkinlikleri' },
                { id: 4, ad: 'Fotoğrafçılık', uyeSayisi: 24, aciklama: 'Fotoğraf sanatı ve sergiler' },
                { id: 5, ad: 'Tiyatro', uyeSayisi: 19, aciklama: 'Tiyatro oyunları ve atölyeler' },
            ]);
        } catch (error) {
            Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    }, []);

    const handleJoinKulup = async () => {
        if (!ogrenciNo) {
            Alert.alert('Hata', 'Öğrenci numarası gereklidir');
            return;
        }

        try {
            // API çağrısı
            // await api.post(`/api/kulup/${selectedKulup.id}/katil`, { ogrenciNo, telefon });
            
            Alert.alert('Başarılı', `${selectedKulup.ad} kulübüne katılım talebiniz alındı!`);
            setJoinModalVisible(false);
            setOgrenciNo('');
            setTelefon('');
            setSelectedKulup(null);
            loadData();
        } catch (error) {
            Alert.alert('Hata', 'Katılım işlemi başarısız');
        }
    };

    const openJoinModal = (kulup) => {
        setSelectedKulup(kulup);
        setJoinModalVisible(true);
    };

    const renderMyKulup = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => item.pozisyon === 'Yönetici' && navigation.navigate('BaskanMain')}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.ad.charAt(0)}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.kulupAd}>{item.ad}</Text>
                <View style={styles.infoRow}>
                    <View style={[styles.badge, item.pozisyon === 'Yönetici' && styles.badgeAdmin]}>
                        <Text style={[styles.badgeText, item.pozisyon === 'Yönetici' && styles.badgeTextAdmin]}>
                            {item.pozisyon}
                        </Text>
                    </View>
                    <Text style={styles.uyeSayisi}>
                        <Ionicons name="people-outline" size={14} color={COLORS.gray400} /> {item.uyeSayisi}
                    </Text>
                </View>
            </View>
            {item.pozisyon === 'Yönetici' ? (
                <View style={styles.manageIcon}>
                    <Ionicons name="shield-checkmark" size={20} color="#d97706" />
                </View>
            ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray300} />
            )}
        </TouchableOpacity>
    );

    const renderAvailableKulup = ({ item }) => (
        <View style={styles.availableCard}>
            <View style={styles.availableAvatar}>
                <Text style={styles.availableAvatarText}>{item.ad.charAt(0)}</Text>
            </View>
            <View style={styles.availableContent}>
                <Text style={styles.availableAd}>{item.ad}</Text>
                <Text style={styles.availableAciklama} numberOfLines={1}>{item.aciklama}</Text>
                <Text style={styles.availableUye}>
                    <Ionicons name="people-outline" size={12} color={COLORS.gray400} /> {item.uyeSayisi} üye
                </Text>
            </View>
            <TouchableOpacity style={styles.joinButton} onPress={() => openJoinModal(item)}>
                <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={kulupler}
                renderItem={renderMyKulup}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListHeaderComponent={
                    <>
                        <Text style={styles.sectionTitle}>Üye Olduğum Kulüpler</Text>
                        {kulupler.length === 0 && (
                            <View style={styles.emptyCard}>
                                <Ionicons name="people-outline" size={40} color={COLORS.gray300} />
                                <Text style={styles.emptyText}>Henüz bir kulübe üye değilsiniz</Text>
                            </View>
                        )}
                    </>
                }
                ListFooterComponent={
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: SIZES.xl }]}>Kulüplere Katıl</Text>
                        {aktifKulupler.map((kulup) => (
                            <View key={kulup.id}>
                                {renderAvailableKulup({ item: kulup })}
                            </View>
                        ))}
                    </>
                }
            />

            {/* Kulübe Katıl Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={joinModalVisible}
                onRequestClose={() => setJoinModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Kulübe Katıl</Text>
                            <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        {selectedKulup && (
                            <View style={styles.selectedKulupInfo}>
                                <View style={styles.modalAvatar}>
                                    <Text style={styles.modalAvatarText}>{selectedKulup.ad.charAt(0)}</Text>
                                </View>
                                <Text style={styles.selectedKulupName}>{selectedKulup.ad}</Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Öğrenci Numarası *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 20210001"
                                value={ogrenciNo}
                                onChangeText={setOgrenciNo}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Telefon (Opsiyonel)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="05xx xxx xx xx"
                                value={telefon}
                                onChangeText={setTelefon}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleJoinKulup}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                            <Text style={styles.submitButtonText}>Katılım Talebi Gönder</Text>
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
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: SIZES.md,
        color: COLORS.gray500,
        fontSize: SIZES.fontMd,
    },
    listContent: {
        padding: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.text,
        marginBottom: SIZES.md,
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
    avatar: {
        width: 50,
        height: 50,
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
    kulupAd: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
        marginBottom: SIZES.xs,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.md,
    },
    badge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
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
    uyeSayisi: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray400,
    },
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.xxl,
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    emptyText: {
        fontSize: SIZES.fontMd,
        color: COLORS.gray400,
        marginTop: SIZES.md,
    },
    availableCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginBottom: SIZES.sm,
        ...SHADOWS.sm,
    },
    availableAvatar: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    availableAvatarText: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.bold,
        color: COLORS.gray500,
    },
    availableContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    availableAd: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    availableAciklama: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    availableUye: {
        fontSize: SIZES.fontXs,
        color: COLORS.gray400,
        marginTop: 4,
    },
    joinButton: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
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
        marginBottom: SIZES.xl,
    },
    modalTitle: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
        color: COLORS.text,
    },
    selectedKulupInfo: {
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    modalAvatar: {
        width: 64,
        height: 64,
        borderRadius: SIZES.radiusLg,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    modalAvatarText: {
        fontSize: SIZES.fontXxxl,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    selectedKulupName: {
        fontSize: SIZES.fontLg,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
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
        ...SHADOWS.primary,
    },
    submitButtonText: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    manageIcon: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusSm,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
