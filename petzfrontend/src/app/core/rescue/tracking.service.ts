import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  MissionSummaryResponse,
  RescueMissionResponse
} from '../sos/sos.models';

interface ApiEnvelope<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private http = inject(HttpClient);
  private missions = `${environment.apiBaseUrl}/rescue-missions`;

  /** Returns null if no mission has been created yet for this report (404 expected). */
  getMissionByReport(reportId: string): Observable<RescueMissionResponse | null> {
    return this.http
      .get<ApiEnvelope<RescueMissionResponse>>(`${this.missions}/by-report/${reportId}`)
      .pipe(
        map(r => r.data),
        catchError(() => of(null))
      );
  }

  getSummary(missionId: string): Observable<MissionSummaryResponse | null> {
    return this.http
      .get<ApiEnvelope<MissionSummaryResponse>>(`${this.missions}/${missionId}/summary`)
      .pipe(
        map(r => r.data),
        catchError(() => of(null))
      );
  }
}
