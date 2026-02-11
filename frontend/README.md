# BVQA Frontend

Angular SPA that provides the user interface for document-based Q&A, communicating with the BVQA backend REST API.

## Tech Stack

| Component | Technology | Version |
|---|---|---|
| Framework | Angular | 21.1 |
| Language | TypeScript | 5.9 |
| HTTP Client | Angular HttpClient | — |
| Reactive | RxJS | 7.8 |
| Build Tool | Angular CLI / Vite | — |

## Features

- **Document Sidebar** — View all ingested documents
- **File Upload** — Upload PDF or JSON Q&A files directly from the UI
- **Chat Interface** — Ask questions about selected documents
- **Real-time Responses** — AI-generated answers grounded in document content

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.ts                 # Main app component (UI + chat logic)
│   │   ├── app.config.ts          # Angular app configuration
│   │   ├── app.routes.ts          # Routing configuration
│   │   └── notebook.service.ts    # HTTP service for backend API communication
│   ├── index.html                 # HTML entry point
│   ├── main.ts                    # Angular bootstrap
│   └── styles.css                 # Global styles
├── angular.json                   # Angular workspace config
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

## API Integration

The `NotebookService` communicates with the backend at `http://localhost:8080`:

| Action | Backend Endpoint | Method |
|---|---|---|
| Fetch documents | `/api/documents` | GET |
| Upload file | `/api/upload` | POST |
| Send chat message | `/api/chat` | POST |

## Running

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Start

```bash
# Install dependencies
npm install

# Start dev server
npm start

# App runs at http://localhost:4200
```

### Build for Production

```bash
npm run build
# Output in dist/
```

## Supported File Uploads

| Type | Extensions | Description |
|---|---|---|
| PDF | `.pdf` | Scanned or text-based PDFs |
| JSON Q&A | `.json` | Structured question-answer datasets |

## Usage

1. Start the backend first (`cd ../backend && mvn spring-boot:run`)
2. Start the frontend (`npm start`)
3. Open [http://localhost:4200](http://localhost:4200)
4. Upload a document or select one from the sidebar
5. Type a question in the chat input and press Enter
