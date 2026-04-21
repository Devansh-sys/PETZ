import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NavigationDTO,
  RescueMissionResponse,
  ReportStatus,
  SosReportResponse
} from '../sos/sos.models';

export interface RescueStatusUpdateRequest {
  newStatus: ReportStatus;
  assignedNgoUserId?: string;
  etaMinutes?: number;
}

@Injectable({ providedIn: 'root' })
export class NgoDispatchService {
  private http = inject(HttpClient);
  private missions = `${environment.apiBaseUrl}/rescue-missions`;
  private reports = `${environment.apiBaseUrl}/sos-reports`;

  listMissionsByStatus(status: ReportStatus): Observable<RescueMissionResponse[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<RescueMissionResponse[]>(this.missions, { params });
  }

  listAllMissions(): Observable<RescueMissionResponse[]> {
    return this.http.get<RescueMissionResponse[]>(this.missions);
  }

  getMission(missionId: string): Observable<RescueMissionResponse> {
    return this.http.get<RescueMissionResponse>(`${this.missions}/${missionId}`);
  }

  getReport(reportId: string): Observable<SosReportResponse> {
    return this.http.get<SosReportResponse>(`${this.reports}/${reportId}`);
  }

  updateStatus(missionId: string, body: RescueStatusUpdateRequest): Observable<RescueMissionResponse> {
    return this.http.put<RescueMissionResponse>(`${this.missions}/${missionId}/status`, body);
  }

  getNavigation(missionId: string): Observable<NavigationDTO> {
    return this.http.get<NavigationDTO>(`${environment.serverUrl}/ngo/missions/${missionId}/navigation`);
  }
}
