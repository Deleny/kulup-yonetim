import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Bildirim ayarları
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Push token al ve backend'e kaydet
export async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification izni reddedildi');
            return null;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
    } else {
        console.log('Push notifications fiziksel cihaz gerektirir');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6366f1',
        });
    }

    return token;
}

// Token'ı backend'e kaydet
export async function savePushTokenToBackend(token) {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId || !token) return;

        await api.post('/api/push-token', {
            userId: parseInt(userId),
            token: token
        });
        console.log('Push token backend\'e kaydedildi');
    } catch (error) {
        console.log('Push token kaydetme hatası:', error.message);
    }
}

// Uygulama başladığında çağır
export async function initializePushNotifications() {
    const token = await registerForPushNotificationsAsync();
    if (token) {
        await savePushTokenToBackend(token);
        await AsyncStorage.setItem('expoPushToken', token);
    }
    return token;
}
