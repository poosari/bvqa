package com.example.notebook.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class DirectoryWatcherService {

    private final DocumentService documentService;

    @Value("${app.ingestion.input-dir:./documents_in}")
    private String inputDir;

    @Value("${app.ingestion.processed-dir:./documents_processed}")
    private String processedDir;

    public DirectoryWatcherService(DocumentService documentService) {
        this.documentService = documentService;
    }

    @Scheduled(fixedDelay = 5000)
    public void processFiles() {
        File folder = new File(inputDir);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        File processedFolder = new File(processedDir);
        if (!processedFolder.exists()) {
            processedFolder.mkdirs();
        }

        File[] files = folder.listFiles((dir, name) -> {
            String lower = name.toLowerCase();
            return lower.endsWith(".pdf") || lower.endsWith(".json");
        });
        if (files != null) {
            for (File file : files) {
                try {
                    System.out.println("Processing file: " + file.getName());
                    documentService.ingestFile(file);
                    moveFile(file, processedFolder);
                } catch (IOException e) {
                    System.err.println("Error processing file: " + file.getName());
                    e.printStackTrace();
                }
            }
        }
    }

    private void moveFile(File file, File destDir) throws IOException {
        Path sourcePath = file.toPath();
        Path destPath = Paths.get(destDir.getAbsolutePath(), file.getName());
        Files.move(sourcePath, destPath, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("Moved file to: " + destPath);
    }
}
