import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  standalone: false,
  selector: 'app-appointments-list',
  template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>My Appointments</h1>
        <button mat-raised-button color="primary" routerLink="/appointments/book">
          <mat-icon>add</mat-icon> Book Appointment
        </button>
      </div>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="appointments" class="mat-elevation-z1" style="width:100%">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let a">{{ a.apptDate }}</td>
            </ng-container>
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>Time</th>
              <td mat-cell *matCellDef="let a">{{ a.apptTime }}</td>
            </ng-container>
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let a">{{ a.reason || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="chip" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                @if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
                  <button mat-icon-button color="warn" (click)="cancel(a.id)" title="Cancel">
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (appointments.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B">
              No appointments found.
            </p>
          }
        </mat-card>
      }
    </div>
  `
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

  cancel(id: number): void {
    if (!confirm('Cancel this appointment?')) return;
    this.api.delete<any>(`/appointments/${id}`).subscribe(() => {
      const a = this.appointments.find(x => x.id === id);
      if (a) a.status = 'CANCELLED';
    });
  }
}
