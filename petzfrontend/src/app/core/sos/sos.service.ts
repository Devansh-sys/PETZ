import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  NgoAssignment,
  RescueHistoryResponse,
  SosReportCreateRequest,
  SosReportResponse
} from './sos.models';

interface ApiEnvelope<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class SosService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/sos-reports`;

  createReport(body: SosReportCreateRequest): Observable<SosReportResponse> {
    return this.http.post<ApiEnvelope<SosReportResponse>>(this.base, body)
      .pipe(map(r => r.data));
  }

  uploadMedia(reportId: string, files: File[]): Observable<SosReportResponse> {
    const form = new FormData();
    for (const f of files) form.append('files', f, f.name);
    return this.http.post<ApiEnvelope<SosReportResponse>>(`${this.base}/${reportId}/media`, form)
      .pipe(map(r => r.data));
  }

  getReport(reportId: string): Observable<SosReportResponse> {
    return this.http.get<ApiEnvelope<SosReportResponse>>(`${this.base}/${reportId}`)
      .pipe(map(r => r.data));
  }

  getRescueHistory(userId: string): Observable<RescueHistoryResponse[]> {
    return this.http.get<RescueHistoryResponse[]>(
      `${environment.apiBaseUrl}/users/${userId}/rescue-history`
    );
  }

  getMyReports(reporterId: string): Observable<SosReportResponse[]> {
    return this.http.get<ApiEnvelope<SosReportResponse[]>>(
      `${this.base}/my-reports?reporterId=${reporterId}`
    ).pipe(map(r => r.data ?? []));
  }

  // ── NGO assignment endpoints ─────────────────────────────────────────────

  getNgoAssignments(): Observable<NgoAssignment[]> {
    return this.http.get<ApiEnvelope<NgoAssignment[]>>(
      `${environment.apiBaseUrl}/ngo/rescue-assignments`
    ).pipe(map(r => r.data ?? []));
  }

  acceptAssignment(assignmentId: string): Observable<NgoAssignment> {
    return this.http.post<ApiEnvelope<NgoAssignment>>(
      `${environment.apiBaseUrl}/ngo/rescue-assignments/${assignmentId}/accept`, {}
    ).pipe(map(r => r.data));
  }

  rejectAssignment(assignmentId: string): Observable<NgoAssignment> {
    return this.http.post<ApiEnvelope<NgoAssignment>>(
      `${environment.apiBaseUrl}/ngo/rescue-assignments/${assignmentId}/reject`, {}
    ).pipe(map(r => r.data));
  }

  getOpenReports(): Observable<NgoAssignment[]> {
    return this.http.get<ApiEnvelope<NgoAssignment[]>>(
      `${environment.apiBaseUrl}/ngo/open-reports`
    ).pipe(map(r => r.data ?? []));
  }

  claimReport(sosReportId: string): Observable<NgoAssignment> {
    return this.http.post<ApiEnvelope<NgoAssignment>>(
      `${environment.apiBaseUrl}/ngo/open-reports/${sosReportId}/claim`, {}
    ).pipe(map(r => r.data));
  }
}
