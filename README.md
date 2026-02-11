# BVQA — Local RAG Q&A System

A fully local Retrieval-Augmented Generation (RAG) application for document-based Q&A. Upload PDFs or structured JSON Q&A files, and ask questions — all powered by local LLMs via [Ollama](https://ollama.com), with no data leaving your machine.

## Architecture

```
┌─────────────────┐       ┌──────────────────────────────────────┐
│  bvqa-frontend  │       │           bvqa-backend               │
│  (Angular 21)   │──────▶│          (Spring Boot 3.2)           │
│  Port: 4200     │  API  │          Port: 8080                  │
└─────────────────┘       │                                      │
                          │  ┌────────────┐  ┌────────────────┐  │
                          │  │ PDF Parser │  │ JSON Q&A Parser│  │
                          │  │ (PDFBox)   │  │ (Jackson)      │  │
                          │  └─────┬──────┘  └───────┬────────┘  │
                          │        └────────┬────────┘           │
                          │                 ▼                    │
                          │  ┌──────────────────────────┐        │
                          │  │   Embedding Service       │        │
                          │  │  (AllMiniLmL6V2 - Local) │        │
                          │  └────────────┬─────────────┘        │
                          │               ▼                      │
                          │  ┌──────────────────────────┐        │
                          │  │  In-Memory Vector Store   │        │
                          │  └────────────┬─────────────┘        │
                          │               ▼                      │
                          │  ┌──────────────────────────┐        │
                          │  │   Chat Service (RAG)      │        │
                          │  │  Query → Retrieve → LLM  │        │
                          │  └────────────┬─────────────┘        │
                          │               ▼                      │
                          │  ┌──────────────────────────┐        │
                          │  │   Ollama (Local LLM)      │        │
                          │  │   gemma3:12b / llama3.2   │        │
                          │  └──────────────────────────┘        │
                          └──────────────────────────────────────┘
```

## Features

- **Fully Local** — No data leaves your machine. Embeddings and LLM inference run locally.
- **PDF Ingestion** — Upload or drop PDFs into `documents_in/` for automatic processing.
- **JSON Q&A Ingestion** — Ingest structured Q&A datasets for precise knowledge grounding.
- **Multi-Model Support** — Switch between Ollama (local), Google Gemini, or OpenAI via config.
- **RAG Pipeline** — Queries are embedded, matched against document vectors, and answered with retrieved context.
- **Auto-Ingestion** — A directory watcher polls `documents_in/` every 5 seconds for new files.

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Java** | 17+ | Backend runtime |
| **Maven** | 3.8+ | Backend build |
| **Node.js** | 18+ | Frontend runtime |
| **npm** | 9+ | Frontend packages |
| **Ollama** | Latest | Local LLM serving |

## Quick Start

### 1. Install and start Ollama with a model

```bash
# Install Ollama (https://ollama.com)
ollama pull gemma3:12b
```

### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

### 4. Ingest Documents

Drop PDF or JSON files into `backend/documents_in/`. They are automatically processed and moved to `backend/documents_processed/`.

### 5. Open the App

Navigate to [http://localhost:4200](http://localhost:4200) and start asking questions!

## JSON Q&A File Format

```json
[
  { "question": "What is X?", "answer": "X is ..." },
  { "question": "Who was Y?", "answer": "Y was ..." }
]
```

## Switching LLM Models

Edit `backend/src/main/resources/application.properties`:

```properties
# Local models via Ollama (recommended)
app.ai.provider=ollama
langchain4j.ollama.chat-model.model-name=gemma3:12b

# Other good local options:
# langchain4j.ollama.chat-model.model-name=llama3.1:8b
# langchain4j.ollama.chat-model.model-name=deepseek-r1:14b
# langchain4j.ollama.chat-model.model-name=phi4:14b
```

## Project Structure

```
bvqa/
├── backend/          # Spring Boot REST API + RAG pipeline
├── frontend/         # Angular SPA for document chat UI
└── .gitignore
```

See each project's README for detailed documentation:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## License

MIT
