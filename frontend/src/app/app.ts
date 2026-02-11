import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotebookService, Document } from './notebook.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>BVQA</h2>
          <button class="upload-btn" (click)="fileInput.click()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload PDF
          </button>
          <input #fileInput type="file" (change)="onFileSelected($event)" accept="application/pdf,application/json,.json" style="display: none">
        </div>

        <div class="docs-list">
          <h3>Sources</h3>
          @for (doc of notebookService.documents(); track doc.id) {
            <div 
              class="doc-item" 
              [class.active]="selectedDoc()?.id === doc.id"
              (click)="selectedDoc.set(doc)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>{{ doc.filename }}</span>
            </div>
          }
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="chat-area">
        @if (selectedDoc()) {
          <div class="chat-header">
            <h3>Chatting with: {{ selectedDoc()?.filename }}</h3>
          </div>
          
          <div class="messages" #scrollContainer>
            @for (msg of messages(); track $index) {
              <div class="message" [class.user]="msg.role === 'user'" [class.ai]="msg.role === 'ai'">
                <div class="avatar">
                  {{ msg.role === 'user' ? 'U' : 'AI' }}
                </div>
                <div class="content">
                  {{ msg.content }}
                </div>
              </div>
            }
            @if (isLoading()) {
              <div class="message ai">
                <div class="avatar">AI</div>
                <div class="content loading">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
              </div>
            }
          </div>

          <div class="input-container">
            <input 
              type="text" 
              [(ngModel)]="userInput" 
              (keyup.enter)="sendMessage()" 
              placeholder="Ask anything about the document..."
              [disabled]="isLoading()">
            <button (click)="sendMessage()" [disabled]="isLoading() || !userInput.trim()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        } @else {
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h2>Welcome to BVQA</h2>
            <p>Select a document from the sidebar or upload a new one to start chatting.</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }

    .app-container {
      display: flex;
      height: 100%;
    }

    .sidebar {
      width: 300px;
      background-color: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 24px;
    }

    .sidebar-header h2 {
      margin: 0 0 24px 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }

    .upload-btn {
      width: 100%;
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .upload-btn:hover {
      background-color: #2563eb;
    }

    .docs-list {
      margin-top: 32px;
      flex: 1;
      overflow-y: auto;
    }

    .docs-list h3 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 16px;
    }

    .doc-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: background-color 0.2s;
    }

    .doc-item:hover {
      background-color: #f1f5f9;
    }

    .doc-item.active {
      background-color: #eff6ff;
      color: #3b82f6;
    }

    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #f8fafc;
      position: relative;
    }

    .chat-header {
      padding: 20px 40px;
      background-color: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .message {
      display: flex;
      gap: 16px;
      max-width: 80%;
    }

    .message.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .message.user .avatar {
      background-color: #3b82f6;
      color: white;
    }

    .message.ai .avatar {
      background-color: #e2e8f0;
      color: #475569;
    }

    .content {
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.5;
    }

    .message.user .content {
      background-color: #3b82f6;
      color: white;
      border-top-right-radius: 0;
    }

    .message.ai .content {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-top-left-radius: 0;
    }

    .input-container {
      padding: 24px 40px;
      display: flex;
      gap: 12px;
      background-color: #ffffff;
      border-top: 1px solid #e2e8f0;
    }

    .input-container input {
      flex: 1;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      border-radius: 8px;
      outline: none;
      font-size: 1rem;
    }

    .input-container input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .input-container button {
      background-color: #3b82f6;
      color: white;
      border: none;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .input-container button:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .input-container button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      text-align: center;
      padding: 40px;
    }

    .empty-state h2 {
      margin: 24px 0 12px 0;
      color: #0f172a;
    }

    .loading .dot {
      display: inline-block;
      width: 4px;
      height: 4px;
      background-color: #64748b;
      border-radius: 50%;
      margin: 0 2px;
      animation: bounce 1.4s infinite ease-in-out;
    }

    .loading .dot:nth-child(2) { animation-delay: 0.2s; }
    .loading .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
  `],
})
export class App implements OnInit {
  selectedDoc = signal<Document | null>(null);
  userInput = '';
  messages = signal<{ role: 'user' | 'ai', content: string }[]>([]);
  isLoading = signal(false);

  constructor(public notebookService: NotebookService) { }

  ngOnInit() {
    this.refreshDocs();

    // Auto-refresh docs every 10 seconds to catch files ingested by DirectoryWatcher
    setInterval(() => this.refreshDocs(), 10000);
  }

  refreshDocs() {
    this.notebookService.fetchDocuments().subscribe();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.notebookService.uploadDocument(file).subscribe({
        next: (doc) => {
          this.refreshDocs();
          this.selectedDoc.set(doc);
        },
        error: (err) => alert('Upload failed: ' + err.message)
      });
    }
  }

  sendMessage() {
    const doc = this.selectedDoc();
    if (!doc || !this.userInput.trim() || this.isLoading()) return;

    const userMsg = this.userInput;
    this.messages.update(prev => [...prev, { role: 'user', content: userMsg }]);
    this.userInput = '';
    this.isLoading.set(true);

    this.notebookService.chat(doc.id, userMsg).subscribe({
      next: (res) => {
        this.messages.update(prev => [...prev, { role: 'ai', content: res.response }]);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.messages.update(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error: ' + err.message }]);
        this.isLoading.set(false);
      }
    });
  }
}
