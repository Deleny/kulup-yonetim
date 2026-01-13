package com.example.kulup.repository;

import com.example.kulup.model.Aidat;
import com.example.kulup.model.Uye;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AidatRepository extends JpaRepository<Aidat, Long> {
    List<Aidat> findByUye(Uye uye);
    List<Aidat> findByUyeId(Long uyeId);
    List<Aidat> findByKulupId(Long kulupId);
    Page<Aidat> findByKulupId(Long kulupId, Pageable pageable);
    List<Aidat> findByKulupIdAndOdendi(Long kulupId, Boolean odendi);
    List<Aidat> findByUyeIdAndOdendi(Long uyeId, Boolean odendi);
    
    @Query("SELECT SUM(a.tutar) FROM Aidat a WHERE a.kulup.id = ?1 AND a.odendi = true")
    java.math.BigDecimal sumOdenenByKulupId(Long kulupId);
    
    @Query("SELECT SUM(a.tutar) FROM Aidat a WHERE a.kulup.id = ?1 AND a.odendi = false")
    java.math.BigDecimal sumOdenmeyenByKulupId(Long kulupId);
}
