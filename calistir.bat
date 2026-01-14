@echo off
chcp 65001 >nul
title Kulup Yonetim Sistemi

echo ╔════════════════════════════════════════════╗
echo ║    Kulup Yonetim Sistemi Baslatiliyor...   ║
echo ╚════════════════════════════════════════════╝
echo.

REM Batch dosyasinin bulundugu dizine git
cd /d "%~dp0"

echo [1/2] Backend baslatiliyor...
start "Backend - Spring Boot" cmd /k "cd /d "%~dp0" && mvnw.cmd spring-boot:run"

echo.
echo Backend'in baslamasi icin 15 saniye bekleniyor...
timeout /t 15 /nobreak >nul

echo.
echo [2/2] Mobil uygulama baslatiliyor...
start "Mobile - Expo" cmd /k "cd /d "%~dp0mobile" && npm start"

echo.
echo ╔════════════════════════════════════════════╗
echo ║              SISTEM HAZIIR!                ║
echo ╠════════════════════════════════════════════╣
echo ║  Backend:  http://localhost:8080           ║
echo ║  Mobil:    QR kodu telefon ile tara        ║
echo ║            (Ayni WiFi aginda olmalisiniz)  ║
echo ╚════════════════════════════════════════════╝
echo.
echo Pencereleri kapatmak icin her birinde CTRL+C yapin.
pause
