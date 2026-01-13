package com.example.kulup.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "aidatlar")
public class Aidat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tutar;

    @Column(nullable = false)
    private String donem; // Örn: "2024-01", "2024-02"

    @Column(nullable = false)
    private Boolean odendi = false;

    private LocalDate odemeTarihi;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uye_id", nullable = false)
    @JsonIgnoreProperties({ "gorevler", "aidatlar", "kulup", "user", "hibernateLazyInitializer", "handler" })
    private Uye uye;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kulup_id", nullable = false)
    @JsonIgnoreProperties({ "uyeler", "etkinlikler", "aidatlar", "baskan", "hibernateLazyInitializer", "handler" })
    private Kulup kulup;

    public Aidat() {
    }

    public Aidat(BigDecimal tutar, String donem, Uye uye, Kulup kulup) {
        this.tutar = tutar;
        this.donem = donem;
        this.uye = uye;
        this.kulup = kulup;
        this.odendi = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public BigDecimal getTutar() {
        return tutar;
    }

    public void setTutar(BigDecimal tutar) {
        this.tutar = tutar;
    }

    public String getDonem() {
        return donem;
    }

    public void setDonem(String donem) {
        this.donem = donem;
    }

    public Boolean getOdendi() {
        return odendi;
    }

    public void setOdendi(Boolean odendi) {
        this.odendi = odendi;
    }

    public LocalDate getOdemeTarihi() {
        return odemeTarihi;
    }

    public void setOdemeTarihi(LocalDate odemeTarihi) {
        this.odemeTarihi = odemeTarihi;
    }

    public Uye getUye() {
        return uye;
    }

    public void setUye(Uye uye) {
        this.uye = uye;
    }

    public Kulup getKulup() {
        return kulup;
    }

    public void setKulup(Kulup kulup) {
        this.kulup = kulup;
    }
}
