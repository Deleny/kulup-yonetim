package com.example.kulup.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "etkinlikler")
public class Etkinlik {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String baslik;

    @Column(length = 2000)
    private String aciklama;

    private LocalDate tarih;

    private LocalTime saat;

    private String konum;

    @Column(nullable = false)
    private String durum = "AKTIF"; // AKTIF, TAMAMLANDI, IPTAL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kulup_id", nullable = false)
    private Kulup kulup;

    @OneToMany(mappedBy = "etkinlik", cascade = CascadeType.ALL)
    private List<Gorev> gorevler;

    public Etkinlik() {
    }

    public Etkinlik(String baslik, String aciklama, LocalDate tarih, LocalTime saat, String konum, Kulup kulup) {
        this.baslik = baslik;
        this.aciklama = aciklama;
        this.tarih = tarih;
        this.saat = saat;
        this.konum = konum;
        this.kulup = kulup;
        this.durum = "AKTIF";
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

    public LocalDate getTarih() {
        return tarih;
    }

    public void setTarih(LocalDate tarih) {
        this.tarih = tarih;
    }

    public LocalTime getSaat() {
        return saat;
    }

    public void setSaat(LocalTime saat) {
        this.saat = saat;
    }

    public String getKonum() {
        return konum;
    }

    public void setKonum(String konum) {
        this.konum = konum;
    }

    public String getDurum() {
        return durum;
    }

    public void setDurum(String durum) {
        this.durum = durum;
    }

    public Kulup getKulup() {
        return kulup;
    }

    public void setKulup(Kulup kulup) {
        this.kulup = kulup;
    }

    public List<Gorev> getGorevler() {
        return gorevler;
    }

    public void setGorevler(List<Gorev> gorevler) {
        this.gorevler = gorevler;
    }
}
