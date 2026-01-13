package com.example.kulup.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String sifre;

    @Column(nullable = false)
    private String adSoyad;

    @Column(nullable = false)
    private String role = "UYE"; // ADMIN, BASKAN, UYE

    // Expo Push Notification Token
    @Column(name = "expo_push_token")
    private String expoPushToken;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Uye> uyelikler;

    public User() {
    }

    public User(String email, String sifre, String adSoyad, String role) {
        this.email = email;
        this.sifre = sifre;
        this.adSoyad = adSoyad;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSifre() {
        return sifre;
    }

    public void setSifre(String sifre) {
        this.sifre = sifre;
    }

    public String getAdSoyad() {
        return adSoyad;
    }

    public void setAdSoyad(String adSoyad) {
        this.adSoyad = adSoyad;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getExpoPushToken() {
        return expoPushToken;
    }

    public void setExpoPushToken(String expoPushToken) {
        this.expoPushToken = expoPushToken;
    }

    public List<Uye> getUyelikler() {
        return uyelikler;
    }

    public void setUyelikler(List<Uye> uyelikler) {
        this.uyelikler = uyelikler;
    }
}
