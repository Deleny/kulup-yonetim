package com.example.kulup.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "gorevler")
public class Gorev {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String baslik;

    @Column(length = 1000)
    private String aciklama;

    private LocalDate sonTarih;

    @Column(nullable = false)
    private String durum = "BEKLEMEDE"; // BEKLEMEDE, DEVAM, TAMAMLANDI

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uye_id", nullable = false)
    private Uye uye;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etkinlik_id")
    private Etkinlik etkinlik;

    public Gorev() {
    }

    public Gorev(String baslik, String aciklama, LocalDate sonTarih, Uye uye, Etkinlik etkinlik) {
        this.baslik = baslik;
        this.aciklama = aciklama;
        this.sonTarih = sonTarih;
        this.uye = uye;
        this.etkinlik = etkinlik;
        this.durum = "BEKLEMEDE";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getBaslik() {
        return baslik;
    }

    public void setBaslik(String baslik) {
        this.baslik = baslik;
    }

    public String getAciklama() {
        return aciklama;
    }

    public void setAciklama(String aciklama) {
        this.aciklama = aciklama;
    }

    public LocalDate getSonTarih() {
        return sonTarih;
    }

    public void setSonTarih(LocalDate sonTarih) {
        this.sonTarih = sonTarih;
    }

    public String getDurum() {
        return durum;
    }

    public void setDurum(String durum) {
        this.durum = durum;
    }

    public Uye getUye() {
        return uye;
    }

    public void setUye(Uye uye) {
        this.uye = uye;
    }

    public Etkinlik getEtkinlik() {
        return etkinlik;
    }

    public void setEtkinlik(Etkinlik etkinlik) {
        this.etkinlik = etkinlik;
    }
}
