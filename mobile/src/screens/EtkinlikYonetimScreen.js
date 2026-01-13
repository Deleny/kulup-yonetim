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

export default function EtkinlikYonetimScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [etkinlikler, setEtkinlikler] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        baslik: '',
        aciklama: '',
        tarih: '',
        saat: '',
        konum: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Demo data
            setEtkinlikler([
                { id: 1, baslik: 'Yazilim Workshop', tarih: '2024-03-20', saat: '14:00', konum: 'A101', durum: 'AKTIF' },
                { id: 2, baslik: 'Hackathon 2024', tarih: '2024-04-15', saat: '09:00', konum: 'Konferans Salonu', durum: 'PLANLANDI' },
                { id: 3, baslik: 'Git Egitimi', tarih: '2024-02-10', saat: '15:30', konum: 'B205', durum: 'TAMAMLANDI' },
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

    const handleCreateEtkinlik = () => {
        if (!formData.baslik || !formData.tarih) {
            Alert.alert('Hata', 'Baslik ve tarih zorunludur');
            return;
        }
        const newEtkinlik = {
            id: Date.now(),
            ...formData,
            durum: 'PLANLANDI',
        };
        setEtkinlikler(prev => [newEtkinlik, ...prev]);
        setModalVisible(false);
        setFormData({ baslik: '', aciklama: '', tarih: '', saat: '', konum: '' });
        Alert.alert('Basarili', 'Etkinlik olusturuldu');
    };

    const handleDeleteEtkinlik = (etkinlik) => {
        Alert.alert(
            'Sil',
            `"${etkinlik.baslik}" etkinligini silmek istiyor musunuz?`,
            [
                { text: 'Iptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => {
                    setEtkinlikler(prev => prev.filter(e => e.id !== etkinlik.id));
                }},
            ]
        );
    };

    const getStatusStyle = (durum) => {
        switch (durum) {
            case 'AKTIF': return { bg: '#dcfce7', color: '#16a34a' };
            case 'PLANLANDI': return { bg: '#dbeafe', color: '#2563eb' };
            case 'TAMAMLANDI': return { bg: COLORS.gray100, color: COLORS.gray500 };
            default: return { bg: COLORS.gray100, color: COLORS.gray500 };
        }
    };

    const renderEtkinlik = ({ item }) => {
        const status = getStatusStyle(item.durum);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateDay}>{item.tarih.split('-')[2]}</Text>
                        <Text style={styles.dateMonth}>Mar</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.baslik}>{item.baslik}</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={14} color={COLORS.gray400} />
                            <Text style={styles.infoText}>{item.saat}</Text>
                            <Ionicons name="location-outline" size={14} color={COLORS.gray400} />
                            <Text style={styles.infoText}>{item.konum}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusText, { color: status.color }]}>{item.durum}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEtkinlik(item)}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
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
                data={etkinlikler}
                renderItem={renderEtkinlik}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>Henuz etkinlik yok</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={28} color={COLORS.white} />
            </TouchableOpacity>

            {/* Create Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yeni Etkinlik</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Baslik *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Etkinlik basligi"
                                value={formData.baslik}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, baslik: text }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Aciklama</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Etkinlik aciklamasi"
                                value={formData.aciklama}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, aciklama: text }))}
                                multiline
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Tarih *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    value={formData.tarih}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, tarih: text }))}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: SIZES.md }]}>
                                <Text style={styles.inputLabel}>Saat</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="HH:MM"
                                    value={formData.saat}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, saat: text }))}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Konum</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Etkinlik konumu"
                                value={formData.konum}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, konum: text }))}
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleCreateEtkinlik}>
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
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    dateBox: {
        width: 50,
        height: 50,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateDay: {
        fontSize: SIZES.fontXl,
        fontWeight: FONTS.bold,
        color: COLORS.white,
    },
    dateMonth: {
        fontSize: SIZES.fontXs,
        color: COLORS.white,
        opacity: 0.8,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.xs,
        marginTop: SIZES.xs,
    },
    infoText: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
        marginRight: SIZES.sm,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SIZES.sm,
        paddingVertical: 2,
        borderRadius: SIZES.radiusSm,
        marginTop: SIZES.sm,
    },
    statusText: {
        fontSize: SIZES.fontXs,
        fontWeight: FONTS.medium,
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
    row: {
        flexDirection: 'row',
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
