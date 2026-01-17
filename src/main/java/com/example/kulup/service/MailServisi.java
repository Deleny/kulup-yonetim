package com.example.kulup.service;

import com.example.kulup.dto.MailDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class MailServisi {

    private final WebClient webClient;

    public MailServisi(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    public void mailGonder(String email, String baslik, String mesaj) {
        MailDTO dto = new MailDTO();
        dto.setEmail(email);
        dto.setBaslik(baslik);
        dto.setMesaj(mesaj);

        webClient.post()
                .uri("/send-mail")
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(res -> System.out.println("MAIL OK: " + res))
                .doOnError(err -> System.err.println("MAIL ERROR: " + err.getMessage()))
                .subscribe();
    }
}
