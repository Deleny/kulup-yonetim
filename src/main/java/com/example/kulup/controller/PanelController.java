package com.example.kulup.controller;

import com.example.kulup.model.Aidat;
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
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Controller
@RequestMapping("/panel")
public class PanelController {

    private final UserRepository userRepository;
    private final KulupRepository kulupRepository;
    private final UyeRepository uyeRepository;
    private final EtkinlikRepository etkinlikRepository;
    private final GorevRepository gorevRepository;
    private final AidatRepository aidatRepository;

    public PanelController(UserRepository userRepository,
            KulupRepository kulupRepository,
            UyeRepository uyeRepository,
            EtkinlikRepository etkinlikRepository,
            GorevRepository gorevRepository,
            AidatRepository aidatRepository) {
        this.userRepository = userRepository;
        this.kulupRepository = kulupRepository;
        this.uyeRepository = uyeRepository;
        this.etkinlikRepository = etkinlikRepository;
        this.gorevRepository = gorevRepository;
        this.aidatRepository = aidatRepository;
    }

    // Giriş yapmış kullanıcıyı bul
    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @GetMapping("")
    public String panel(Authentication auth, Model model) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return "redirect:/giris";
        }

        // Kullanıcının üyelikleri
        List<Uye> uyelikler = uyeRepository.findByUserId(user.getId());

        // Başkan olduğu kulüpleri de listeye ekle (Fake Uyelik olarak)
        List<Kulup> baskanKulupleri = kulupRepository.findByBaskanId(user.getId());
        for (Kulup kulup : baskanKulupleri) {
            boolean zatenEkli = uyelikler.stream()
                    .anyMatch(u -> u.getKulup().getId().equals(kulup.getId()));

            if (!zatenEkli) {
                Uye baskanUyelik = new Uye();
                baskanUyelik.setUser(user);
                baskanUyelik.setKulup(kulup);
                baskanUyelik.setPozisyon("BASKAN");
                baskanUyelik.setDurum("ONAYLANDI");
                baskanUyelik.setKayitTarihi(LocalDate.now());
                uyelikler.add(0, baskanUyelik);
            }
        }

        model.addAttribute("user", user);
        model.addAttribute("uyelikler", uyelikler);

        // Aktif kulüpler (katılmak için)
        List<Kulup> aktifKulupler = kulupRepository.findByAktif(true);
        model.addAttribute("aktifKulupler", aktifKulupler);

        // Yaklaşan etkinlikler
        model.addAttribute("yaklasanEtkinlikler",
                etkinlikRepository.findByTarihAfterOrderByTarihAsc(LocalDate.now()));

        return "panel";
    }

    // Kulüp oluşturma (onay bekleyecek)
    @PostMapping("/kulup-olustur")
    public String kulupOlustur(Authentication auth,
            @RequestParam String ad,
            @RequestParam String aciklama) {
        User user = getCurrentUser(auth);
        if (user != null) {
            Kulup kulup = new Kulup(ad, aciklama, user);
            kulupRepository.save(kulup);
        }
        return "redirect:/panel";
    }

    // Kulübe katılma
    @PostMapping("/kulup/{id}/katil")
    public String kulubeKatil(Authentication auth,
            @PathVariable Long id,
            @RequestParam String ogrenciNo,
            @RequestParam(required = false) String telefon) {
        User user = getCurrentUser(auth);
        Kulup kulup = kulupRepository.findById(id).orElse(null);

        if (user != null && kulup != null && !uyeRepository.existsByUserAndKulup(user, kulup)) {
            Uye uye = new Uye(ogrenciNo, telefon, user, kulup);
            uyeRepository.save(uye);
        }
        return "redirect:/panel";
    }

    // Kulüpten ayrılma
    @PostMapping("/uyelik/{id}/ayril")
    public String uyeliktenAyril(Authentication auth, @PathVariable Long id) {
        User user = getCurrentUser(auth);
        Uye uye = uyeRepository.findById(id).orElse(null);
        if (user != null && uye != null && uye.getUser() != null
                && user.getId().equals(uye.getUser().getId())) {
            Kulup kulup = uye.getKulup();
            if (kulup != null && kulup.getBaskan() != null
                    && user.getId().equals(kulup.getBaskan().getId())) {
                return "redirect:/panel";
            }
            uyeRepository.delete(uye);
        }
        return "redirect:/panel";
    }

    // Görevlerim sayfası
    @GetMapping("/gorevlerim")
    public String gorevlerim(Authentication auth, Model model) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return "redirect:/giris";
        }

        List<Uye> uyelikler = uyeRepository.findByUserId(user.getId());
        model.addAttribute("user", user);

        // Tüm üyeliklerden görevleri topla
        List<Gorev> tumGorevler = uyelikler.stream()
                .flatMap(uye -> gorevRepository.findByUyeId(uye.getId()).stream())
                .toList();
        model.addAttribute("gorevler", tumGorevler);
        model.addAttribute("bekleyenSayisi",
                tumGorevler.stream().filter(gorev -> "BEKLEMEDE".equals(gorev.getDurum())).count());
        model.addAttribute("devamEdenSayisi",
                tumGorevler.stream().filter(gorev -> "DEVAM".equals(gorev.getDurum())).count());
        model.addAttribute("tamamlananSayisi",
                tumGorevler.stream().filter(gorev -> "TAMAMLANDI".equals(gorev.getDurum())).count());

        return "gorevlerim";
    }

    // Görev durumu güncelleme
    @PostMapping("/gorev/{id}/durum")
    public String gorevDurumGuncelle(@PathVariable Long id, @RequestParam String durum) {
        Gorev gorev = gorevRepository.findById(id).orElse(null);
        if (gorev != null) {
            gorev.setDurum(durum);
            gorevRepository.save(gorev);
        }
        return "redirect:/panel/gorevlerim";
    }

    // Aidatlarım sayfası
    @GetMapping("/aidatlarim")
    public String aidatlarim(Authentication auth, Model model) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return "redirect:/giris";
        }

        List<Uye> uyelikler = uyeRepository.findByUserId(user.getId());
        model.addAttribute("user", user);

        // Tüm üyeliklerden aidatları topla
        List<Aidat> tumAidatlar = uyelikler.stream()
                .flatMap(uye -> aidatRepository.findByUyeId(uye.getId()).stream())
                .toList();
        model.addAttribute("aidatlar", tumAidatlar);
        BigDecimal bekleyenToplam = tumAidatlar.stream()
                .filter(aidat -> Boolean.FALSE.equals(aidat.getOdendi()))
                .map(Aidat::getTutar)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal odenenToplam = tumAidatlar.stream()
                .filter(aidat -> Boolean.TRUE.equals(aidat.getOdendi()))
                .map(Aidat::getTutar)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        model.addAttribute("bekleyenToplam", bekleyenToplam);
        model.addAttribute("odenenToplam", odenenToplam);

        return "aidatlarim";
    }

    // Etkinlikler sayfası
    @GetMapping("/etkinlikler")
    public String etkinlikler(Authentication auth, Model model) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return "redirect:/giris";
        }

        model.addAttribute("user", user);
        model.addAttribute("etkinlikler",
                etkinlikRepository.findByTarihAfterOrderByTarihAsc(LocalDate.now()));

        return "etkinlikler";
    }
}
