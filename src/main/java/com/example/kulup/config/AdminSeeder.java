package com.example.kulup.config;

import com.example.kulup.model.User;
import com.example.kulup.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminSeeder {

    private static final String ADMIN_EMAIL = "admin@admin.com";
    private static final String ADMIN_PASSWORD = "admin";
    private static final String ADMIN_NAME = "Admin";

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository) {
        return args -> userRepository.findByEmail(ADMIN_EMAIL).ifPresentOrElse(user -> {
            boolean changed = false;
            if (!"ADMIN".equals(user.getRole())) {
                user.setRole("ADMIN");
                changed = true;
            }
            if (!ADMIN_PASSWORD.equals(user.getSifre())) {
                user.setSifre(ADMIN_PASSWORD);
                changed = true;
            }
            if (user.getAdSoyad() == null || user.getAdSoyad().isBlank()) {
                user.setAdSoyad(ADMIN_NAME);
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
            }
        }, () -> userRepository.save(new User(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, "ADMIN")));
    }
}
