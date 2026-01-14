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
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GorevYonetimScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [gorevler, setGorevler] = useState([]);
    const [uyeler, setUyeler] = useState([]);
    const [kulupId, setKulupId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        baslik: '',
        aciklama: '',
        sonTarih: '',
        atananUye: null,
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

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

            // Üyeleri API'den çek
            const uyeRes = await api.get(`/api/kulup/${storedKulupId}/uyeler`);
            const uyeData = uyeRes.data.map(u => ({
                id: u.id,
                adSoyad: u.user?.adSoyad || 'Bilinmiyor'
            }));
            setUyeler(uyeData);

            // Görevleri üyelerden topla
            let tumGorevler = [];
            for (const uye of uyeRes.data) {
                try {
                    const gorevRes = await api.get(`/api/uye/${uye.id}/gorevler`);
                    const gorevData = gorevRes.data.map(g => ({
                        id: g.id,
                        baslik: g.baslik,
                        aciklama: g.aciklama || '',
                        durum: g.durum || 'BEKLEMEDE',
                        atanan: uye.user?.adSoyad || 'Bilinmiyor',
                        sonTarih: g.sonTarih || 'Belirtilmedi'
                    }));
                    tumGorevler = [...tumGorevler, ...gorevData];
                } catch (e) { }
            }
            setGorevler(tumGorevler);
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

    const closeModal = () => {
        setModalVisible(false);
        setShowDatePicker(false);
    };

    const handleCreateGorev = async () => {
        if (!formData.baslik || !formData.atananUye) {
            Alert.alert('Hata', 'Başlık ve atanacak üye zorunludur');
            return;
        }

        try {
            await api.post('/api/baskan/gorev-ekle', {
                uyeId: formData.atananUye.id,
                baslik: formData.baslik,
                aciklama: formData.aciklama,
                sonTarih: formData.sonTarih || new Date().toISOString().split('T')[0]
            });

            closeModal();
            setFormData({ baslik: '', aciklama: '', sonTarih: '', atananUye: null });
            Alert.alert('Başarılı', 'Görev oluşturuldu');
            loadData();
        } catch (error) {
            Alert.alert('Hata', 'Görev oluşturulamadı');
        }
    };

    const handleDeleteGorev = (gorev) => {
        Alert.alert(
            'Sil',
            `"${gorev.baslik}" görevini silmek istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil', style: 'destructive', onPress: async () => {
                        try {
                            await api.delete(`/api/baskan/gorev/${gorev.id}`);
                            loadData();
                        } catch (error) {
                            Alert.alert('Hata', 'Görev silinemedi');
                        }
                    }
                },
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
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        style={styles.modalSheet}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                    >
                        <ScrollView
                            contentContainerStyle={styles.modalFormContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Yeni Gorev</Text>
                                <TouchableOpacity onPress={closeModal}>
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
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={COLORS.gray500} />
                                    <Text style={styles.dateButtonText}>
                                        {formData.sonTarih || 'Tarih Seç'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <View style={styles.datePickerWrapper}>
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        minimumDate={new Date()}
                                        textColor={Platform.OS === 'ios' ? COLORS.text : undefined}
                                        onChange={(event, date) => {
                                            setShowDatePicker(false);
                                            if (date) {
                                                setSelectedDate(date);
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                setFormData(prev => ({ ...prev, sonTarih: `${year}-${month}-${day}` }));
                                            }
                                        }}
                                    />
                                </View>
                            )}

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
                        </ScrollView>
                    </KeyboardAvoidingView>
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
        paddingBottom: SIZES.xxxl + 40,
    },
    modalSheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radiusXxl,
        borderTopRightRadius: SIZES.radiusXxl,
        maxHeight: '90%',
        width: '100%',
    },
    modalFormContent: {
        padding: SIZES.xxl,
        paddingBottom: SIZES.xxxl + 40,
        flexGrow: 1,
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
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.lg,
        gap: SIZES.sm,
    },
    dateButtonText: {
        fontSize: SIZES.fontMd,
        color: COLORS.gray600,
    },
    datePickerWrapper: {
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        paddingVertical: SIZES.sm,
        marginBottom: SIZES.lg,
    },
});
