package com.example.kulup.controller;

import com.example.kulup.model.User;
import com.example.kulup.repository.UserRepository;
import com.example.kulup.service.MailServisi;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    private final UserRepository userRepository;
    private final MailServisi mailServisi;

    public AuthController(UserRepository userRepository, MailServisi mailServisi) {
        this.userRepository = userRepository;
        this.mailServisi = mailServisi;
    }

    @GetMapping("/giris")
    public String girisForm() {
        return "giris";
    }

    @GetMapping("/kayit")
    public String kayitForm() {
        return "kayit";
    }

    @PostMapping("/kayit")
    public String kayit(@RequestParam String email,
            @RequestParam String sifre,
            @RequestParam String adSoyad,
            Model model) {

        // Email kontrolü
        if (userRepository.existsByEmail(email)) {
            model.addAttribute("error", "Bu email adresi zaten kayıtlı!");
            return "kayit";
        }

        // Yeni kullanıcı oluştur (varsayılan rol: UYE)
        User user = new User(email, sifre, adSoyad, "UYE");
        userRepository.save(user);

        // Hoşgeldin maili gönder
        try {
            String mailBaslik = "Kulüp Takip Sistemine Hoşgeldiniz!";
            String mailMesaj = "Sayın " + adSoyad + ",\n\n" +
                    "Kulüp Takip Sistemine başarıyla kayıt oldunuz.\n\n" +
                    "Artık kulüplere katılabilir, etkinliklere katılabilir ve görevlerinizi takip edebilirsiniz.\n\n" +
                    "İyi günler dileriz.\n" +
                    "Kulüp Takip Ekibi";
            mailServisi.mailGonder(email, mailBaslik, mailMesaj);
            System.out.println("MAIL GÖNDERILDI: " + email);
        } catch (Exception mailEx) {
            System.err.println("MAIL GÖNDERILEMEDI: " + mailEx.getMessage());
        }

        model.addAttribute("success", "Kayıt başarılı! Giriş yapabilirsiniz.");
        return "giris";
    }
}
