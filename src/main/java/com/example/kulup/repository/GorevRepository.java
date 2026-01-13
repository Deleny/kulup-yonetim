package com.example.kulup.repository;

import com.example.kulup.model.Gorev;
import com.example.kulup.model.Uye;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GorevRepository extends JpaRepository<Gorev, Long> {
    List<Gorev> findByUye(Uye uye);
    List<Gorev> findByUyeId(Long uyeId);
    List<Gorev> findByUyeIdAndDurum(Long uyeId, String durum);
    List<Gorev> findByEtkinlikId(Long etkinlikId);
    List<Gorev> findByUye_Kulup_Id(Long kulupId);
    Page<Gorev> findByUye_Kulup_Id(Long kulupId, Pageable pageable);
}
