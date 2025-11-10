package com.aipowered.knowledge.hub.resolver;

import com.aipowered.knowledge.hub.model.Answer;
import com.aipowered.knowledge.hub.model.AskQuestionInput;
import com.aipowered.knowledge.hub.model.DocumentSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentMutationResolver {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://ai-research-knowledge-hub.fly.dev")
            .build();


    @QueryMapping
    public Answer askQuestion(@Argument AskQuestionInput input) {
        return webClient.post()
                .uri("/query")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(input))
                .retrieve()
                .bodyToMono(Answer.class)
                .block();
    }
}
