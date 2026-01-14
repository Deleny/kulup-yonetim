# 🎓 Kampüs Kulüp Yönetim Sistemi

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**Üniversite kulüplerini kolayca yönetmek için modern bir çözüm!**

YUSUF EREN SEYREK - MEHMET DELİN

[Özellikler](#-özellikler) •
[Kurulum](#-kurulum) •
[Kullanım](#-kullanım) •
[API](#-api-endpoints) •
[Ekran Görüntüleri](#-ekran-görüntüleri)

</div>

---

## 📋 Proje Hakkında

Kampüs Kulüp Yönetim Sistemi, üniversite kulüplerinin yönetimini kolaylaştırmak için geliştirilmiş kapsamlı bir uygulamadır. Spring Boot tabanlı güçlü backend ve React Native ile geliştirilmiş modern mobil uygulama içerir.

## ✨ Özellikler

### 👥 Üye Yönetimi
- Kullanıcı kaydı ve giriş sistemi
- Profil düzenleme
- Rol bazlı yetkilendirme (Üye, Başkan, Admin)

### 🏛️ Kulüp Yönetimi
- Kulüp oluşturma ve düzenleme
- Üye ekleme/çıkarma
- Başkanlık yetkileri

### 📅 Etkinlik Yönetimi
- Etkinlik oluşturma ve planlama
- Katılım takibi
- Etkinlik takvimi

### 💰 Aidat Takibi
- Aidat tanımlama
- Ödeme durumu takibi
- Finansal raporlama

### ✅ Görev Yönetimi
- Üyelere görev atama
- Görev durumu takibi
- Tamamlanma bildirimleri

### 🤖 AI Asistan
- Akıllı yardımcı asistan
- Sorulara anında cevap

---

## 🛠️ Teknolojiler

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Java | 17 | Programlama dili |
| Spring Boot | 3.2.5 | Web framework |
| Spring Security | 6 | Güvenlik |
| Spring Data JPA | - | Veritabanı erişimi |
| MySQL | 8.0 | Veritabanı |
| Thymeleaf | - | Şablon motoru |

### Mobile
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| React Native | 0.81.5 | Mobil framework |
| Expo | 54 | Geliştirme platformu |
| React Navigation | 7 | Navigasyon |
| Axios | 1.13.2 | HTTP client |

---

## 📁 Proje Yapısı

```
kulup-yonetim/
├── 📂 src/                          # Backend kaynak kodları
│   └── main/
│       └── java/com/example/kulup/
│           ├── 📂 config/           # Güvenlik yapılandırması
│           ├── 📂 controller/       # API controller'ları
│           │   ├── AdminController.java
│           │   ├── AiController.java
│           │   ├── ApiController.java
│           │   ├── AuthController.java
│           │   ├── BaskanController.java
│           │   ├── HomeController.java
│           │   └── PanelController.java
│           ├── 📂 model/            # Veri modelleri
│           │   ├── Aidat.java
│           │   ├── Etkinlik.java
│           │   ├── Gorev.java
│           │   ├── Kulup.java
│           │   ├── User.java
│           │   └── Uye.java
│           ├── 📂 repository/       # Veritabanı işlemleri
│           └── 📂 service/          # İş mantığı
│
├── 📂 mobile/                       # Mobil uygulama
│   └── src/
│       ├── 📂 navigation/           # Navigasyon yapılandırması
│       ├── 📂 screens/              # Uygulama ekranları
│       │   ├── LoginScreen.js
│       │   ├── RegisterScreen.js
│       │   ├── ProfilScreen.js
│       │   ├── KuluplerimScreen.js
│       │   ├── EtkinliklerScreen.js
│       │   ├── GorevlerimScreen.js
│       │   ├── AidatlarimScreen.js
│       │   ├── AiAsistanScreen.js
│       │   └── ... (yönetim ekranları)
│       ├── 📂 services/             # API servisleri
│       └── 📂 theme/                # Tema ayarları
│
├── 📂 .github/workflows/            # CI/CD yapılandırması
├── 📄 pom.xml                       # Maven bağımlılıkları
└── 📄 calistir.bat                  # Hızlı başlatma scripti
```

---

## 🚀 Kurulum

### Gereksinimler

- **Java 17** veya üzeri
- **Node.js 18** veya üzeri
- **MySQL 8.0** veya üzeri
- **Expo CLI** (`npm install -g expo-cli`)

### 1️⃣ Veritabanı Kurulumu

```sql
CREATE DATABASE kulup_db;
CREATE USER 'kulup_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON kulup_db.* TO 'kulup_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2️⃣ Backend Kurulumu

```bash
# Proje dizinine git
cd kulup-yonetim

# application.properties dosyasını düzenle
# src/main/resources/application.properties

# Uygulamayı başlat
./mvnw spring-boot:run
```

### 3️⃣ Mobil Uygulama Kurulumu

```bash
# Mobile dizinine git
cd mobile

# Bağımlılıkları yükle
npm install

# Expo'yu başlat
npm start
```

---

## 📱 Kullanım

### Hızlı Başlatma (Windows)

Projeyi tek tıkla başlatmak için:

```batch
calistir.bat
```

Bu script:
1. ✅ Backend'i başlatır (http://localhost:8080)
2. ✅ Mobil geliştirme sunucusunu başlatır
3. ✅ QR kod ile mobil cihazdan bağlanabilirsiniz

### Manuel Başlatma

**Terminal 1 - Backend:**
```bash
./mvnw spring-boot:run
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npm start
```

---

## 🔗 API Endpoints

### Kimlik Doğrulama
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Kullanıcı girişi |
| POST | `/api/auth/register` | Yeni kayıt |

### Kulüpler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/kulupler` | Tüm kulüpleri listele |
| GET | `/api/kulup/{id}` | Kulüp detayı |
| POST | `/api/kulup` | Yeni kulüp oluştur |

### Etkinlikler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/etkinlikler` | Tüm etkinlikler |
| POST | `/api/etkinlik` | Yeni etkinlik |
| PUT | `/api/etkinlik/{id}` | Etkinlik güncelle |

### Görevler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/gorevler` | Görevleri listele |
| POST | `/api/gorev` | Yeni görev ata |
| PUT | `/api/gorev/{id}/durum` | Durum güncelle |

### Aidatlar
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/aidatlar` | Aidat listesi |
| POST | `/api/aidat` | Aidat tanımla |
| PUT | `/api/aidat/{id}/ode` | Ödeme yap |

---

## 👥 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Üye** | Profil düzenleme, etkinlik görüntüleme, görev takibi, aidat ödeme |
| **Başkan** | Üye yönetimi, etkinlik oluşturma, görev atama, aidat tanımlama |
| **Admin** | Tüm sistem yönetimi, kulüp onaylama, kullanıcı yönetimi |

---

## 🖼️ Ekran Görüntüleri

> 📸 Ekran görüntüleri eklenecek

---

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/YeniOzellik`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 📞 İletişim

Sorularınız için:
- **GitHub Issues:** [Sorun Bildir](https://github.com/Deleny/kulup-yonetim/issues)

---

<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Developed with ❤️ by [Deleny](https://github.com/Deleny)

</div>
