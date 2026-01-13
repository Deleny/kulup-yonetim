import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// AWS DEPLOYMENT İÇİN BU SATIRI DEĞİŞTİR!
// Örnek: const BASE_URL = 'http://your-aws-server.com:8080';
// ============================================
const BASE_URL = 'http://3.120.238.191:8080';

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
