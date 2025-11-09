package com.aipowered.knowledge.hub.controller;

import com.aipowered.knowledge.hub.model.DocumentSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://ai-research-knowledge-hub.fly.dev")
            .build();

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentSummary> uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        LinkedMultiValueMap<String, Object> multipartData = new LinkedMultiValueMap<>();

        multipartData.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        DocumentSummary response = webClient.post()
                .uri("/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipartData))
                .retrieve()
                .bodyToMono(DocumentSummary.class)
                .block();

        return ResponseEntity.ok(response);
    }
}

