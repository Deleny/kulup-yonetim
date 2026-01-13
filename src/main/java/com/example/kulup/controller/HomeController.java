package com.example.kulup.controller;

import com.example.kulup.model.Kulup;
import com.example.kulup.repository.KulupRepository;
import com.example.kulup.repository.EtkinlikRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.util.List;

@Controller
public class HomeController {

    private final KulupRepository kulupRepository;
    private final EtkinlikRepository etkinlikRepository;

    public HomeController(KulupRepository kulupRepository, EtkinlikRepository etkinlikRepository) {
        this.kulupRepository = kulupRepository;
        this.etkinlikRepository = etkinlikRepository;
    }

    @GetMapping("/")
    public String index(Model model) {
        // Aktif kulüpleri listele
        List<Kulup> aktifKulupler = kulupRepository.findByAktif(true);
        model.addAttribute("kulupler", aktifKulupler);
        
        // Yaklaşan etkinlikler
        model.addAttribute("yaklasanEtkinlikler", 
            etkinlikRepository.findByTarihAfterOrderByTarihAsc(LocalDate.now()));
        
        return "index";
    }
}
