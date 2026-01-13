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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
import java.time.LocalTime;
import java.util.List;

@Controller
@RequestMapping("/baskan")
public class BaskanController {

    private static final int PAGE_SIZE = 10;

    private final UserRepository userRepository;
    private final KulupRepository kulupRepository;
    private final UyeRepository uyeRepository;
    private final EtkinlikRepository etkinlikRepository;
    private final GorevRepository gorevRepository;
    private final AidatRepository aidatRepository;

    public BaskanController(UserRepository userRepository,
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

    // Başkanın kulübünü bul
    private Kulup getBaskanKulup(Authentication auth) {
        if (auth == null) {
            return null;
        }
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user != null) {
            List<Kulup> kulupler = kulupRepository.findByBaskanId(user.getId());
            if (!kulupler.isEmpty()) {
                return kulupler.get(0);
            }
        }
        return null;
    }

    @GetMapping("/panel")
    public String baskanPanel(Authentication auth, Model model) {
        Kulup kulup = getBaskanKulup(auth);
        if (kulup == null) {
            return "redirect:/giris";
        }

        model.addAttribute("kulup", kulup);

        // Istatistikler
        model.addAttribute("toplamUye", uyeRepository.findByKulupId(kulup.getId()).size());
        model.addAttribute("toplamEtkinlik", etkinlikRepository.findByKulupId(kulup.getId()).size());
        model.addAttribute("odenenAidat", aidatRepository.sumOdenenByKulupId(kulup.getId()));
        model.addAttribute("bekleyenAidat", aidatRepository.sumOdenmeyenByKulupId(kulup.getId()));

        return "baskan-panel";
    }

    @GetMapping("/uyeler")
    public String baskanUyeler(Authentication auth,
                               @RequestParam(defaultValue = "0") int uyePage,
                               Model model) {
        Kulup kulup = getBaskanKulup(auth);
        if (kulup == null) {
            return "redirect:/giris";
        }

        int safeUyePage = Math.max(0, uyePage);
        Page<Uye> uyePageData = uyeRepository.findByKulupId(
                kulup.getId(), PageRequest.of(safeUyePage, PAGE_SIZE, Sort.by("id").ascending()));

        model.addAttribute("kulup", kulup);
        model.addAttribute("uyeler", uyePageData.getContent());
        model.addAttribute("uyePage", uyePageData);
        model.addAttribute("tumUsers", userRepository.findAll());

        return "baskan-uyeler";
    }

    @GetMapping("/etkinlikler")
    public String baskanEtkinlikler(Authentication auth,
                                    @RequestParam(defaultValue = "0") int etkinlikPage,
                                    Model model) {
        Kulup kulup = getBaskanKulup(auth);
        if (kulup == null) {
            return "redirect:/giris";
        }

        int safeEtkinlikPage = Math.max(0, etkinlikPage);
        Page<Etkinlik> etkinlikPageData = etkinlikRepository.findByKulupId(
                kulup.getId(), PageRequest.of(safeEtkinlikPage, PAGE_SIZE, Sort.by("id").ascending()));

        model.addAttribute("kulup", kulup);
        model.addAttribute("etkinlikler", etkinlikPageData.getContent());
        model.addAttribute("etkinlikPage", etkinlikPageData);

        return "baskan-etkinlikler";
    }

    @GetMapping("/gorevler")
    public String baskanGorevler(Authentication auth,
                                 @RequestParam(defaultValue = "0") int gorevPage,
                                 Model model) {
        Kulup kulup = getBaskanKulup(auth);
        if (kulup == null) {
            return "redirect:/giris";
        }

        int safeGorevPage = Math.max(0, gorevPage);
        Page<Gorev> gorevPageData = gorevRepository.findByUye_Kulup_Id(
                kulup.getId(), PageRequest.of(safeGorevPage, PAGE_SIZE, Sort.by("id").ascending()));

        model.addAttribute("kulup", kulup);
        model.addAttribute("gorevler", gorevPageData.getContent());
        model.addAttribute("gorevPage", gorevPageData);
        model.addAttribute("uyeler", uyeRepository.findByKulupId(kulup.getId()));
        model.addAttribute("etkinlikler", etkinlikRepository.findByKulupId(kulup.getId()));

        return "baskan-gorevler";
    }

    @GetMapping("/aidatlar")
    public String baskanAidatlar(Authentication auth,
                                 @RequestParam(defaultValue = "0") int aidatPage,
                                 Model model) {
        Kulup kulup = getBaskanKulup(auth);
        if (kulup == null) {
            return "redirect:/giris";
        }

        int safeAidatPage = Math.max(0, aidatPage);
        Page<Aidat> aidatPageData = aidatRepository.findByKulupId(
                kulup.getId(), PageRequest.of(safeAidatPage, PAGE_SIZE, Sort.by("id").ascending()));

        model.addAttribute("kulup", kulup);
        model.addAttribute("aidatlar", aidatPageData.getContent());
        model.addAttribute("aidatPage", aidatPageData);
        model.addAttribute("uyeler", uyeRepository.findByKulupId(kulup.getId()));

        return "baskan-aidatlar";
    }
// --- Üye Yönetimi ---
    
    @PostMapping("/uye-ekle")
    public String uyeEkle(Authentication auth,
                          @RequestParam Long userId,
                          @RequestParam String ogrenciNo,
                          @RequestParam(required = false) String telefon) {
        Kulup kulup = getBaskanKulup(auth);
        User user = userRepository.findById(userId).orElse(null);
        
        if (kulup != null && user != null && !uyeRepository.existsByUserAndKulup(user, kulup)) {
            Uye uye = new Uye(ogrenciNo, telefon, user, kulup);
            uyeRepository.save(uye);
        }
        return "redirect:/baskan/uyeler";
    }

    @PostMapping("/uye/{id}/pozisyon-degistir")
    public String uyePozisyonDegistir(@PathVariable Long id, @RequestParam String pozisyon) {
        Uye uye = uyeRepository.findById(id).orElse(null);
        if (uye != null) {
            uye.setPozisyon(pozisyon);
            uyeRepository.save(uye);
        }
        return "redirect:/baskan/uyeler";
    }

    @PostMapping("/uye/{id}/sil")
    public String uyeSil(Authentication auth, @PathVariable Long id) {
        Kulup kulup = getBaskanKulup(auth);
        Uye uye = uyeRepository.findById(id).orElse(null);
        if (kulup != null && uye != null && uye.getKulup() != null
            && kulup.getId().equals(uye.getKulup().getId())) {
            if (kulup.getBaskan() != null && uye.getUser() != null
                && kulup.getBaskan().getId().equals(uye.getUser().getId())) {
                return "redirect:/baskan/uyeler";
            }
            uyeRepository.deleteById(id);
        }
        return "redirect:/baskan/uyeler";
    }

    // --- Etkinlik Yönetimi ---
    
    @PostMapping("/etkinlik-ekle")
    public String etkinlikEkle(Authentication auth,
                               @RequestParam String baslik,
                               @RequestParam String aciklama,
                               @RequestParam String tarih,
                               @RequestParam String saat,
                               @RequestParam String konum) {
        Kulup kulup = getBaskanKulup(auth);
        if (kulup != null) {
            Etkinlik etkinlik = new Etkinlik(
                baslik, 
                aciklama, 
                LocalDate.parse(tarih), 
                LocalTime.parse(saat), 
                konum, 
                kulup
            );
            etkinlikRepository.save(etkinlik);
        }
        return "redirect:/baskan/etkinlikler";
    }

    @PostMapping("/etkinlik/{id}/durum-degistir")
    public String etkinlikDurumDegistir(@PathVariable Long id, @RequestParam String durum) {
        Etkinlik etkinlik = etkinlikRepository.findById(id).orElse(null);
        if (etkinlik != null) {
            etkinlik.setDurum(durum);
            etkinlikRepository.save(etkinlik);
        }
        return "redirect:/baskan/etkinlikler";
    }

    @PostMapping("/etkinlik/{id}/sil")
    public String etkinlikSil(@PathVariable Long id) {
        etkinlikRepository.deleteById(id);
        return "redirect:/baskan/etkinlikler";
    }

    // --- Görev Yönetimi ---
    
    @PostMapping("/gorev-ekle")
    public String gorevEkle(@RequestParam String baslik,
                            @RequestParam String aciklama,
                            @RequestParam String sonTarih,
                            @RequestParam Long uyeId,
                            @RequestParam(required = false) Long etkinlikId,
                            Authentication auth) {
        Kulup kulup = getBaskanKulup(auth);
        Uye uye = uyeRepository.findById(uyeId).orElse(null);
        Etkinlik etkinlik = (etkinlikId != null && etkinlikId > 0) ? etkinlikRepository.findById(etkinlikId).orElse(null) : null;
        
        if (kulup != null && uye != null && uye.getKulup() != null
            && kulup.getId().equals(uye.getKulup().getId())) {
            if (etkinlik != null && etkinlik.getKulup() != null
                && !kulup.getId().equals(etkinlik.getKulup().getId())) {
                etkinlik = null;
            }
            Gorev gorev = new Gorev(baslik, aciklama, LocalDate.parse(sonTarih), uye, etkinlik);
            gorevRepository.save(gorev);
        }
        return "redirect:/baskan/gorevler";
    }

    @PostMapping("/gorev/{id}/durum-degistir")
    public String gorevDurumDegistir(@PathVariable Long id, @RequestParam String durum) {
        Gorev gorev = gorevRepository.findById(id).orElse(null);
        if (gorev != null) {
            gorev.setDurum(durum);
            gorevRepository.save(gorev);
        }
        return "redirect:/baskan/gorevler";
    }

    @PostMapping("/gorev/{id}/sil")
    public String gorevSil(@PathVariable Long id) {
        gorevRepository.deleteById(id);
        return "redirect:/baskan/gorevler";
    }

    // --- Aidat Yönetimi ---
    
    @PostMapping("/aidat-ekle")
    public String aidatEkle(Authentication auth,
                            @RequestParam Long uyeId,
                            @RequestParam String tutar,
                            @RequestParam String donem) {
        Kulup kulup = getBaskanKulup(auth);
        Uye uye = uyeRepository.findById(uyeId).orElse(null);
        
        if (kulup != null && uye != null && uye.getKulup() != null
            && kulup.getId().equals(uye.getKulup().getId())) {
            try {
                String normalizedTutar = tutar.replace(",", ".");
                Aidat aidat = new Aidat(new BigDecimal(normalizedTutar), donem, uye, kulup);
                aidatRepository.save(aidat);
            } catch (NumberFormatException ignored) {
                return "redirect:/baskan/aidatlar";
            }
        }
        return "redirect:/baskan/aidatlar";
    }

    @PostMapping("/aidat/{id}/odendi")
    public String aidatOdendi(@PathVariable Long id) {
        Aidat aidat = aidatRepository.findById(id).orElse(null);
        if (aidat != null) {
            aidat.setOdendi(true);
            aidat.setOdemeTarihi(LocalDate.now());
            aidatRepository.save(aidat);
        }
        return "redirect:/baskan/aidatlar";
    }

    @PostMapping("/aidat/{id}/sil")
    public String aidatSil(@PathVariable Long id) {
        aidatRepository.deleteById(id);
        return "redirect:/baskan/aidatlar";
    }

    // Kulup silme (sadece baskan)
    @PostMapping("/kulup/{id}/sil")
    public String kulupSil(Authentication auth, @PathVariable Long id) {
        Kulup kulup = getBaskanKulup(auth);
        if (kulup != null && kulup.getId().equals(id)) {
            kulupRepository.delete(kulup);
            return "redirect:/panel";
        }
        return "redirect:/baskan/panel";
    }
}
