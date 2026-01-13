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

export default function GorevYonetimScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [gorevler, setGorevler] = useState([]);
    const [uyeler, setUyeler] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        baslik: '',
        aciklama: '',
        sonTarih: '',
        atananUye: null,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            setGorevler([
                { id: 1, baslik: 'Poster Tasarimi', aciklama: 'Workshop icin poster hazirla', durum: 'BEKLIYOR', atanan: 'Ali Veli', sonTarih: '2024-03-18' },
                { id: 2, baslik: 'Mekan Ayarlama', aciklama: 'Etkinlik icin salon rezervasyonu', durum: 'DEVAM_EDIYOR', atanan: 'Ayse Yilmaz', sonTarih: '2024-03-15' },
                { id: 3, baslik: 'Sosyal Medya Paylasimi', aciklama: 'Etkinlik duyurusu yap', durum: 'TAMAMLANDI', atanan: 'Mehmet Kaya', sonTarih: '2024-03-10' },
            ]);
            setUyeler([
                { id: 1, adSoyad: 'Ali Veli' },
                { id: 2, adSoyad: 'Ayse Yilmaz' },
                { id: 3, adSoyad: 'Mehmet Kaya' },
            ]);
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

    const handleCreateGorev = () => {
        if (!formData.baslik) {
            Alert.alert('Hata', 'Baslik zorunludur');
            return;
        }
        const newGorev = {
            id: Date.now(),
            baslik: formData.baslik,
            aciklama: formData.aciklama,
            sonTarih: formData.sonTarih || 'Belirtilmedi',
            atanan: formData.atananUye?.adSoyad || 'Atanmadi',
            durum: 'BEKLIYOR',
        };
        setGorevler(prev => [newGorev, ...prev]);
        setModalVisible(false);
        setFormData({ baslik: '', aciklama: '', sonTarih: '', atananUye: null });
        Alert.alert('Basarili', 'Gorev olusturuldu');
    };

    const handleDeleteGorev = (gorev) => {
        Alert.alert(
            'Sil',
            `"${gorev.baslik}" gorevini silmek istiyor musunuz?`,
            [
                { text: 'Iptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => {
                    setGorevler(prev => prev.filter(g => g.id !== gorev.id));
                }},
            ]
        );
    };

    const getStatusStyle = (durum) => {
        switch (durum) {
            case 'BEKLIYOR': return { bg: '#fef3c7', color: '#d97706', icon: 'time' };
            case 'DEVAM_EDIYOR': return { bg: '#dbeafe', color: '#2563eb', icon: 'play-circle' };
            case 'TAMAMLANDI': return { bg: '#dcfce7', color: '#16a34a', icon: 'checkmark-circle' };
            default: return { bg: COLORS.gray100, color: COLORS.gray500, icon: 'help-circle' };
        }
    };

    const renderGorev = ({ item }) => {
        const status = getStatusStyle(item.durum);
        return (
            <View style={styles.card}>
                <View style={[styles.statusIcon, { backgroundColor: status.bg }]}>
                    <Ionicons name={status.icon} size={20} color={status.color} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.baslik}>{item.baslik}</Text>
                    <Text style={styles.aciklama} numberOfLines={1}>{item.aciklama}</Text>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="person-outline" size={12} color={COLORS.gray400} />
                            <Text style={styles.infoText}>{item.atanan}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={12} color={COLORS.gray400} />
                            <Text style={styles.infoText}>{item.sonTarih}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteGorev(item)}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={gorevler}
                renderItem={renderGorev}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkbox-outline" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>Henuz gorev yok</Text>
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
                            <Text style={styles.modalTitle}>Yeni Gorev</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Baslik *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Gorev basligi"
                                value={formData.baslik}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, baslik: text }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Aciklama</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Gorev aciklamasi"
                                value={formData.aciklama}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, aciklama: text }))}
                                multiline
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Son Tarih</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={formData.sonTarih}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, sonTarih: text }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Atanacak Uye</Text>
                            <View style={styles.uyeList}>
                                {uyeler.map(uye => (
                                    <TouchableOpacity
                                        key={uye.id}
                                        style={[styles.uyeChip, formData.atananUye?.id === uye.id && styles.uyeChipActive]}
                                        onPress={() => setFormData(prev => ({ ...prev, atananUye: uye }))}
                                    >
                                        <Text style={[styles.uyeChipText, formData.atananUye?.id === uye.id && styles.uyeChipTextActive]}>
                                            {uye.adSoyad}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleCreateGorev}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                            <Text style={styles.submitButtonText}>Olustur</Text>
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
    listContent: {
        padding: SIZES.lg,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        ...SHADOWS.sm,
    },
    statusIcon: {
        width: 40,
        height: 40,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        marginLeft: SIZES.md,
    },
    baslik: {
        fontSize: SIZES.fontMd,
        fontWeight: FONTS.semibold,
        color: COLORS.text,
    },
    aciklama: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        gap: SIZES.lg,
        marginTop: SIZES.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: SIZES.fontXs,
        color: COLORS.gray500,
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.errorLight,
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
        marginBottom: SIZES.xl,
    },
    modalTitle: {
        fontSize: SIZES.fontXxl,
        fontWeight: FONTS.bold,
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
    uyeList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.sm,
    },
    uyeChip: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        backgroundColor: COLORS.gray100,
        borderRadius: SIZES.radiusFull,
    },
    uyeChipActive: {
        backgroundColor: COLORS.primary,
    },
    uyeChipText: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray600,
    },
    uyeChipTextActive: {
        color: COLORS.white,
        fontWeight: FONTS.semibold,
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
