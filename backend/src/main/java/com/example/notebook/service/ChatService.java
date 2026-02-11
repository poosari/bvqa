package com.example.notebook.service;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatLanguageModel chatLanguageModel;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    public ChatService(ChatLanguageModel chatLanguageModel, EmbeddingModel embeddingModel,
            EmbeddingStore<TextSegment> embeddingStore) {
        this.chatLanguageModel = chatLanguageModel;
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
    }

    public String chat(String documentId, String userMessage) {
        // RAG Retrieval
        // 1. Embed the user's query
        // 2. Search the vector store for relevant segments
        List<EmbeddingMatch<TextSegment>> relevant = embeddingStore.findRelevant(
                embeddingModel.embed(userMessage).content(),
                5 // Retrieve top 5 matches
        );

        String contextInfo = relevant.stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.joining("\n\n"));

        System.out.println("Retrieved " + relevant.size() + " segments for query: " + userMessage);

        SystemMessage systemMessage = SystemMessage.from("""
                You are a helpful AI assistant.
                Answer the user's question based strictly on the provided context.
                If the answer is not in the context, say "I don't see that in the document".

                Context:
                %s
                """.formatted(contextInfo));

        UserMessage userMsg = UserMessage.from(userMessage);

        Response<AiMessage> response = chatLanguageModel.generate(List.of(systemMessage, userMsg));
        return response.content().text();
    }
}
