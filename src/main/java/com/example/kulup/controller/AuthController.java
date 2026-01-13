package com.example.kulup.controller;

import com.example.kulup.model.User;
import com.example.kulup.repository.UserRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        model.addAttribute("success", "Kayıt başarılı! Giriş yapabilirsiniz.");
        return "giris";
    }
}
