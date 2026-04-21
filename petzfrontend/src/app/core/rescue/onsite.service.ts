import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiEnvelope,
  ArrivalRequest,
  HandoverResponse,
  NearbyHospitalResponse,
  OnSiteAssessmentRequest,
  OnSiteAssessmentResponse
} from '../sos/sos.models';

function unwrap<T>(res: ApiEnvelope<T> | T): T {
  if (res && typeof res === 'object' && 'data' in (res as any)) {
    return (res as ApiEnvelope<T>).data as T;
  }
  return res as T;
}

@Injectable({ providedIn: 'root' })
export class OnSiteService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/rescue`;

  markArrival(sosReportId: string, body: ArrivalRequest): Observable<void> {
    return this.http
      .patch<ApiEnvelope<void>>(`${this.base}/${sosReportId}/arrival`, body)
      .pipe(map(() => undefined));
  }

  submitAssessment(
    sosReportId: string,
    body: OnSiteAssessmentRequest
  ): Observable<OnSiteAssessmentResponse> {
    return this.http
      .post<ApiEnvelope<OnSiteAssessmentResponse>>(`${this.base}/${sosReportId}/assessment`, body)
      .pipe(map(unwrap));
  }

  getNearbyHospitals(sosReportId: string): Observable<NearbyHospitalResponse[]> {
    return this.http
      .get<ApiEnvelope<NearbyHospitalResponse[]>>(`${this.base}/${sosReportId}/hospitals/nearby`)
      .pipe(map(r => unwrap(r) ?? []));
  }

  alertHospital(sosReportId: string, hospitalId: string): Observable<void> {
    return this.http
      .post<ApiEnvelope<void>>(`${this.base}/${sosReportId}/hospitals/${hospitalId}/alert`, {})
      .pipe(map(() => undefined));
  }

  confirmRelease(sosReportId: string, notes: string, volunteerId: string): Observable<void> {
    return this.http
      .post<ApiEnvelope<void>>(`${this.base}/${sosReportId}/release`, { notes, volunteerId })
      .pipe(map(() => undefined));
  }

  recordHandover(sosReportId: string, hospitalId: string): Observable<HandoverResponse> {
    return this.http
      .post<ApiEnvelope<HandoverResponse>>(`${this.base}/${sosReportId}/handover`, { hospitalId })
      .pipe(map(unwrap));
  }
}
