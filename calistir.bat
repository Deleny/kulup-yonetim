@echo off

echo Kulup Yonetimi Baslatiliyor...
echo.

echo Backend aciliyor...
cd C:\Users\MY-LAB\Desktop\Java-Projem\kulup-yonetim
start cmd /k mvnw.cmd spring-boot:run

echo 10 saniye bekleniyor (backend baslasin)...
timeout /t 10

echo Mobil aciliyor...
cd C:\Users\MY-LAB\Desktop\Java-Projem\kulup-yonetim\mobile
start cmd /k npm start

echo.
echo Bitti!
echo Backend: http://localhost:8080
echo Mobil: QR kodu telefonla tara (ayni WiFi'da olmali)
