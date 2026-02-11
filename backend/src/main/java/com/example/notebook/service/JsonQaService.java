package com.example.notebook.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Parses structured JSON Q&A files and converts them into text for embedding.
 *
 * Supported JSON formats:
 *
 * Format 1 - Array of Q&A objects:
 * [
 * { "question": "What is X?", "answer": "X is ..." },
 * { "question": "Who was Y?", "answer": "Y was ..." }
 * ]
 *
 * Format 2 - Object with "qa" or "questions" array:
 * {
 * "title": "My Q&A Set",
 * "qa": [
 * { "question": "...", "answer": "..." }
 * ]
 * }
 */
@Service
public class JsonQaService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String extractText(File file) throws IOException {
        return parseJsonQa(objectMapper.readValue(file, Object.class));
    }

    public String extractText(byte[] content) throws IOException {
        return parseJsonQa(objectMapper.readValue(content, Object.class));
    }

    @SuppressWarnings("unchecked")
    private String parseJsonQa(Object parsed) {
        StringBuilder sb = new StringBuilder();

        if (parsed instanceof List) {
            // Format 1: top-level array of Q&A objects
            List<Map<String, Object>> qaList = (List<Map<String, Object>>) parsed;
            appendQaList(sb, qaList);
        } else if (parsed instanceof Map) {
            Map<String, Object> root = (Map<String, Object>) parsed;

            // Check for title
            if (root.containsKey("title")) {
                sb.append("Title: ").append(root.get("title")).append("\n\n");
            }

            // Look for Q&A array under common keys
            Object qaData = root.getOrDefault("qa",
                    root.getOrDefault("questions",
                            root.getOrDefault("data",
                                    root.getOrDefault("items", null))));

            if (qaData instanceof List) {
                List<Map<String, Object>> qaList = (List<Map<String, Object>>) qaData;
                appendQaList(sb, qaList);
            } else {
                // Fallback: treat entire JSON as flat key-value text
                for (Map.Entry<String, Object> entry : root.entrySet()) {
                    sb.append(entry.getKey()).append(": ").append(entry.getValue()).append("\n\n");
                }
            }
        }

        return sb.toString();
    }

    private void appendQaList(StringBuilder sb, List<Map<String, Object>> qaList) {
        for (int i = 0; i < qaList.size(); i++) {
            Map<String, Object> qa = qaList.get(i);
            String question = String.valueOf(qa.getOrDefault("question", qa.getOrDefault("q", "")));
            String answer = String.valueOf(qa.getOrDefault("answer", qa.getOrDefault("a", "")));

            sb.append("Q: ").append(question).append("\n");
            sb.append("A: ").append(answer).append("\n\n");
        }
    }
}
