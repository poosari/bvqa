package com.example.notebook.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DocumentService {

    private final PdfService pdfService;
    private final JsonQaService jsonQaService;
    private final EmbeddingService embeddingService;
    // In-memory storage: Document ID -> Extracted Text
    private final Map<String, String> documentStore = new ConcurrentHashMap<>();
    // In-memory metadata: Document ID -> Filename
    private final Map<String, String> documentMetadata = new ConcurrentHashMap<>();

    public DocumentService(PdfService pdfService, JsonQaService jsonQaService, EmbeddingService embeddingService) {
        this.pdfService = pdfService;
        this.jsonQaService = jsonQaService;
        this.embeddingService = embeddingService;
    }

    public String uploadDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        String text;
        if (filename != null && filename.toLowerCase().endsWith(".json")) {
            text = jsonQaService.extractText(file.getBytes());
        } else {
            text = pdfService.extractText(file);
        }
        String id = UUID.randomUUID().toString();
        documentStore.put(id, text);
        documentMetadata.put(id, filename);
        embeddingService.ingestDocument(text);
        return id;
    }

    public String ingestFile(java.io.File file) throws IOException {
        String text;
        if (file.getName().toLowerCase().endsWith(".json")) {
            text = jsonQaService.extractText(file);
        } else {
            text = pdfService.extractText(file);
        }
        String id = UUID.randomUUID().toString();
        documentStore.put(id, text);
        documentMetadata.put(id, file.getName());
        embeddingService.ingestDocument(text);
        return id;
    }

    public String getDocumentText(String id) {
        return documentStore.get(id);
    }

    public String getDocumentName(String id) {
        return documentMetadata.get(id);
    }

    public Map<String, String> getAllDocuments() {
        return documentMetadata;
    }
}
