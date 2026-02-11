package com.example.notebook.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("${app.ai.provider}")
    private String aiProvider;

    @Value("${langchain4j.ollama.chat-model.base-url}")
    private String ollamaBaseUrl;

    @Value("${langchain4j.ollama.chat-model.model-name}")
    private String ollamaModelName;

    @Value("${langchain4j.google-ai-gemini.chat-model.api-key}")
    private String googleAiKey;

    @Value("${langchain4j.google-ai-gemini.chat-model.model-name}")
    private String googleAiModelName;

    @Value("${langchain4j.open-ai.chat-model.api-key}")
    private String openAiKey;

    @Value("${langchain4j.open-ai.chat-model.model-name}")
    private String openAiModelName;

    @Bean
    ChatLanguageModel chatLanguageModel() {
        if ("gemini".equalsIgnoreCase(aiProvider)) {
            return GoogleAiGeminiChatModel.builder()
                    .apiKey(googleAiKey)
                    .modelName(googleAiModelName)
                    .build();
        } else if ("openai".equalsIgnoreCase(aiProvider)) {
            return OpenAiChatModel.builder()
                    .apiKey(openAiKey)
                    .modelName(openAiModelName)
                    .build();
        } else {
            // Default to Ollama
            return OllamaChatModel.builder()
                    .baseUrl(ollamaBaseUrl)
                    .modelName(ollamaModelName)
                    .build();
        }
    }

    @Bean
    EmbeddingModel embeddingModel() {
        return new AllMiniLmL6V2EmbeddingModel();
    }

    @Bean
    EmbeddingStore<TextSegment> embeddingStore() {
        return new InMemoryEmbeddingStore<>();
    }
}
