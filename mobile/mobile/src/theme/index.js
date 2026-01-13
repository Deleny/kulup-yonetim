// Kulüp Yönetimi Mobil - Tema Sabitleri
// Web Thymeleaf ile uyumlu

export const COLORS = {
    // Ana renkler - Mor tema
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#eef2ff',

    // Arka plan
    background: '#f1f5f9',
    white: '#ffffff',

    // Metin renkleri
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',

    // Kenarlar
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Durum renkleri
    error: '#ef4444',
    errorLight: '#fef2f2',
    errorBorder: '#fecaca',

    success: '#10b981',
    successLight: '#ecfdf5',

    warning: '#f59e0b',
    warningLight: '#fffbeb',

    info: '#0ea5e9',
    infoLight: '#f0f9ff',

    // Gri tonları
    gray50: '#f8fafc',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray300: '#cbd5e1',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1e293b',
    gray900: '#0f172a',
};

export const FONTS = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

export const SIZES = {
    // Padding & Margin
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,

    // Border Radius
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 20,
    radiusXxl: 24,
    radiusFull: 9999,

    // Font Sizes
    fontXs: 10,
    fontSm: 12,
    fontMd: 14,
    fontLg: 16,
    fontXl: 18,
    fontXxl: 20,
    fontXxxl: 24,
    font4xl: 28,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    primary: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
};
