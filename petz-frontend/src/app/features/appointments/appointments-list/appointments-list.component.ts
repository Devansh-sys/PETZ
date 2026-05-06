import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  standalone: false,
  selector: 'app-appointments-list',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center">
          <button mat-icon-button routerLink="/dashboard"
                  style="background:#fff;border:1px solid #F0E0D6;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#78716C">arrow_back</mat-icon>
          </button>
          <div>
            <h1>My Appointments</h1>
            <p>Track all your scheduled vet visits</p>
          </div>
        </div>
        <div class="page-header-actions">
          <button mat-raised-button color="primary" routerLink="/appointments/book">
            <mat-icon>add</mat-icon> Book Appointment
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Fetching appointments...</span>
        </div>
      }

      @if (!loading) {
        <!-- Empty -->
        @if (appointments.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon">
                <mat-icon>event_busy</mat-icon>
              </div>
              <h3>No appointments</h3>
              <p>You haven't booked any vet visits yet. Schedule one for your pet today.</p>
              <button mat-raised-button color="primary" routerLink="/appointments/book" style="margin-top:8px">
                <mat-icon>add</mat-icon> Book Now
              </button>
            </div>
          </div>
        }

        <!-- Appointments list -->
        @if (appointments.length > 0) {
          <div class="card-flat">
            @for (a of appointments; track a.id) {
              <div class="appt-row">
                <div class="appt-date-badge">
                  <div class="appt-day">{{ getDay(a.apptDate) }}</div>
                  <div class="appt-month">{{ getMonth(a.apptDate) }}</div>
                </div>

                <div class="appt-details">
                  <div class="appt-title">{{ a.reason || 'General Checkup' }}</div>
                  <div class="appt-sub">
                    <mat-icon>schedule</mat-icon>
                    {{ a.apptTime || '—' }}
                  </div>
                </div>

                <div class="appt-right">
                  <span class="chip" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
                  @if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
                    <button mat-icon-button class="cancel-btn"
                            (click)="cancel(a.id)" title="Cancel appointment">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

    </div>
  `,
  styles: [`
    .appt-row {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 16px 22px;
      border-bottom: 1px solid #FAF0EB;
      transition: background 0.15s;
      &:last-child { border-bottom: none; }
      &:hover { background: #FFF7ED; }
    }
    .appt-date-badge {
      min-width: 54px;
      text-align: center;
      background: #FFEDD5;
      border-radius: 14px;
      padding: 8px 6px;
    }
    .appt-day   { font-size: 1.4rem; font-weight: 900; color: #F97316; line-height: 1; }
    .appt-month { font-size: 0.62rem; font-weight: 700; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
    .appt-details {
      flex: 1;
      min-width: 0;
    }
    .appt-title { font-weight: 700; font-size: 0.9rem; color: #1C0902; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-sub {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.77rem; color: #A8A29E; font-weight: 500;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .appt-right {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    .cancel-btn {
      width: 32px !important; height: 32px !important; border-radius: 8px !important;
      color: #A8A29E !important;
      &:hover { color: #DC2626 !important; background: #FEE2E2 !important; }
      mat-icon { font-size: 16px; }
    }
  `]
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  cols = ['date', 'time', 'reason', 'status', 'actions'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments/my').subscribe({
      next: res => { this.appointments = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  getDay(date: string): string {
    if (!date) return '—';
    return new Date(date).getDate().toString().padStart(2, '0');
  }

  getMonth(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short' });
  }

  cancel(id: number): void {
    if (!confirm('Cancel this appointment?')) return;
    this.api.delete<any>(`/appointments/${id}`).subscribe(() => {
      const a = this.appointments.find(x => x.id === id);
      if (a) a.status = 'CANCELLED';
    });
  }
}
