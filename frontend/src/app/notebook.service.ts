import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Document {
  id: string;
  filename: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotebookService {
  private apiUrl = 'http://localhost:8080/api';
  documents = signal<Document[]>([]);

  constructor(private http: HttpClient) {}

  fetchDocuments(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.apiUrl}/documents`).pipe(
      tap((docs) => {
        const docList = Object.entries(docs).map(([id, filename]) => ({ id, filename }));
        this.documents.set(docList);
      })
    );
  }

  uploadDocument(file: File): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  chat(documentId: string, message: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/chat`, {
      documentId,
      message,
    });
  }
}
