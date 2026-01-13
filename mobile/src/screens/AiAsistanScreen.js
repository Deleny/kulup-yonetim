import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../theme';
import api from '../services/api';

export default function AiAsistanScreen() {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Merhaba! Ben Kulüp Yönetimi AI asistanıyım. Size nasıl yardımcı olabilirim?\n\nBana şunları sorabilirsiniz:\n• Kulüp üyeliği hakkında\n• Etkinlikler ve görevler\n• Aidat bilgileri\n• Başkan ve üye rolleri',
            isBot: true,
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isBot: false,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const response = await api.post('/ai/assistant', {
                message: userMessage.text,
            });

            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: response.data.reply || 'Üzgünüm, şu an yanıt veremedim.',
                isBot: true,
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.log('AI hatası:', error.message);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.',
                isBot: true,
                isError: true,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => (
        <View
            style={[
                styles.messageBubble,
                item.isBot ? styles.botBubble : styles.userBubble,
                item.isError && styles.errorBubble,
            ]}
        >
            {item.isBot && (
                <View style={styles.botIcon}>
                    <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                </View>
            )}
            <Text
                style={[
                    styles.messageText,
                    item.isBot ? styles.botText : styles.userText,
                ]}
            >
                {item.text}
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {loading && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.typingText}>AI düşünüyor...</Text>
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Mesajınızı yazın..."
                    placeholderTextColor={COLORS.gray400}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || loading}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={inputText.trim() ? COLORS.white : COLORS.gray400}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    messageList: {
        padding: SIZES.lg,
        paddingBottom: SIZES.xl,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: SIZES.md,
        borderRadius: SIZES.radiusLg,
        marginBottom: SIZES.md,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: SIZES.xs,
        ...SHADOWS.sm,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: SIZES.xs,
    },
    errorBubble: {
        backgroundColor: '#fef2f2',
        borderColor: '#fca5a5',
        borderWidth: 1,
    },
    botIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.xs,
    },
    messageText: {
        fontSize: SIZES.fontMd,
        lineHeight: 22,
    },
    botText: {
        color: COLORS.text,
    },
    userText: {
        color: COLORS.white,
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
        gap: SIZES.sm,
    },
    typingText: {
        fontSize: SIZES.fontSm,
        color: COLORS.gray500,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SIZES.md,
        paddingBottom: SIZES.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        gap: SIZES.sm,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.gray50,
        borderRadius: SIZES.radiusMd,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.primary,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.gray200,
    },
});
