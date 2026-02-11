package com.example.notebook.controller;

import com.example.notebook.service.ChatService;
import com.example.notebook.service.DocumentService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular dev server
public class NotebookController {

    private final DocumentService documentService;
    private final ChatService chatService;

    public NotebookController(DocumentService documentService, ChatService chatService) {
        this.documentService = documentService;
        this.chatService = chatService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadDocument(@RequestParam("file") MultipartFile file)
            throws IOException {
        String id = documentService.uploadDocument(file);
        return ResponseEntity.ok(Map.of("id", id, "filename", file.getOriginalFilename()));
    }

    @GetMapping("/documents")
    public ResponseEntity<Map<String, String>> getDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest request) {
        String response = chatService.chat(request.getDocumentId(), request.getMessage());
        return ResponseEntity.ok(Map.of("response", response));
    }

    public static class ChatRequest {
        private String documentId;
        private String message;

        public String getDocumentId() {
            return documentId;
        }

        public void setDocumentId(String documentId) {
            this.documentId = documentId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
