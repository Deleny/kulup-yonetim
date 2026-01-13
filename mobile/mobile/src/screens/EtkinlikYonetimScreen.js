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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EtkinlikYonetimScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [etkinlikler, setEtkinlikler] = useState([]);
    const [kulupId, setKulupId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        baslik: '',
        aciklama: '',
        tarih: '',
        saat: '',
        konum: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateMode, setDateMode] = useState('date');
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

            // Etkinlikleri API'den çek
            const response = await api.get(`/api/kulup/${storedKulupId}/etkinlikler`);
            setEtkinlikler(response.data || []);
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

    const handleCreateEtkinlik = async () => {
        if (!formData.baslik || !formData.tarih) {
            Alert.alert('Hata', 'Başlık ve tarih zorunludur');
            return;
        }

        try {
            await api.post('/api/baskan/etkinlik-ekle', {
                kulupId,
                baslik: formData.baslik,
                aciklama: formData.aciklama,
                tarih: formData.tarih,
                saat: formData.saat || '00:00',
                konum: formData.konum
            });

            setModalVisible(false);
            setFormData({ baslik: '', aciklama: '', tarih: '', saat: '', konum: '' });
            Alert.alert('Başarılı', 'Etkinlik oluşturuldu');
            loadData();
        } catch (error) {
            console.log('Etkinlik oluşturma hatası:', error);
            Alert.alert('Hata', 'Etkinlik oluşturulamadı. Lütfen tarih formatını ve internet bağlantınızı kontrol edin.');
        }
    };

    const onDateChange = (event, selectedValue) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedValue) {
            const currentDate = selectedValue;
            setSelectedDate(currentDate);

            if (dateMode === 'date') {
                // YYYY-MM-DD formatı
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                setFormData(prev => ({ ...prev, tarih: `${year}-${month}-${day}` }));
            } else {
                // HH:MM formatı
                const hours = String(currentDate.getHours()).padStart(2, '0');
                const minutes = String(currentDate.getMinutes()).padStart(2, '0');
                setFormData(prev => ({ ...prev, saat: `${hours}:${minutes}` }));
            }
        }
    };

    const showDateMode = (mode) => {
        setDateMode(mode);
        setShowDatePicker(true);
    };

    const handleDeleteEtkinlik = (etkinlik) => {
        Alert.alert(
            'Sil',
            `"${etkinlik.baslik}" etkinliğini silmek istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil', style: 'destructive', onPress: async () => {
                        try {
                            await api.delete(`/api/baskan/etkinlik/${etkinlik.id}`);
                            loadData();
                        } catch (error) {
                            Alert.alert('Hata', 'Etkinlik silinemedi');
                        }
                    }
                },
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
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => showDateMode('date')}
                                >
                                    <Text style={{ color: formData.tarih ? COLORS.text : COLORS.gray400, paddingTop: 4 }}>
                                        {formData.tarih || 'YYYY-MM-DD'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: SIZES.md }]}>
                                <Text style={styles.inputLabel}>Saat</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => showDateMode('time')}
                                >
                                    <Text style={{ color: formData.saat ? COLORS.text : COLORS.gray400, paddingTop: 4 }}>
                                        {formData.saat || 'HH:MM'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={selectedDate}
                                mode={dateMode}
                                is24Hour={true}
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

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
