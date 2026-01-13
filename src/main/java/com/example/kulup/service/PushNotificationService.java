package com.example.kulup.service;

import org.springframework.stereotype.Service;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
public class PushNotificationService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    public boolean sendPushNotification(String expoPushToken, String title, String body) {
        if (expoPushToken == null || expoPushToken.isEmpty()) {
            System.out.println("Push token boş, bildirim gönderilmedi");
            return false;
        }

        try {
            URL url = new URL(EXPO_PUSH_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);

            String jsonPayload = String.format(
                    "{\"to\":\"%s\",\"title\":\"%s\",\"body\":\"%s\",\"sound\":\"default\"}",
                    expoPushToken, title, body);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            System.out.println("Push bildirim gönderildi: " + responseCode + " - " + expoPushToken);
            return responseCode == 200;

        } catch (Exception e) {
            System.out.println("Push bildirim hatası: " + e.getMessage());
            return false;
        }
    }

    public void sendGorevBildirimi(String expoPushToken, String gorevBaslik, String atayanAd) {
        sendPushNotification(
                expoPushToken,
                "📋 Yeni Görev Atandı",
                atayanAd + " size bir görev verdi: " + gorevBaslik);
    }

    public void sendEtkinlikBildirimi(String expoPushToken, String etkinlikBaslik, String kulupAd) {
        sendPushNotification(
                expoPushToken,
                "📅 Yeni Etkinlik",
                kulupAd + " kulübünde yeni etkinlik: " + etkinlikBaslik);
    }
}
