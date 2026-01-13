package com.example.kulup.repository;

import com.example.kulup.model.Etkinlik;
import com.example.kulup.model.Kulup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EtkinlikRepository extends JpaRepository<Etkinlik, Long> {
    List<Etkinlik> findByKulup(Kulup kulup);
    List<Etkinlik> findByKulupId(Long kulupId);
    Page<Etkinlik> findByKulupId(Long kulupId, Pageable pageable);
    List<Etkinlik> findByKulupIdAndDurum(Long kulupId, String durum);
    List<Etkinlik> findByTarihAfterOrderByTarihAsc(LocalDate tarih);
    List<Etkinlik> findByKulupIdAndTarihAfterOrderByTarihAsc(Long kulupId, LocalDate tarih);
}
