package com.example.kulup.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "uyeler")
public class Uye {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ogrenciNo;

    private String telefon;

    @Column(nullable = false)
    private String pozisyon = "UYE"; // BASKAN, YONETICI, UYE

    private LocalDate kayitTarihi;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "uyelikler", "sifre", "hibernateLazyInitializer", "handler" })
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kulup_id", nullable = false)
    @JsonIgnoreProperties({ "uyeler", "etkinlikler", "aidatlar", "baskan", "hibernateLazyInitializer", "handler" })
    private Kulup kulup;

    @OneToMany(mappedBy = "uye", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Gorev> gorevler;

    @OneToMany(mappedBy = "uye", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Aidat> aidatlar;

    public Uye() {
    }

    public Uye(String ogrenciNo, String telefon, User user, Kulup kulup) {
        this.ogrenciNo = ogrenciNo;
        this.telefon = telefon;
        this.user = user;
        this.kulup = kulup;
        this.pozisyon = "UYE";
        this.kayitTarihi = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getOgrenciNo() {
        return ogrenciNo;
    }

    public void setOgrenciNo(String ogrenciNo) {
        this.ogrenciNo = ogrenciNo;
    }

    public String getTelefon() {
        return telefon;
    }

    public void setTelefon(String telefon) {
        this.telefon = telefon;
    }

    public String getPozisyon() {
        return pozisyon;
    }

    public void setPozisyon(String pozisyon) {
        this.pozisyon = pozisyon;
    }

    public LocalDate getKayitTarihi() {
        return kayitTarihi;
    }

    public void setKayitTarihi(LocalDate kayitTarihi) {
        this.kayitTarihi = kayitTarihi;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public List<Aidat> getAidatlar() {
        return aidatlar;
    }

    public void setAidatlar(List<Aidat> aidatlar) {
        this.aidatlar = aidatlar;
    }
}
