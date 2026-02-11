# BVQA Backend

Spring Boot REST API that provides the core RAG (Retrieval-Augmented Generation) pipeline for document-based Q&A using local LLMs.

## Tech Stack

| Component | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 3.2.3 |
| AI Framework | LangChain4j | 0.35.0 |
| Embeddings | AllMiniLmL6V2 (ONNX, local) | — |
| LLM | Ollama (gemma3:12b default) | — |
| PDF Parsing | Apache PDFBox | 2.0.29 |
| JSON Parsing | Jackson (Spring default) | — |
| Build Tool | Maven | 3.8+ |
| Java | JDK | 17+ |

## How It Works

### RAG Pipeline

1. **Document Ingestion** — PDFs and JSON Q&A files are parsed into text.
2. **Chunking** — Text is split into 500-token chunks with 50-token overlap using `DocumentSplitters.recursive()`.
3. **Embedding** — Each chunk is embedded locally using `AllMiniLmL6V2EmbeddingModel` (ONNX-based, no API calls).
4. **Storage** — Embeddings are stored in an `InMemoryEmbeddingStore`.
5. **Query** — User questions are embedded, top-5 similar chunks are retrieved, and the LLM generates an answer grounded in the retrieved context.

### Auto-Ingestion

The `DirectoryWatcherService` polls `documents_in/` every 5 seconds. Any `.pdf` or `.json` file is automatically:
1. Parsed (PDF via PDFBox, JSON via `JsonQaService`)
2. Chunked and embedded
3. Moved to `documents_processed/`

## Project Structure

```
backend/
├── src/main/java/com/example/notebook/
│   ├── NotebookApplication.java        # Spring Boot entry point
│   ├── config/
│   │   └── AiConfig.java               # LLM, embedding model, and vector store beans
│   ├── controller/
│   │   └── NotebookController.java     # REST API endpoints
│   └── service/
│       ├── ChatService.java            # RAG query: embed → retrieve → generate
│       ├── DocumentService.java        # Document upload and ingestion orchestrator
│       ├── DirectoryWatcherService.java # Auto-ingestion from documents_in/
│       ├── EmbeddingService.java       # Chunking and embedding pipeline
│       ├── JsonQaService.java          # JSON Q&A file parser
│       └── PdfService.java            # PDF text extraction
├── src/main/resources/
│   └── application.properties          # All configuration
├── documents_in/                       # Drop files here for auto-ingestion
├── documents_processed/                # Processed files are moved here
└── pom.xml
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents` | List all ingested documents (ID → filename) |
| `POST` | `/api/upload` | Upload a PDF or JSON file |
| `POST` | `/api/chat` | Send a Q&A query |

### Chat Request

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"documentId": "<doc-id>", "message": "Who are the Pandavas?"}'
```

### Upload a Document

```bash
curl -X POST http://localhost:8080/api/upload \
  -F "file=@/path/to/document.pdf"
```

## Configuration

All configuration is in `src/main/resources/application.properties`:

```properties
# AI Provider: ollama | gemini | openai
app.ai.provider=ollama

# Ollama (local LLM)
langchain4j.ollama.chat-model.base-url=http://localhost:11434
langchain4j.ollama.chat-model.model-name=gemma3:12b

# Auto-ingestion directories
app.ingestion.input-dir=./documents_in
app.ingestion.processed-dir=./documents_processed

# Upload size limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Recommended Local Models

| Model | Size | Speed | Quality | Command |
|---|---|---|---|---|
| `gemma3:12b` | ~8GB | Medium | ★★★★★ | `ollama pull gemma3:12b` |
| `llama3.1:8b` | ~5GB | Fast | ★★★★ | `ollama pull llama3.1:8b` |
| `deepseek-r1:14b` | ~9GB | Medium | ★★★★★ | `ollama pull deepseek-r1:14b` |
| `phi4:14b` | ~9GB | Medium | ★★★★ | `ollama pull phi4:14b` |

## JSON Q&A File Formats

### Format 1 — Array of Q&A objects

```json
[
  { "question": "What is X?", "answer": "X is ..." },
  { "question": "Who was Y?", "answer": "Y was ..." }
]
```

### Format 2 — Object with metadata

```json
{
  "title": "My Knowledge Base",
  "qa": [
    { "question": "...", "answer": "..." }
  ]
}
```

Supported keys: `question`/`q` and `answer`/`a`. Array wrapper keys: `qa`, `questions`, `data`, `items`.

## Running

```bash
# Build
mvn clean compile

# Run
mvn spring-boot:run

# The server starts on http://localhost:8080
```
