package com.example.kulup.controller;

import com.example.kulup.model.Aidat;
import com.example.kulup.model.Etkinlik;
import com.example.kulup.model.Gorev;
import com.example.kulup.model.Kulup;
import com.example.kulup.model.User;
import com.example.kulup.model.Uye;
import com.example.kulup.repository.AidatRepository;
import com.example.kulup.repository.EtkinlikRepository;
import com.example.kulup.repository.GorevRepository;
import com.example.kulup.repository.KulupRepository;
import com.example.kulup.repository.UserRepository;
import com.example.kulup.repository.UyeRepository;
import com.example.kulup.service.PushNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final KulupRepository kulupRepository;
    private final UyeRepository uyeRepository;
    private final EtkinlikRepository etkinlikRepository;
    private final GorevRepository gorevRepository;
    private final AidatRepository aidatRepository;
    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;

    public ApiController(KulupRepository kulupRepository,
            UyeRepository uyeRepository,
            EtkinlikRepository etkinlikRepository,
            GorevRepository gorevRepository,
            AidatRepository aidatRepository,
            UserRepository userRepository,
            PushNotificationService pushNotificationService) {
        this.kulupRepository = kulupRepository;
        this.uyeRepository = uyeRepository;
        this.etkinlikRepository = etkinlikRepository;
        this.gorevRepository = gorevRepository;
        this.aidatRepository = aidatRepository;
        this.userRepository = userRepository;
        this.pushNotificationService = pushNotificationService;
    }

    @GetMapping("/kulup/{id}")
    public ResponseEntity<Kulup> getKulup(@PathVariable Long id) {
        return kulupRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Üyeler
    @GetMapping("/kulup/{kulupId}/uyeler")
    public List<Uye> getUyeler(@PathVariable Long kulupId) {
        return uyeRepository.findByKulupIdAndDurum(kulupId, "ONAYLANDI");
    }

    // Etkinlikler
    @GetMapping("/kulup/{kulupId}/etkinlikler")
    public List<Etkinlik> getEtkinlikler(@PathVariable Long kulupId) {
        return etkinlikRepository.findByKulupId(kulupId);
    }

    @GetMapping("/etkinlik/{id}")
    public ResponseEntity<Etkinlik> getEtkinlik(@PathVariable Long id) {
        return etkinlikRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Tüm yaklaşan etkinlikler (mobil)
    @GetMapping("/etkinlikler")
    public List<Etkinlik> getTumEtkinlikler() {
        return etkinlikRepository.findByTarihAfterOrderByTarihAsc(java.time.LocalDate.now());
    }

    // Görevler
    @GetMapping("/uye/{uyeId}/gorevler")
    public List<Gorev> getGorevler(@PathVariable Long uyeId) {
        return gorevRepository.findByUyeId(uyeId);
    }

    // Aidatlar
    @GetMapping("/uye/{uyeId}/aidatlar")
    public List<Aidat> getAidatlar(@PathVariable Long uyeId) {
        return aidatRepository.findByUyeId(uyeId);
    }

    // Kulüp İstatistikleri
    @GetMapping("/kulup/{kulupId}/istatistikler")
    public Map<String, Object> getKulupIstatistikleri(@PathVariable Long kulupId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("toplamUye", uyeRepository.findByKulupId(kulupId).size());
        stats.put("toplamEtkinlik", etkinlikRepository.findByKulupId(kulupId).size());
        stats.put("odenenAidat", aidatRepository.sumOdenenByKulupId(kulupId));
        stats.put("bekleyenAidat", aidatRepository.sumOdenmeyenByKulupId(kulupId));
        return stats;
    }

    // ========== MOBİL API ENDPOINT'LERİ ==========

    // Kulüp oluştur (mobil)
    @PostMapping("/kulup-olustur")
    public ResponseEntity<?> kulupOlustur(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.parseLong(body.get("userId").toString());
            String ad = body.get("ad").toString();
            String aciklama = body.get("aciklama").toString();

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kullanıcı bulunamadı"));
            }

            Kulup kulup = new Kulup(ad, aciklama, user);
            kulupRepository.save(kulup);

            return ResponseEntity.ok(Map.of(
                    "message", "Kulüp başarıyla oluşturuldu. Admin onayı bekleniyor.",
                    "kulupId", kulup.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Kulüp oluşturulurken hata: " + e.getMessage()));
        }
    }

    // Kulübe katıl (mobil)
    @PostMapping("/kulup/{kulupId}/katil")
    public ResponseEntity<?> kulubeKatil(@PathVariable Long kulupId, @RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.parseLong(body.get("userId").toString());
            String ogrenciNo = body.get("ogrenciNo").toString();
            String telefon = body.containsKey("telefon") ? body.get("telefon").toString() : null;

            User user = userRepository.findById(userId).orElse(null);
            Kulup kulup = kulupRepository.findById(kulupId).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kullanıcı bulunamadı"));
            }
            if (kulup == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kulüp bulunamadı"));
            }
            if (uyeRepository.existsByUserAndKulup(user, kulup)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Zaten bu kulübe üyesiniz"));
            }

            Uye uye = new Uye(ogrenciNo, telefon, user, kulup);
            uyeRepository.save(uye);

            return ResponseEntity.ok(Map.of("message", "Kulübe başarıyla katıldınız"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Katılma işlemi başarısız: " + e.getMessage()));
        }
    }

    // Kulüpten ayrıl (mobil)
    @DeleteMapping("/uyelik/{uyelikId}/ayril")
    public ResponseEntity<?> uyeliktenAyril(@PathVariable Long uyelikId, @RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.parseLong(body.get("userId").toString());

            Uye uye = uyeRepository.findById(uyelikId).orElse(null);
            if (uye == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Üyelik bulunamadı"));
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !user.getId().equals(uye.getUser().getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Yetkisiz işlem"));
            }

            // Başkan ise ayrılamaz
            Kulup kulup = uye.getKulup();
            if (kulup.getBaskan() != null && user.getId().equals(kulup.getBaskan().getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kulüp başkanı ayrılamaz"));
            }

            uyeRepository.delete(uye);
            return ResponseEntity.ok(Map.of("message", "Kulüpten başarıyla ayrıldınız"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ayrılma işlemi başarısız: " + e.getMessage()));
        }
    }

    // Kullanıcının üyelikleri (mobil)
    @GetMapping("/uye/{userId}/uyelikler")
    public List<Uye> getUyelikler(@PathVariable Long userId) {
        System.out.println("MOBİL ÜYELİK İSTEĞİ - UserID: " + userId); // DEBUG LOG
        return uyeRepository.findByUserId(userId);
    }

    // Kullanıcının TÜM görevleri (mobil) - tüm üyeliklerinden
    @GetMapping("/user/{userId}/gorevler")
    public ResponseEntity<?> getUserGorevler(@PathVariable Long userId) {
        try {
            List<Uye> uyelikler = uyeRepository.findByUserId(userId);
            List<Gorev> tumGorevler = new java.util.ArrayList<>();

            for (Uye uye : uyelikler) {
                List<Gorev> gorevler = gorevRepository.findByUyeId(uye.getId());
                tumGorevler.addAll(gorevler);
            }

            return ResponseEntity.ok(tumGorevler);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Kullanıcının başkan olduğu kulüp (mobil)
    @GetMapping("/user/{userId}/baskan-kulup")
    public ResponseEntity<?> getBaskanKulup(@PathVariable Long userId) {
        List<Kulup> kulupler = kulupRepository.findByBaskanId(userId);
        if (kulupler.isEmpty()) {
            return ResponseEntity.ok(Map.of("baskan", false));
        }
        Kulup kulup = kulupler.get(0);
        Map<String, Object> result = new HashMap<>();
        result.put("baskan", true);
        result.put("kulupId", kulup.getId());
        result.put("kulupAd", kulup.getAd());
        result.put("kulupAciklama", kulup.getAciklama());
        result.put("aktif", kulup.getAktif());
        return ResponseEntity.ok(result);
    }

    // Herkes için görev ekleme (mobil) - üye kendi kulüplerindeki üyelere görev
    // verebilir
    @PostMapping("/gorev-ekle")
    public ResponseEntity<?> gorevEkleHerkes(@RequestBody Map<String, Object> body) {
        try {
            Long atayanUserId = Long.parseLong(body.get("atayanUserId").toString());
            Long hedefUyeId = Long.parseLong(body.get("hedefUyeId").toString());
            String baslik = body.get("baslik").toString();
            String aciklama = body.containsKey("aciklama") ? body.get("aciklama").toString() : "";
            String sonTarih = body.containsKey("sonTarih") ? body.get("sonTarih").toString() : null;

            Uye hedefUye = uyeRepository.findById(hedefUyeId).orElse(null);
            if (hedefUye == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Hedef üye bulunamadı"));
            }

            // Atayan kişinin aynı kulüpte üye olup olmadığını kontrol et
            List<Uye> atayanUyelikleri = uyeRepository.findByUserId(atayanUserId);
            boolean ayniKulupte = atayanUyelikleri.stream()
                    .anyMatch(u -> u.getKulup().getId().equals(hedefUye.getKulup().getId()));

            // Ya aynı kulüpte olmalı, ya da başkan olmalı
            List<Kulup> baskanKulupleri = kulupRepository.findByBaskanId(atayanUserId);
            boolean baskan = baskanKulupleri.stream()
                    .anyMatch(k -> k.getId().equals(hedefUye.getKulup().getId()));

            if (!ayniKulupte && !baskan) {
                return ResponseEntity.badRequest().body(Map.of("error", "Bu kulüpte görev atama yetkiniz yok"));
            }

            Gorev gorev = new Gorev();
            gorev.setBaslik(baslik);
            gorev.setAciklama(aciklama);
            gorev.setSonTarih(
                    sonTarih != null ? java.time.LocalDate.parse(sonTarih) : java.time.LocalDate.now().plusDays(7));
            gorev.setDurum("BEKLEMEDE");
            gorev.setUye(hedefUye);
            gorevRepository.save(gorev);

            // Push bildirim gönder
            User hedefUser = hedefUye.getUser();
            User atayanUser = userRepository.findById(atayanUserId).orElse(null);
            if (hedefUser != null && hedefUser.getExpoPushToken() != null) {
                String atayanAd = atayanUser != null ? atayanUser.getAdSoyad() : "Birisi";
                pushNotificationService.sendGorevBildirimi(
                        hedefUser.getExpoPushToken(),
                        baslik,
                        atayanAd);
            }

            return ResponseEntity.ok(Map.of("message", "Görev oluşturuldu", "id", gorev.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Görev eklenemedi: " + e.getMessage()));
        }
    }

    // Kullanıcının üye olduğu kulüplerdeki tüm üyeler (görev atamak için)
    @GetMapping("/user/{userId}/kulup-uyeleri")
    public ResponseEntity<?> getKulupUyeleri(@PathVariable Long userId) {
        try {
            List<Uye> uyelikler = uyeRepository.findByUserId(userId);
            List<Kulup> baskanKulupleri = kulupRepository.findByBaskanId(userId);

            java.util.Set<Long> kulupIds = new java.util.HashSet<>();
            for (Uye u : uyelikler) {
                kulupIds.add(u.getKulup().getId());
            }
            for (Kulup k : baskanKulupleri) {
                kulupIds.add(k.getId());
            }

            List<Map<String, Object>> result = new java.util.ArrayList<>();
            for (Long kulupId : kulupIds) {
                Kulup kulup = kulupRepository.findById(kulupId).orElse(null);
                if (kulup != null) {
                    List<Uye> kulupUyeleri = uyeRepository.findByKulupId(kulupId);
                    Map<String, Object> kulupData = new HashMap<>();
                    kulupData.put("kulupId", kulup.getId());
                    kulupData.put("kulupAd", kulup.getAd());

                    List<Map<String, Object>> uyelerData = new java.util.ArrayList<>();
                    for (Uye uye : kulupUyeleri) {
                        Map<String, Object> uyeData = new HashMap<>();
                        uyeData.put("uyeId", uye.getId());
                        uyeData.put("adSoyad", uye.getUser().getAdSoyad());
                        uyeData.put("pozisyon", uye.getPozisyon());
                        uyelerData.add(uyeData);
                    }
                    kulupData.put("uyeler", uyelerData);
                    result.add(kulupData);
                }
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Aktif kulüpleri listele (mobil)
    @GetMapping("/kulupler")
    public List<Kulup> getAktifKulupler() {
        System.out.println("MOBİL KULÜP LİSTESİ İSTEĞİ"); // DEBUG LOG
        return kulupRepository.findByAktif(true);
    }

    // ========== PUSH NOTİFİKASYON API ==========

    // Push token kaydet
    @PostMapping("/push-token")
    public ResponseEntity<?> savePushToken(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.parseLong(body.get("userId").toString());
            String token = body.get("token").toString();

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kullanıcı bulunamadı"));
            }

            user.setExpoPushToken(token);
            userRepository.save(user);
            System.out.println("Push token kaydedildi: " + userId + " -> " + token);
            return ResponseEntity.ok(Map.of("message", "Token kaydedildi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Kulüpteki tüm üyelere bildirim gönder (etkinlik için)
    @PostMapping("/kulup/{kulupId}/bildirim")
    public ResponseEntity<?> sendKulupBildirim(@PathVariable Long kulupId, @RequestBody Map<String, String> body) {
        try {
            String baslik = body.get("baslik");
            String mesaj = body.get("mesaj");

            List<Uye> uyeler = uyeRepository.findByKulupId(kulupId);
            int gonderilen = 0;
            for (Uye uye : uyeler) {
                if (uye.getUser() != null && uye.getUser().getExpoPushToken() != null) {
                    pushNotificationService.sendPushNotification(
                            uye.getUser().getExpoPushToken(),
                            baslik,
                            mesaj);
                    gonderilen++;
                }
            }

            return ResponseEntity.ok(Map.of("message", gonderilen + " üyeye bildirim gönderildi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== MOBİL AUTH API ==========

    // Mobil giriş
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String sifre = body.get("sifre");

            System.out.println("MOBİL GİRİŞ İSTEĞİ GELDİ: " + email); // DEBUG LOG

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kullanıcı bulunamadı: " + email));
            }

            // Debug: şifre karşılaştırması
            String dbSifre = user.getSifre();
            if (!dbSifre.equals(sifre)) {
                System.out.println("Şifre uyuşmazlığı - Email: " + email);
                System.out.println("DB Şifre: [" + dbSifre + "], Gelen Şifre: [" + sifre + "]");
                return ResponseEntity.badRequest().body(Map.of("error", "Şifre hatalı"));
            }

            // Kullanıcının başkan olduğu kulüp
            List<Kulup> baskanKulupler = kulupRepository.findByBaskanId(user.getId());
            Kulup baskanKulup = baskanKulupler.isEmpty() ? null : baskanKulupler.get(0);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("adSoyad", user.getAdSoyad());
            response.put("rol", user.getRole());
            response.put("baskanKulupId", baskanKulup != null ? baskanKulup.getId() : null);
            response.put("baskanKulupAd", baskanKulup != null ? baskanKulup.getAd() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Giriş hatası: " + e.getMessage()));
        }
    }

    // Mobil kayıt
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String sifre = body.get("sifre");
            String adSoyad = body.get("adSoyad");

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Bu email zaten kayıtlı"));
            }

            User user = new User(email, sifre, adSoyad, "UYE");
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Kayıt başarılı",
                    "userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Kayıt hatası: " + e.getMessage()));
        }
    }

    // Profil bilgisi
    @GetMapping("/profil/{userId}")
    public ResponseEntity<?> getProfil(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Uye> uyelikler = uyeRepository.findByUserId(userId);
        int toplamGorev = 0;
        int toplamEtkinlik = 0;

        // Kullanıcının başkan olduğu kulüpleri de say
        List<Kulup> baskanKulupler = kulupRepository.findByBaskanId(userId);
        java.util.Set<Long> kulupIds = new java.util.HashSet<>();

        for (Uye uye : uyelikler) {
            toplamGorev += gorevRepository.findByUyeId(uye.getId()).size();
            kulupIds.add(uye.getKulup().getId());
        }
        for (Kulup k : baskanKulupler) {
            kulupIds.add(k.getId());
        }

        // Her kulüpün etkinlik sayısını topla
        for (Long kulupId : kulupIds) {
            toplamEtkinlik += etkinlikRepository.findByKulupId(kulupId).size();
        }

        Map<String, Object> profil = new HashMap<>();
        profil.put("id", user.getId());
        profil.put("email", user.getEmail());
        profil.put("adSoyad", user.getAdSoyad());
        profil.put("rol", user.getRole());
        profil.put("uyelikSayisi", uyelikler.size() + baskanKulupler.size());
        profil.put("gorevSayisi", toplamGorev);
        profil.put("etkinlikSayisi", toplamEtkinlik);

        return ResponseEntity.ok(profil);
    }

    // Profil güncelle (mobil)
    @PutMapping("/profil/{userId}")
    public ResponseEntity<?> updateProfil(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            String adSoyad = body.get("adSoyad");
            String eskiSifre = body.get("eskiSifre");
            String yeniSifre = body.get("yeniSifre");

            if (adSoyad != null && !adSoyad.trim().isEmpty()) {
                user.setAdSoyad(adSoyad.trim());
            }

            // Şifre değiştirme
            if (yeniSifre != null && !yeniSifre.isEmpty()) {
                if (eskiSifre == null || !eskiSifre.equals(user.getSifre())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Mevcut şifre hatalı"));
                }
                user.setSifre(yeniSifre);
            }

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profil güncellendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Güncelleme hatası: " + e.getMessage()));
        }
    }

    // Kulüp güncelle (başkan)
    @PutMapping("/kulup/{kulupId}")
    public ResponseEntity<?> updateKulup(@PathVariable Long kulupId, @RequestBody Map<String, String> body) {
        try {
            Kulup kulup = kulupRepository.findById(kulupId).orElse(null);
            if (kulup == null) {
                return ResponseEntity.notFound().build();
            }

            String ad = body.get("ad");
            String aciklama = body.get("aciklama");

            if (ad != null && !ad.trim().isEmpty()) {
                kulup.setAd(ad.trim());
            }
            if (aciklama != null) {
                kulup.setAciklama(aciklama.trim());
            }

            kulupRepository.save(kulup);
            return ResponseEntity.ok(Map.of("message", "Kulüp güncellendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Güncelleme hatası: " + e.getMessage()));
        }
    }

    // ========== BAŞKAN YÖNETİM API ==========

    // Etkinlik ekle
    @PostMapping("/baskan/etkinlik-ekle")
    public ResponseEntity<?> etkinlikEkle(@RequestBody Map<String, Object> body) {
        try {
            Long kulupId = Long.parseLong(body.get("kulupId").toString());
            Kulup kulup = kulupRepository.findById(kulupId).orElse(null);
            if (kulup == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kulüp bulunamadı"));
            }

            Etkinlik etkinlik = new Etkinlik();
            etkinlik.setBaslik(body.get("baslik").toString());
            etkinlik.setAciklama(body.containsKey("aciklama") ? body.get("aciklama").toString() : "");
            etkinlik.setTarih(java.time.LocalDate.parse(body.get("tarih").toString()));
            etkinlik.setSaat(
                    java.time.LocalTime.parse(body.containsKey("saat") ? body.get("saat").toString() : "00:00"));
            etkinlik.setKonum(body.containsKey("konum") ? body.get("konum").toString() : "");
            etkinlik.setDurum("PLANLANDI");
            etkinlik.setKulup(kulup);
            etkinlikRepository.save(etkinlik);

            return ResponseEntity.ok(Map.of("message", "Etkinlik oluşturuldu", "id", etkinlik.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Etkinlik eklenemedi: " + e.getMessage()));
        }
    }

    // Etkinlik sil
    @DeleteMapping("/baskan/etkinlik/{id}")
    public ResponseEntity<?> etkinlikSil(@PathVariable Long id) {
        try {
            etkinlikRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Etkinlik silindi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Etkinlik silinemedi"));
        }
    }

    // Görev ekle
    @PostMapping("/baskan/gorev-ekle")
    public ResponseEntity<?> gorevEkle(@RequestBody Map<String, Object> body) {
        try {
            Long uyeId = Long.parseLong(body.get("uyeId").toString());
            Uye uye = uyeRepository.findById(uyeId).orElse(null);
            if (uye == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Üye bulunamadı"));
            }

            Gorev gorev = new Gorev();
            gorev.setBaslik(body.get("baslik").toString());
            gorev.setAciklama(body.containsKey("aciklama") ? body.get("aciklama").toString() : "");
            gorev.setSonTarih(java.time.LocalDate.parse(body.get("sonTarih").toString()));
            gorev.setDurum("BEKLEMEDE");
            gorev.setUye(uye);
            gorevRepository.save(gorev);

            return ResponseEntity.ok(Map.of("message", "Görev oluşturuldu", "id", gorev.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Görev eklenemedi: " + e.getMessage()));
        }
    }

    // Görev durumu güncelle
    @PutMapping("/gorev/{id}/durum")
    public ResponseEntity<?> gorevDurumGuncelle(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Gorev gorev = gorevRepository.findById(id).orElse(null);
            if (gorev == null) {
                return ResponseEntity.notFound().build();
            }
            gorev.setDurum(body.get("durum"));
            gorevRepository.save(gorev);
            return ResponseEntity.ok(Map.of("message", "Görev güncellendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Görev güncellenemedi"));
        }
    }

    // Görev sil
    @DeleteMapping("/baskan/gorev/{id}")
    public ResponseEntity<?> gorevSil(@PathVariable Long id) {
        try {
            gorevRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Görev silindi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Görev silinemedi"));
        }
    }

    // Aidat ekle
    @PostMapping("/baskan/aidat-ekle")
    public ResponseEntity<?> aidatEkle(@RequestBody Map<String, Object> body) {
        try {
            Long uyeId = Long.parseLong(body.get("uyeId").toString());
            Uye uye = uyeRepository.findById(uyeId).orElse(null);
            if (uye == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Üye bulunamadı"));
            }

            Aidat aidat = new Aidat();
            aidat.setTutar(new java.math.BigDecimal(body.get("tutar").toString()));
            aidat.setDonem(body.get("donem").toString());
            aidat.setOdendi(false);
            aidat.setUye(uye);
            aidat.setKulup(uye.getKulup());
            aidatRepository.save(aidat);

            return ResponseEntity.ok(Map.of("message", "Aidat oluşturuldu", "id", aidat.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aidat eklenemedi: " + e.getMessage()));
        }
    }

    // Aidat durumu güncelle (ödendi/ödenmedi)
    @PutMapping("/aidat/{id}/odeme")
    public ResponseEntity<?> aidatOdemeGuncelle(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Aidat aidat = aidatRepository.findById(id).orElse(null);
            if (aidat == null) {
                return ResponseEntity.notFound().build();
            }
            aidat.setOdendi((Boolean) body.get("odendi"));
            if (aidat.getOdendi()) {
                aidat.setOdemeTarihi(java.time.LocalDate.now());
            }
            aidatRepository.save(aidat);
            return ResponseEntity.ok(Map.of("message", "Aidat güncellendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aidat güncellenemedi"));
        }
    }

    // Üye kabul/red
    @PutMapping("/baskan/uye/{id}/durum")
    public ResponseEntity<?> uyeDurumGuncelle(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Uye uye = uyeRepository.findById(id).orElse(null);
            if (uye == null) {
                return ResponseEntity.notFound().build();
            }
            String durum = body.get("durum");
            if ("ONAYLANDI".equals(durum)) {
                // Üye pozisyonunu güncelle veya sadece işaretle
                uyeRepository.save(uye);
                return ResponseEntity.ok(Map.of("message", "Üye onaylandı"));
            } else if ("REDDEDILDI".equals(durum)) {
                uyeRepository.delete(uye);
                return ResponseEntity.ok(Map.of("message", "Üyelik reddedildi"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Geçersiz durum"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "İşlem başarısız"));
        }
    }
}
