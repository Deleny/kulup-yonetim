package com.example.kulup.repository;

import com.example.kulup.model.Kulup;
import com.example.kulup.model.User;
import com.example.kulup.model.Uye;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UyeRepository extends JpaRepository<Uye, Long> {
    List<Uye> findByKulup(Kulup kulup);
    List<Uye> findByKulupId(Long kulupId);
    Page<Uye> findByKulupId(Long kulupId, Pageable pageable);
    List<Uye> findByUser(User user);
    List<Uye> findByUserId(Long userId);
    Optional<Uye> findByUserAndKulup(User user, Kulup kulup);
    boolean existsByUserAndKulup(User user, Kulup kulup);
}
