import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RescueHistoryResponse,
  SosReportCreateRequest,
  SosReportResponse
} from './sos.models';

@Injectable({ providedIn: 'root' })
export class SosService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/sos-reports`;

  createReport(body: SosReportCreateRequest): Observable<SosReportResponse> {
    return this.http.post<SosReportResponse>(this.base, body);
  }

  uploadMedia(reportId: string, files: File[]): Observable<SosReportResponse> {
    const form = new FormData();
    for (const f of files) {
      form.append('files', f, f.name);
    }
    return this.http.post<SosReportResponse>(`${this.base}/${reportId}/media`, form);
  }

  getReport(reportId: string): Observable<SosReportResponse> {
    return this.http.get<SosReportResponse>(`${this.base}/${reportId}`);
  }

  getRescueHistory(userId: string): Observable<RescueHistoryResponse[]> {
    return this.http.get<RescueHistoryResponse[]>(`${environment.serverUrl}/users/${userId}/rescue-history`);
  }
}
