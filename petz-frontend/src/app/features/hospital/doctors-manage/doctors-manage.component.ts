import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-doctors-manage',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/hospital" class="back-btn" title="Back to Hospital Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Manage Doctors</h1>
            <p>Add and manage your hospital's medical staff</p>
          </div>
        </div>
        <div class="page-header-actions">
          <button mat-raised-button color="primary" (click)="showForm = !showForm">
            <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
            {{ showForm ? 'Cancel' : 'Add Doctor' }}
          </button>
        </div>
      </div>

      <!-- Add Doctor form -->
      @if (showForm) {
        <div class="card" style="padding:28px;margin-bottom:24px">
          <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#A8A29E;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #F0E0D6">
            New Doctor Details
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Full Name *</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">person</mat-icon>
                <input matInput [(ngModel)]="newDoc.name" placeholder="Dr. Jane Smith">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Specialization</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">medical_services</mat-icon>
                <input matInput [(ngModel)]="newDoc.specialization" placeholder="e.g. Surgery, Dermatology">
              </mat-form-field>
            </div>
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Schedule Start</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">schedule</mat-icon>
                <input matInput type="time" [(ngModel)]="newDoc.scheduleStart">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Schedule End</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">schedule</mat-icon>
                <input matInput type="time" [(ngModel)]="newDoc.scheduleEnd">
              </mat-form-field>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Slot Duration (minutes)</label>
            <mat-form-field appearance="outline" style="max-width:200px">
              <input matInput type="number" [(ngModel)]="newDoc.slotDuration" placeholder="30">
            </mat-form-field>
          </div>
          <div style="display:flex;gap:10px;margin-top:8px">
            <button mat-raised-button color="primary" (click)="addDoctor()"
                    [disabled]="!newDoc.name" style="border-radius:12px;height:42px">
              <mat-icon>save</mat-icon> Save Doctor
            </button>
            <button mat-stroked-button (click)="showForm = false"
                    style="border-radius:12px;height:42px;color:#78716C;border-color:#E5D0C5">
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- Doctors table -->
      <div class="table-card">
        @if (doctors.length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><mat-icon>medical_services</mat-icon></div>
            <h3>No doctors added</h3>
            <p>Add medical staff so patients can book appointments.</p>
          </div>
        }
        @if (doctors.length > 0) {
          <table mat-table [dataSource]="doctors" style="width:100%">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Doctor</th>
              <td mat-cell *matCellDef="let d" style="padding:14px 18px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="doc-avatar">{{ d.name?.charAt(0) || 'D' }}</div>
                  <div>
                    <div style="font-weight:700;font-size:0.88rem;color:#1C0902">Dr. {{ d.name }}</div>
                    <div style="font-size:0.74rem;color:#A8A29E">{{ d.specialization || 'General' }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="schedule">
              <th mat-header-cell *matHeaderCellDef>Hours</th>
              <td mat-cell *matCellDef="let d" style="font-size:0.82rem;color:#78716C;font-weight:600">
                {{ d.scheduleStart || '—' }} – {{ d.scheduleEnd || '—' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="slot">
              <th mat-header-cell *matHeaderCellDef>Slot</th>
              <td mat-cell *matCellDef="let d" style="font-size:0.82rem;color:#78716C">
                {{ d.slotDuration || '—' }} min
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let d" style="text-align:right;padding-right:18px">
                <button mat-icon-button (click)="deleteDoctor(d.id)" class="del-btn" title="Remove">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        }
      </div>

    </div>
  `,
  styles: [`
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #F0E0D6 !important; color: #78716C !important; flex-shrink: 0;
      &:hover { border-color: #F97316 !important; color: #F97316 !important; }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .field-group { margin-bottom: 4px; }
    .field-label { display: block; font-size: 0.78rem; font-weight: 700; color: #1C0902; margin-bottom: 6px; }
    .doc-avatar {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #34D399, #059669);
      color: #fff; font-weight: 800; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .del-btn {
      width: 34px !important; height: 34px !important; border-radius: 9px !important;
      color: #A8A29E !important;
      &:hover { color: #DC2626 !important; background: #FEE2E2 !important; }
      mat-icon { font-size: 17px; }
    }
    @media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class DoctorsManageComponent implements OnInit {
  doctors: any[] = [];
  cols = ['name', 'schedule', 'slot', 'actions'];
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
        this.snack.open('Doctor added successfully!', '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error adding doctor.', 'Close', { duration: 3000 })
    });
  }

  deleteDoctor(id: number): void {
    if (!confirm('Remove this doctor from your hospital?')) return;
    this.api.delete<any>(`/hospitals/profile/doctors/${id}`).subscribe(() => {
      this.doctors = this.doctors.filter(d => d.id !== id);
      this.snack.open('Doctor removed.', '', { duration: 2000 });
    });
  }
}
