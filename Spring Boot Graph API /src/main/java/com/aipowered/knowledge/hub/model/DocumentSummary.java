package com.aipowered.knowledge.hub.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Set;

public record DocumentSummary(String filename,
                              String summary,
                              @JsonProperty("key_terms")
                              Set<KeyTerm> keyTerms,
                              @JsonProperty("qa_pairs")
                              Set<Question> questions) {
}
