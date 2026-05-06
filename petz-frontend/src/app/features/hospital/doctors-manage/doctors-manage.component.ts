import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-doctors-manage',
  template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>Manage Doctors</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>add</mat-icon> Add Doctor
        </button>
      </div>

      @if (showForm) {
        <mat-card style="margin-bottom:20px">
          <mat-card-content>
            <div class="form-grid" style="margin-top:12px">
              <mat-form-field appearance="outline">
                <mat-label>Name *</mat-label>
                <input matInput [(ngModel)]="newDoc.name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Specialization</mat-label>
                <input matInput [(ngModel)]="newDoc.specialization">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Schedule Start (HH:mm)</mat-label>
                <input matInput type="time" [(ngModel)]="newDoc.scheduleStart">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Schedule End (HH:mm)</mat-label>
                <input matInput type="time" [(ngModel)]="newDoc.scheduleEnd">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Slot Duration (min)</mat-label>
                <input matInput type="number" [(ngModel)]="newDoc.slotDuration">
              </mat-form-field>
            </div>
            <button mat-flat-button color="primary" (click)="addDoctor()">Save</button>
            <button mat-button (click)="showForm = false">Cancel</button>
          </mat-card-content>
        </mat-card>
      }

      <mat-card>
        <table mat-table [dataSource]="doctors" style="width:100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let d">{{ d.name }}</td>
          </ng-container>
          <ng-container matColumnDef="spec">
            <th mat-header-cell *matHeaderCellDef>Specialization</th>
            <td mat-cell *matCellDef="let d">{{ d.specialization || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="schedule">
            <th mat-header-cell *matHeaderCellDef>Schedule</th>
            <td mat-cell *matCellDef="let d">{{ d.scheduleStart }} – {{ d.scheduleEnd }}</td>
          </ng-container>
          <ng-container matColumnDef="slot">
            <th mat-header-cell *matHeaderCellDef>Slot (min)</th>
            <td mat-cell *matCellDef="let d">{{ d.slotDuration }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let d">
              <button mat-icon-button color="warn" (click)="deleteDoctor(d.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        @if (doctors.length === 0) {
          <p style="text-align:center;padding:24px;color:#64748B">
            No doctors added yet.
          </p>
        }
      </mat-card>
    </div>
  `
})
export class DoctorsManageComponent implements OnInit {
  doctors: any[] = [];
  cols = ['name', 'spec', 'schedule', 'slot', 'actions'];
  showForm = false;
  newDoc: any = { slotDuration: 30 };
  hospitalId: number | null = null;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/hospitals/profile').subscribe({
      next: res => {
        this.hospitalId = res.data?.id;
        if (this.hospitalId) {
          this.api.get<any>(`/hospitals/public/${this.hospitalId}/doctors`).subscribe(r => {
            this.doctors = r.data ?? [];
          });
        }
      }
    });
  }

  addDoctor(): void {
    if (!this.newDoc.name) return;
    this.api.post<any>('/hospitals/profile/doctors', this.newDoc).subscribe({
      next: res => {
        this.doctors.push(res.data);
        this.showForm = false;
        this.newDoc = { slotDuration: 30 };
        this.snack.open('Doctor added!', '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 })
    });
  }

  deleteDoctor(id: number): void {
    if (!confirm('Remove this doctor?')) return;
    this.api.delete<any>(`/hospitals/profile/doctors/${id}`).subscribe(() => {
      this.doctors = this.doctors.filter(d => d.id !== id);
      this.snack.open('Doctor removed.', '', { duration: 2000 });
    });
  }
}
