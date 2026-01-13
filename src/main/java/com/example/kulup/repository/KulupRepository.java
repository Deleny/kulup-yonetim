package com.example.kulup.repository;

import com.example.kulup.model.Kulup;
import com.example.kulup.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KulupRepository extends JpaRepository<Kulup, Long> {
    List<Kulup> findByAktif(Boolean aktif);
    long countByAktif(Boolean aktif);
    Optional<Kulup> findByBaskan(User baskan);
    List<Kulup> findByBaskanId(Long baskanId);
}
