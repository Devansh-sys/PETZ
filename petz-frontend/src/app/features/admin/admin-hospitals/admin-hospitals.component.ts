import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-hospitals',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/admin" class="back-btn" title="Back to Admin Panel">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Hospital Management</h1>
            <p>Manage and verify registered veterinary hospitals</p>
          </div>
        </div>
      </div>

      <!-- Info notice — Hospitals self-register -->
      <div class="info-notice">
        <mat-icon>info_outline</mat-icon>
        <span>Hospitals register themselves via the <strong>Sign Up</strong> page selecting the "Veterinary Hospital" account type. Use the Verify and Activate buttons below to manage them.</span>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading hospitals...</span>
        </div>
      }

      @if (!loading) {
        <div class="table-card">

          @if (hospitals.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>local_hospital</mat-icon></div>
              <h3>No hospitals registered</h3>
              <p>Hospitals self-register through the Veterinary Hospital account type.</p>
            </div>
          }

          @if (hospitals.length > 0) {
            <table mat-table [dataSource]="hospitals" style="width:100%">

              <!-- Hospital column -->
              <ng-container matColumnDef="hospital">
                <th mat-header-cell *matHeaderCellDef>Hospital</th>
                <td mat-cell *matCellDef="let h" style="padding:14px 18px">
                  <div class="hosp-row">
                    <div class="hosp-avatar-sm">
                      <mat-icon>local_hospital</mat-icon>
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:0.88rem;color:#1A3547">{{ h.name }}</div>
                      <div style="font-size:0.74rem;color:#8BA3B5">{{ h.city || '—' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Contact column -->
              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let h" style="font-size:0.83rem;color:#4A6478">
                  {{ h.phone || h.email || '—' }}
                </td>
              </ng-container>

              <!-- Status column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let h">
                  <span class="chip" [ngClass]="h.isActive !== false ? 'active' : 'inactive'">
                    {{ h.isActive !== false ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <!-- Actions column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let h" style="text-align:right;padding-right:18px">
                  <button mat-stroked-button (click)="toggle(h)"
                          [class]="h.isActive !== false ? 'deactivate-btn' : 'activate-btn'">
                    {{ h.isActive !== false ? 'Deactivate' : 'Activate' }}
                  </button>
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
    .info-notice {
      display: flex; align-items: flex-start; gap: 10px;
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px;
      padding: 14px 18px; font-size: 0.83rem; color: #1E40AF;
      margin-bottom: 20px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
    }
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #E0EBF2 !important; color: #4A6478 !important; flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }
    .hosp-row { display: flex; align-items: center; gap: 10px; }
    .hosp-avatar-sm {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #34D399, #059669);
      color: #fff; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #fff; }
    }
    .deactivate-btn {
      border-color: #FECACA !important; color: #DC2626 !important;
      border-radius: 10px !important; font-size: 0.78rem !important; height: 32px !important;
      &:hover { background: #FEF2F2 !important; }
    }
    .activate-btn {
      border-color: #A7F3D0 !important; color: #059669 !important;
      border-radius: 10px !important; font-size: 0.78rem !important; height: 32px !important;
      &:hover { background: #ECFDF5 !important; }
    }
  `]
})
export class AdminHospitalsComponent implements OnInit {
  hospitals: any[] = [];
  cols = ['hospital', 'contact', 'status', 'actions'];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.loading = true;
    this.api.get<any>('/admin/hospitals').subscribe({
      next: res => { this.hospitals = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  toggle(h: any): void {
    const newActive = h.isActive === false;   // flip current state
    this.api.patch<any>(`/admin/hospitals/${h.id}/toggle`, { active: newActive }).subscribe({
      next: () => {
        h.isActive = newActive;
        this.snack.open(
          `Hospital ${newActive ? 'activated' : 'deactivated'}.`,
          '', { duration: 2000 }
        );
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Action failed.', 'Close', { duration: 3000 });
      }
    });
  }
}
