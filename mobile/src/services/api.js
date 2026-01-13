import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - ngrok veya local
const BASE_URL = 'http://10.0.2.2:8080'; // Android emulator için
// const BASE_URL = 'http://localhost:8080'; // iOS simulator için

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token interceptor
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const setBaseUrl = (url) => {
    api.defaults.baseURL = url;
};

export default api;
