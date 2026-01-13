package com.example.kulup.controller;

import com.example.kulup.model.Aidat;
import com.example.kulup.model.Etkinlik;
import com.example.kulup.model.Gorev;
import com.example.kulup.model.Kulup;
import com.example.kulup.model.Uye;
import com.example.kulup.repository.AidatRepository;
import com.example.kulup.repository.EtkinlikRepository;
import com.example.kulup.repository.GorevRepository;
import com.example.kulup.repository.KulupRepository;
import com.example.kulup.repository.UyeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    public ApiController(KulupRepository kulupRepository,
                         UyeRepository uyeRepository,
                         EtkinlikRepository etkinlikRepository,
                         GorevRepository gorevRepository,
                         AidatRepository aidatRepository) {
        this.kulupRepository = kulupRepository;
        this.uyeRepository = uyeRepository;
        this.etkinlikRepository = etkinlikRepository;
        this.gorevRepository = gorevRepository;
        this.aidatRepository = aidatRepository;
    }

    // Kulüpler
    @GetMapping("/kulupler")
    public List<Kulup> getKulupler() {
        return kulupRepository.findByAktif(true);
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
        return uyeRepository.findByKulupId(kulupId);
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
}
