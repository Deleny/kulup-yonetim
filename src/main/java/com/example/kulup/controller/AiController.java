package com.example.kulup.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/ai")
public class AiController {

    private static final Logger logger = LoggerFactory.getLogger(AiController.class);
    private static final List<String> MODEL_FALLBACKS = List.of(
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro"
    );

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiBase;
    private final String apiVersion;
    private final String apiModel;

    public AiController(ObjectMapper objectMapper,
                        RestTemplateBuilder restTemplateBuilder,
                        @Value("${gemini.api.key:}") String apiKey,
                        @Value("${gemini.api.base:https://generativelanguage.googleapis.com}") String apiBase,
                        @Value("${gemini.api.version:v1beta}") String apiVersion,
                        @Value("${gemini.api.model:gemini-1.5-flash-latest}") String apiModel) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder.build();
        this.apiKey = apiKey;
        this.apiBase = apiBase;
        this.apiVersion = apiVersion;
        this.apiModel = apiModel;
    }

    @PostMapping("/club-description")
    public Map<String, String> clubDescription(@RequestBody Map<String, String> payload) {
        String clubName = payload.getOrDefault("clubName", "").trim();
        String prompt = "Kulup adi: " + clubName + ". "
                + "2-3 cumlelik kisa ve net bir kulup aciklamasi yaz. "
                + "Sadece aciklama metnini ver.";
        String text = generateText(prompt);
        return Map.of("description", text);
    }

    @PostMapping("/event-suggestion")
    public Map<String, String> eventSuggestion(@RequestBody Map<String, String> payload) {
        String clubName = payload.getOrDefault("clubName", "").trim();
        String prompt = "Bir universite kulubu icin etkinlik onerisi ver. "
                + "Kulup adi: " + clubName + ". "
                + "Cevabi sadece JSON olarak ver: "
                + "{\"title\":\"...\",\"description\":\"...\",\"location\":\"...\"}.";
        String text = generateText(prompt);
        Map<String, String> parsed = parseJsonSuggestion(text);
        if (parsed.isEmpty()) {
            parsed = new HashMap<>();
            parsed.put("title", "Etkinlik Onerisi");
            parsed.put("description", text);
            parsed.put("location", "");
        }
        return parsed;
    }

    @PostMapping("/assistant")
    public Map<String, String> assistant(@RequestBody Map<String, String> payload) {
        String message = payload.getOrDefault("message", "").trim();
        String prompt = "Sen Kulup Yonetimi sitesinin yapay zeka asistanisin. "
                + "Kisa ve net cevap ver. "
                + "Sadece site ozellikleri, roller (Uye/Baskan/Admin), "
                + "kulup uyeligi, etkinlikler, gorevler ve aidatlar hakkinda bilgi ver. "
                + "Site disi sorulari nazikce reddet. "
                + "Soru: " + message;
        String text = generateText(prompt);
        return Map.of("reply", text);
    }

    private String generateText(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI ayari yapilmamis. Yoneticiye bildirin.";
        }

        Set<String> versions = buildVersions(apiVersion);
        List<String> models = buildModels();
        Set<String> tried = new LinkedHashSet<>();

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("role", "user", "parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        String json;
        try {
            json = objectMapper.writeValueAsString(body);
        } catch (Exception ex) {
            return "AI istegi hazirlanamadi.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(json, headers);

        for (String version : versions) {
            for (String model : models) {
                String key = version + ":" + model;
                if (tried.contains(key)) {
                    continue;
                }
                tried.add(key);
                String text = callGenerate(version, model, entity);
                if (text != null && !text.isBlank()) {
                    return text;
                }
            }
        }

        for (String version : versions) {
            List<String> available = fetchModels(version);
            for (String modelName : available) {
                String model = stripModelPrefix(modelName);
                if (model.isBlank()) {
                    continue;
                }
                String key = version + ":" + model;
                if (tried.contains(key)) {
                    continue;
                }
                tried.add(key);
                String text = callGenerate(version, model, entity);
                if (text != null && !text.isBlank()) {
                    return text;
                }
            }
        }

        return "AI modeli bulunamadi. API ayarlarini kontrol edin.";
    }

    private Set<String> buildVersions(String preferred) {
        Set<String> versions = new LinkedHashSet<>();
        if (preferred != null && !preferred.isBlank()) {
            versions.add(preferred.trim());
        }
        versions.add("v1");
        versions.add("v1beta");
        return versions;
    }

    private List<String> buildModels() {
        List<String> models = new ArrayList<>();
        if (apiModel != null && !apiModel.isBlank()) {
            models.add(apiModel.trim());
        }
        for (String fallback : MODEL_FALLBACKS) {
            if (!models.contains(fallback)) {
                models.add(fallback);
            }
        }
        return models;
    }

    private String callGenerate(String version, String model, HttpEntity<String> entity) {
        String url = apiBase + "/" + version + "/models/" + model + ":generateContent?key=" + apiKey;
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            String text = extractText(response.getBody());
            return text == null || text.isBlank() ? null : text;
        } catch (RestClientResponseException ex) {
            if (ex.getRawStatusCode() == 404) {
                logger.warn("AI model not found: {} {}", version, model);
                return null;
            }
            logger.warn("AI error status {} body {}", ex.getRawStatusCode(), ex.getResponseBodyAsString());
            return "AI servis hatasi (" + ex.getRawStatusCode() + ").";
        } catch (ResourceAccessException ex) {
            logger.warn("AI network error", ex);
            return "AI servisine ulasilamadi.";
        } catch (Exception ex) {
            logger.warn("AI unexpected error", ex);
            return "Su an yanit veremiyorum. Daha sonra tekrar deneyin.";
        }
    }

    @GetMapping("/models")
    public Map<String, Object> listModels(@RequestParam(required = false) String version) {
        Set<String> versions = buildVersions(version);
        Map<String, Object> response = new HashMap<>();
        for (String ver : versions) {
            response.put(ver, fetchModels(ver));
        }
        return response;
    }

    private List<String> fetchModels(String version) {
        if (apiKey == null || apiKey.isBlank()) {
            return List.of();
        }
        String url = apiBase + "/" + version + "/models?key=" + apiKey;
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return extractModelNames(response.getBody());
        } catch (RestClientResponseException ex) {
            logger.warn("AI model list error {} body {}", ex.getRawStatusCode(), ex.getResponseBodyAsString());
            return List.of();
        } catch (Exception ex) {
            logger.warn("AI model list error", ex);
            return List.of();
        }
    }

    private List<String> extractModelNames(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return List.of();
        }
        List<String> names = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode models = root.path("models");
            if (models.isArray()) {
                for (JsonNode model : models) {
                    JsonNode methods = model.path("supportedGenerationMethods");
                    boolean ok = false;
                    if (methods.isArray()) {
                        for (JsonNode method : methods) {
                            if ("generateContent".equalsIgnoreCase(method.asText(""))) {
                                ok = true;
                                break;
                            }
                        }
                    }
                    if (ok) {
                        String name = model.path("name").asText("");
                        if (!name.isBlank()) {
                            names.add(name);
                        }
                    }
                }
            }
        } catch (Exception ex) {
            return List.of();
        }
        return names;
    }

    private String stripModelPrefix(String name) {
        if (name == null) {
            return "";
        }
        String trimmed = name.trim();
        return trimmed.startsWith("models/") ? trimmed.substring("models/".length()) : trimmed;
    }

    private String extractText(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "";
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");
            return textNode.isMissingNode() ? "" : textNode.asText("").trim();
        } catch (Exception ex) {
            return "";
        }
    }

    private Map<String, String> parseJsonSuggestion(String text) {
        Map<String, String> result = new HashMap<>();
        if (text == null) {
            return result;
        }
        String cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace("```json", "").replace("```", "").trim();
        }
        try {
            JsonNode node = objectMapper.readTree(cleaned);
            result.put("title", node.path("title").asText(""));
            result.put("description", node.path("description").asText(""));
            result.put("location", node.path("location").asText(""));
        } catch (Exception ignored) {
            return new HashMap<>();
        }
        return result;
    }
}
