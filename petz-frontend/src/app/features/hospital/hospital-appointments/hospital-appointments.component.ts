import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-hospital-appointments',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/hospital" class="back-btn" title="Back to Hospital Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Appointments</h1>
            <p>Manage incoming and scheduled vet appointments</p>
          </div>
        </div>
        <div class="appt-count-badge">
          <mat-icon>event</mat-icon>
          <span>{{ appointments.length }} appointments</span>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading appointments...</span>
        </div>
      }

      @if (!loading) {
        <div class="table-card">
          @if (appointments.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>event_busy</mat-icon></div>
              <h3>No appointments</h3>
              <p>No appointments to show right now.</p>
            </div>
          }

          @if (appointments.length > 0) {
            <table mat-table [dataSource]="appointments" style="width:100%">
              <ng-container matColumnDef="datetime">
                <th mat-header-cell *matHeaderCellDef>Date & Time</th>
                <td mat-cell *matCellDef="let a" style="padding:14px 18px">
                  <div class="appt-dt-cell">
                    <div class="appt-date-mini">
                      <span class="d">{{ getDay(a.apptDate) }}</span>
                      <span class="m">{{ getMonth(a.apptDate) }}</span>
                    </div>
                    <div style="font-size:0.8rem;color:#78716C;font-weight:600">{{ a.apptTime }}</div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>Reason</th>
                <td mat-cell *matCellDef="let a" style="font-size:0.85rem;color:#1C0902;font-weight:500">
                  {{ a.reason || 'General Checkup' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let a">
                  <span class="chip" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let a" style="text-align:right;padding-right:18px">
                  <div style="display:flex;gap:8px;justify-content:flex-end">
                    @if (a.status === 'PENDING') {
                      <button mat-stroked-button (click)="update(a, 'CONFIRMED')" class="confirm-btn">
                        <mat-icon>check</mat-icon> Confirm
                      </button>
                    }
                    @if (a.status === 'CONFIRMED') {
                      <button mat-stroked-button (click)="update(a, 'COMPLETED')" class="complete-btn">
                        <mat-icon>done_all</mat-icon> Complete
                      </button>
                    }
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            </table>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #F0E0D6 !important; color: #78716C !important; flex-shrink: 0;
      &:hover { border-color: #F97316 !important; color: #F97316 !important; }
    }
    .appt-count-badge {
      display: flex; align-items: center; gap: 6px;
      background: #EDE9FE; color: #5B21B6;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .appt-dt-cell { display: flex; align-items: center; gap: 10px; }
    .appt-date-mini {
      display: flex; flex-direction: column; align-items: center;
      background: #FFEDD5; border-radius: 10px;
      padding: 5px 8px; min-width: 42px;
      .d { font-size: 1.1rem; font-weight: 900; color: #F97316; line-height: 1; }
      .m { font-size: 0.6rem; font-weight: 700; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.06em; }
    }
    .confirm-btn {
      border-color: #A7F3D0 !important; color: #059669 !important;
      border-radius: 10px !important; font-size: 0.78rem !important; height: 32px !important;
      mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; }
      &:hover { background: #ECFDF5 !important; }
    }
    .complete-btn {
      border-color: #DBEAFE !important; color: #2563EB !important;
      border-radius: 10px !important; font-size: 0.78rem !important; height: 32px !important;
      mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; }
      &:hover { background: #EFF6FF !important; }
    }
  `]
})
export class HospitalAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  cols = ['datetime', 'reason', 'status', 'actions'];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments/hospital').subscribe({
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

  update(a: any, status: string): void {
    this.api.patch<any>(`/appointments/${a.id}/status`, { status }).subscribe({
      next: () => {
        a.status = status;
        this.snack.open(`Appointment ${status.toLowerCase()}.`, '', { duration: 2000 });
      }
    });
  }
}
