import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DoctorResponse,
  DoctorSlotResponse,
  HospitalResponse,
  HospitalServiceResponse
} from './hospital.models';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/hospitals`;

  listHospitals(filters?: {
    city?: string;
    name?: string;
    emergencyOnly?: boolean;
    openNow?: boolean;
  }): Observable<HospitalResponse[]> {
    const hasFilter = filters?.city || filters?.name ||
                      filters?.emergencyOnly || filters?.openNow;

    if (hasFilter) {
      let params = new HttpParams();
      if (filters?.city)          params = params.set('city', filters.city!);
      if (filters?.name)          params = params.set('name', filters.name!);
      if (filters?.emergencyOnly) params = params.set('emergencyReady', 'true');
      if (filters?.openNow)       params = params.set('openNow', 'true');
      return this.http
        .get<ApiResponse<HospitalResponse[]>>(`${this.base}/search`, { params })
        .pipe(map(r => r.data));
    }

    return this.http
      .get<ApiResponse<HospitalResponse[]>>(this.base)
      .pipe(map(r => r.data));
  }

  listServices(hospitalId: string): Observable<HospitalServiceResponse[]> {
    return this.http
      .get<ApiResponse<HospitalServiceResponse[]>>(`${this.base}/${hospitalId}/services`)
      .pipe(map(r => r.data));
  }

  listDoctors(hospitalId: string): Observable<DoctorResponse[]> {
    return this.http
      .get<ApiResponse<DoctorResponse[]>>(`${this.base}/${hospitalId}/doctors`)
      .pipe(map(r => r.data));
  }

  listSlots(hospitalId: string, doctorId: string, date: string, serviceId?: string): Observable<DoctorSlotResponse[]> {
    const params = new HttpParams().set('date', date);
    return this.http
      .get<ApiResponse<DoctorSlotResponse[]>>(`${this.base}/${hospitalId}/slots`, { params })
      .pipe(map(r => (r.data ?? []).filter(s =>
        s.doctorId === doctorId && (!serviceId || !s.serviceId || s.serviceId === serviceId)
      )));
  }
}
