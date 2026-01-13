package com.example.kulup.controller;

import com.example.kulup.model.Kulup;
import com.example.kulup.model.User;
import com.example.kulup.repository.AidatRepository;
import com.example.kulup.repository.EtkinlikRepository;
import com.example.kulup.repository.GorevRepository;
import com.example.kulup.repository.KulupRepository;
import com.example.kulup.repository.UserRepository;
import com.example.kulup.repository.UyeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private static final int PAGE_SIZE = 10;

    private final UserRepository userRepository;
    private final KulupRepository kulupRepository;
    private final UyeRepository uyeRepository;
    private final EtkinlikRepository etkinlikRepository;
    private final GorevRepository gorevRepository;
    private final AidatRepository aidatRepository;

    public AdminController(UserRepository userRepository,
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

    @GetMapping("/login")
    public String adminLogin() {
        return "admin-login";
    }

    @GetMapping("/panel")
    public String adminPanel(Model model) {
        model.addAttribute("toplamKulup", kulupRepository.count());
        model.addAttribute("toplamUye", uyeRepository.count());
        model.addAttribute("toplamEtkinlik", etkinlikRepository.count());
        model.addAttribute("bekleyenOnay", kulupRepository.countByAktif(false));

        return "admin-panel";
    }

    @GetMapping("/kulupler")
    public String adminKulupler(@RequestParam(defaultValue = "0") int kulupPage,
                                Model model) {
        int safeKulupPage = Math.max(0, kulupPage);

        Page<Kulup> kulupPageData = kulupRepository.findAll(
                PageRequest.of(safeKulupPage, PAGE_SIZE, Sort.by("id").ascending()));
        List<Kulup> onayBekleyenKulupler = kulupRepository.findByAktif(false);

        model.addAttribute("kulupler", kulupPageData.getContent());
        model.addAttribute("kulupPage", kulupPageData);
        model.addAttribute("onayBekleyenKulupler", onayBekleyenKulupler);

        return "admin-kulupler";
    }

    @GetMapping("/kullanicilar")
    public String adminKullanicilar(@RequestParam(defaultValue = "0") int userPage,
                                    Model model) {
        int safeUserPage = Math.max(0, userPage);

        Page<User> userPageData = userRepository.findAll(
                PageRequest.of(safeUserPage, PAGE_SIZE, Sort.by("id").ascending()));

        model.addAttribute("users", userPageData.getContent());
        model.addAttribute("userPage", userPageData);

        return "admin-kullanicilar";
    }

    // --- Kulüp Yönetimi ---
    
    @PostMapping("/kulup/{id}/onayla")
    public String kulupOnayla(@PathVariable Long id) {
        Kulup kulup = kulupRepository.findById(id).orElse(null);
        if (kulup != null) {
            kulup.setAktif(true);
            // Başkanın rolünü BASKAN yap
            if (kulup.getBaskan() != null) {
                kulup.getBaskan().setRole("BASKAN");
                userRepository.save(kulup.getBaskan());
            }
            kulupRepository.save(kulup);
        }
        return "redirect:/admin/kulupler";
    }

    @PostMapping("/kulup/{id}/reddet")
    public String kulupReddet(@PathVariable Long id) {
        kulupRepository.deleteById(id);
        return "redirect:/admin/kulupler";
    }

    @PostMapping("/kulup/{id}/sil")
    public String kulupSil(@PathVariable Long id) {
        kulupRepository.deleteById(id);
        return "redirect:/admin/kulupler";
    }

    // --- Kullanıcı Yönetimi ---
    
    @PostMapping("/user/{id}/rol-degistir")
    public String userRolDegistir(@PathVariable Long id, @RequestParam String rol) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null && !"ADMIN".equals(user.getRole())) {
            user.setRole(rol);
            userRepository.save(user);
        }
        return "redirect:/admin/kullanicilar";
    }

    @PostMapping("/user/{id}/sil")
    public String userSil(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null && !"ADMIN".equals(user.getRole())) {
            userRepository.deleteById(id);
        }
        return "redirect:/admin/kullanicilar";
    }
}
