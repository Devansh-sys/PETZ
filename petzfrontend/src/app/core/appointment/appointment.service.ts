import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AppointmentCreateRequest,
  AppointmentResponse,
  BookingConfirmationResponse,
  PetCreateRequest,
  PetResponse,
  SlotLockResponse
} from './appointment.models';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/appointments`;
  private petsBase = `${environment.apiBaseUrl}/pets`;

  getPetsByUser(userId: string): Observable<PetResponse[]> {
    return this.http.get<ApiResponse<PetResponse[]>>(`${this.petsBase}/users/${userId}`).pipe(map(r => r.data));
  }

  createPet(req: PetCreateRequest): Observable<PetResponse> {
    return this.http.post<ApiResponse<PetResponse>>(this.petsBase, req).pipe(map(r => r.data));
  }

  lockSlot(slotId: string, userId: string): Observable<SlotLockResponse> {
    return this.http.post<ApiResponse<SlotLockResponse>>(`${this.base}/slots/${slotId}/lock`, { userId }).pipe(map(r => r.data));
  }

  unlockSlot(slotId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/slots/${slotId}/lock`, { params: { userId } });
  }

  createAppointment(req: AppointmentCreateRequest): Observable<BookingConfirmationResponse> {
    return this.http.post<ApiResponse<BookingConfirmationResponse>>(this.base, req).pipe(map(r => r.data));
  }

  getAppointmentsByUser(userId: string): Observable<AppointmentResponse[]> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(`${this.base}/users/${userId}`).pipe(map(r => r.data));
  }
}
