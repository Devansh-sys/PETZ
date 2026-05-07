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
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
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
              <div class="appt-row" (click)="selected = a" style="cursor:pointer">
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
                            (click)="cancel(a.id); $event.stopPropagation()" title="Cancel appointment">
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

    <!-- Detail Modal -->
    @if (selected) {
      <div class="modal-backdrop" (click)="selected = null">
        <div class="modal-card" (click)="$event.stopPropagation()">

          <div class="modal-header">
            <div>
              <div class="modal-title">Appointment Details</div>
              <div class="modal-sub">{{ formatFullDate(selected.apptDate) }}</div>
            </div>
            <button mat-icon-button (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="modal-body">

            <div class="detail-row">
              <mat-icon class="detail-icon">event</mat-icon>
              <div>
                <div class="detail-label">Date</div>
                <div class="detail-value">{{ formatFullDate(selected.apptDate) }}</div>
              </div>
            </div>

            <div class="detail-row">
              <mat-icon class="detail-icon">schedule</mat-icon>
              <div>
                <div class="detail-label">Time</div>
                <div class="detail-value">{{ formatTime(selected.apptTime) }}</div>
              </div>
            </div>

            <div class="detail-row">
              <mat-icon class="detail-icon">info</mat-icon>
              <div>
                <div class="detail-label">Status</div>
                <span class="chip" [ngClass]="selected.status.toLowerCase()">{{ selected.status }}</span>
              </div>
            </div>

            @if (selected.hospitalName) {
              <div class="detail-row">
                <mat-icon class="detail-icon">local_hospital</mat-icon>
                <div>
                  <div class="detail-label">Hospital</div>
                  <div class="detail-value">{{ selected.hospitalName }}</div>
                  @if (selected.hospitalCity || selected.hospitalAddress) {
                    <div class="detail-meta">{{ selected.hospitalAddress }}{{ selected.hospitalCity ? ', ' + selected.hospitalCity : '' }}</div>
                  }
                </div>
              </div>
            }

            @if (selected.doctorName) {
              <div class="detail-row">
                <mat-icon class="detail-icon">person</mat-icon>
                <div>
                  <div class="detail-label">Doctor</div>
                  <div class="detail-value">Dr. {{ selected.doctorName }}</div>
                  @if (selected.doctorSpecialization) {
                    <div class="detail-meta">{{ selected.doctorSpecialization }}</div>
                  }
                </div>
              </div>
            }

            @if (selected.petName) {
              <div class="detail-row">
                <mat-icon class="detail-icon">pets</mat-icon>
                <div>
                  <div class="detail-label">Pet</div>
                  <div class="detail-value">{{ selected.petName }}</div>
                  @if (selected.petBreed || selected.petSpecies) {
                    <div class="detail-meta">{{ selected.petBreed || selected.petSpecies }}</div>
                  }
                </div>
              </div>
            }

            <div class="detail-row">
              <mat-icon class="detail-icon">medical_services</mat-icon>
              <div>
                <div class="detail-label">Reason for Visit</div>
                <div class="detail-value">{{ selected.reason || 'General Checkup' }}</div>
              </div>
            </div>

            @if (selected.notes) {
              <div class="detail-row">
                <mat-icon class="detail-icon">notes</mat-icon>
                <div>
                  <div class="detail-label">Notes</div>
                  <div class="detail-value">{{ selected.notes }}</div>
                </div>
              </div>
            }

            @if (selected.createdAt) {
              <div class="detail-row">
                <mat-icon class="detail-icon">history</mat-icon>
                <div>
                  <div class="detail-label">Booked On</div>
                  <div class="detail-value">{{ formatFullDate(selected.createdAt) }}</div>
                </div>
              </div>
            }

          </div>

          @if (selected.status === 'PENDING' || selected.status === 'CONFIRMED') {
            <div class="modal-footer">
              <button mat-stroked-button class="cancel-appt-btn"
                      (click)="cancel(selected.id); selected = null">
                <mat-icon>cancel</mat-icon> Cancel Appointment
              </button>
            </div>
          }

        </div>
      </div>
    }
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
    .appt-day   { font-size: 1.4rem; font-weight: 900; color: #FF8C42; line-height: 1; }
    .appt-month { font-size: 0.62rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
    .appt-details {
      flex: 1;
      min-width: 0;
    }
    .appt-title { font-weight: 700; font-size: 0.9rem; color: #1A3547; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-sub {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.77rem; color: #8BA3B5; font-weight: 500;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .appt-right {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    .cancel-btn {
      width: 32px !important; height: 32px !important; border-radius: 8px !important;
      color: #8BA3B5 !important;
      &:hover { color: #DC2626 !important; background: #FEE2E2 !important; }
      mat-icon { font-size: 16px; }
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .modal-card {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      overflow: hidden;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(24px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .modal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 22px 22px 16px;
      border-bottom: 1px solid #FAF0EB;
      background: linear-gradient(135deg, #FFF7ED 0%, #fff 100%);
    }
    .modal-title { font-size: 1.1rem; font-weight: 800; color: #1A3547; }
    .modal-sub   { font-size: 0.78rem; color: #8BA3B5; margin-top: 2px; }

    .modal-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 16px; }

    .detail-row {
      display: flex; align-items: flex-start; gap: 14px;
    }
    .detail-icon {
      color: #FF8C42; font-size: 20px; width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0;
    }
    .detail-label { font-size: 0.72rem; font-weight: 600; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
    .detail-value { font-size: 0.92rem; font-weight: 600; color: #1A3547; }
    .detail-meta  { font-size: 0.78rem; color: #8BA3B5; margin-top: 2px; }

    .modal-footer {
      padding: 14px 22px 20px;
      border-top: 1px solid #FAF0EB;
    }
    .cancel-appt-btn {
      width: 100%; border-color: #DC2626 !important; color: #DC2626 !important; border-radius: 10px !important;
      &:hover { background: #FEE2E2 !important; }
    }
  `]
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  cols = ['date', 'time', 'reason', 'status', 'actions'];
  selected: Appointment | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments/my').subscribe({
      next: res => { this.appointments = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  getDay(date: string): string {
    if (!date) return '—';
    // Append T00:00:00 to force LOCAL-time parsing — bare date strings are parsed as UTC
    // which shifts the day for timezones ahead of UTC (e.g. IST +5:30)
    return new Date(date + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  getMonth(date: string): string {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
  }

  cancel(id: number): void {
    if (!confirm('Cancel this appointment?')) return;
    this.api.delete<any>(`/appointments/${id}`).subscribe(() => {
      const a = this.appointments.find(x => x.id === id);
      if (a) a.status = 'CANCELLED';
    });
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '—';
    // Append T00:00:00 to force local-time parsing — bare date strings are UTC which shifts the day for UTC+ timezones (e.g. IST +5:30)
    const d = dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr;
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}
