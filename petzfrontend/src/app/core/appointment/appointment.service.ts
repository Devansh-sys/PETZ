import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AppointmentCreateRequest,
  AppointmentResponse,
  PetCreateRequest,
  PetResponse,
  RawBookingResponse,
  SlotLockResponse
} from './appointment.models';

interface ApiResponse<T> { data: T; }

interface BackendLockResponse {
  slotId: string;
  lockedByUserId: string;
  lockedUntil: string;
  lockTimeoutSeconds: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/appointments`;
  private usersBase = `${environment.apiBaseUrl}/users`;

  getPetsByUser(userId: string): Observable<PetResponse[]> {
    return this.http.get<ApiResponse<PetResponse[]>>(`${this.usersBase}/${userId}/pets`).pipe(map(r => r.data));
  }

  createPet(req: PetCreateRequest): Observable<PetResponse> {
    return this.http.post<ApiResponse<PetResponse>>(`${this.usersBase}/${req.ownerId}/pets`, req).pipe(map(r => r.data));
  }

  lockSlot(slotId: string, userId: string): Observable<SlotLockResponse> {
    return this.http
      .post<ApiResponse<BackendLockResponse>>(`${this.base}/lock`, { slotId, userId })
      .pipe(map(r => ({
        lockId: r.data.slotId,
        slotId: r.data.slotId,
        expiresAt: r.data.lockedUntil,
        remainingSeconds: r.data.lockTimeoutSeconds
      })));
  }

  unlockSlot(slotId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/lock/${slotId}`, { params: { userId } });
  }

  createAppointment(req: AppointmentCreateRequest): Observable<RawBookingResponse> {
    const body = {
      slotId: req.slotId,
      userId: req.userId,
      petId: req.petId,
      bookingType: 'ROUTINE'
    };
    return this.http
      .post<ApiResponse<RawBookingResponse>>(`${this.base}/confirm`, body)
      .pipe(map(r => r.data));
  }

  getAppointmentsByUser(userId: string): Observable<AppointmentResponse[]> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(`${this.usersBase}/${userId}/appointments`).pipe(map(r => r.data));
  }
}
