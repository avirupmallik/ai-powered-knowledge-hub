package com.aipowered.knowledge.hub.model;

public record AskQuestionInput(String question , int topK , String systemPrompt) {
}
