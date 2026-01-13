package com.example.kulup.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "kulupler")
public class Kulup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ad;

    @Column(length = 1000)
    private String aciklama;

    private LocalDate kurulusTarihi;

    @Column(nullable = false)
    private Boolean aktif = false; // Admin onayı gerekli

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "baskan_id")
    @JsonIgnoreProperties({ "uyelikler", "sifre", "hibernateLazyInitializer", "handler" })
    private User baskan;

    @OneToMany(mappedBy = "kulup", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Uye> uyeler;

    @OneToMany(mappedBy = "kulup", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Etkinlik> etkinlikler;

    @OneToMany(mappedBy = "kulup", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Aidat> aidatlar;

    public Kulup() {
    }

    public Kulup(String ad, String aciklama, User baskan) {
        this.ad = ad;
        this.aciklama = aciklama;
        this.baskan = baskan;
        this.kurulusTarihi = LocalDate.now();
        this.aktif = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getAd() {
        return ad;
    }

    public void setAd(String ad) {
        this.ad = ad;
    }

    public String getAciklama() {
        return aciklama;
    }

    public void setAciklama(String aciklama) {
        this.aciklama = aciklama;
    }

    public LocalDate getKurulusTarihi() {
        return kurulusTarihi;
    }

    public void setKurulusTarihi(LocalDate kurulusTarihi) {
        this.kurulusTarihi = kurulusTarihi;
    }

    public Boolean getAktif() {
        return aktif;
    }

    public void setAktif(Boolean aktif) {
        this.aktif = aktif;
    }

    public User getBaskan() {
        return baskan;
    }

    public void setBaskan(User baskan) {
        this.baskan = baskan;
    }

    public List<Uye> getUyeler() {
        return uyeler;
    }

    public void setUyeler(List<Uye> uyeler) {
        this.uyeler = uyeler;
    }

    public List<Etkinlik> getEtkinlikler() {
        return etkinlikler;
    }

    public void setEtkinlikler(List<Etkinlik> etkinlikler) {
        this.etkinlikler = etkinlikler;
    }

    public List<Aidat> getAidatlar() {
        return aidatlar;
    }

    public void setAidatlar(List<Aidat> aidatlar) {
        this.aidatlar = aidatlar;
    }
}
