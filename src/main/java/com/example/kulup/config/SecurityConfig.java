package com.example.kulup.config;

import com.example.kulup.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    // CORS yapılandırması - Mobil uygulama için gerekli
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Admin SecurityFilterChain - öncelik 1
    @Bean
    @Order(1)
    public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/admin/**")
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/admin/login").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN"))
                .formLogin(form -> form
                        .loginPage("/admin/login")
                        .loginProcessingUrl("/admin/login")
                        .usernameParameter("email")
                        .passwordParameter("sifre")
                        .defaultSuccessUrl("/admin/panel", true)
                        .failureUrl("/admin/login?error=true")
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/admin/logout")
                        .logoutSuccessUrl("/giris"));

        return http.build();
    }

    // Başkan SecurityFilterChain - öncelik 2
    @Bean
    @Order(2)
    public SecurityFilterChain baskanSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/baskan/**")
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/baskan/**").hasRole("BASKAN"))
                .formLogin(form -> form
                        .loginPage("/giris")
                        .loginProcessingUrl("/giris")
                        .usernameParameter("email")
                        .passwordParameter("sifre")
                        .defaultSuccessUrl("/baskan/panel", true)
                        .failureUrl("/giris?error=true")
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/cikis")
                        .logoutSuccessUrl("/giris"));

        return http.build();
    }

    // User (Üye) SecurityFilterChain - öncelik 3
    @Bean
    @Order(3)
    public SecurityFilterChain userSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Herkese açık sayfalar
                        .requestMatchers("/", "/giris", "/kayit", "/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/ai/**").authenticated()
                        // Panel sayfaları - giriş yapmış kullanıcı gerekli
                        .requestMatchers("/panel/**").authenticated()
                        .requestMatchers("/cikis").authenticated()
                        .anyRequest().permitAll())
                .formLogin(form -> form
                        .loginPage("/giris")
                        .loginProcessingUrl("/giris")
                        .usernameParameter("email")
                        .passwordParameter("sifre")
                        .defaultSuccessUrl("/panel", true)
                        .failureUrl("/giris?error=true")
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/cikis")
                        .logoutSuccessUrl("/giris")
                        .permitAll());

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }

    @SuppressWarnings("deprecation")
    @Bean
    public PasswordEncoder passwordEncoder() {
        // NoOpPasswordEncoder kullanıyoruz - gerçek projede BCryptPasswordEncoder kullanılmalı
        return NoOpPasswordEncoder.getInstance();
    }
}
