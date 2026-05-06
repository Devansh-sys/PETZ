import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-hospital-appointments',
  template: `
    <div class="page-container">
      <h1>Hospital Appointments</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="appointments" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let a">{{ a.id }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let a">{{ a.apptDate }} {{ a.apptTime }}</td>
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
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let a">
                @if (a.status === 'PENDING') {
                  <button mat-stroked-button color="primary"
                          (click)="updateStatus(a.id, 'CONFIRMED')">Confirm</button>
                }
                @if (a.status === 'CONFIRMED') {
                  <button mat-stroked-button
                          (click)="updateStatus(a.id, 'COMPLETED')">Complete</button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (appointments.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B">
              No appointments.
            </p>
          }
        </mat-card>
      }
    </div>
  `
})
export class HospitalAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  cols = ['id', 'date', 'reason', 'status', 'actions'];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments/hospital').subscribe({
      next: res => { this.appointments = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  updateStatus(id: number, status: string): void {
    this.api.patch<any>(`/appointments/${id}/status`, { status }).subscribe({
      next: () => {
        const a = this.appointments.find(x => x.id === id);
        if (a) a.status = status;
        this.snack.open(`Status updated to ${status}`, '', { duration: 2000 });
      }
    });
  }
}
