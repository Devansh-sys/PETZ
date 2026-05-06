import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-ngos',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <button mat-icon-button routerLink="/admin" class="back-btn" title="Back to Admin Panel">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>NGO Management</h1>
            <p>Create and manage rescue organisations</p>
          </div>
        </div>
      </div>

      <!-- Info notice — NGOs self-register -->
      <div class="info-notice">
        <mat-icon>info_outline</mat-icon>
        <span>NGOs register themselves via the <strong>Sign Up</strong> page selecting the "NGO / Rescue Organisation" account type. Use the Verify and Activate buttons below to manage them.</span>
      </div>

      <!-- NGO table -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading NGOs...</span>
        </div>
      }

      @if (!loading) {
        <div class="table-card">
          @if (ngos.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>business</mat-icon></div>
              <h3>No NGOs registered</h3>
              <p>Create the first NGO using the button above.</p>
            </div>
          }

          @if (ngos.length > 0) {
            <table mat-table [dataSource]="ngos" style="width:100%">

              <ng-container matColumnDef="ngo">
                <th mat-header-cell *matHeaderCellDef>Organisation</th>
                <td mat-cell *matCellDef="let n" style="padding:14px 18px">
                  <div class="ngo-row">
                    <div class="ngo-avatar-sm">{{ n.name?.charAt(0) || 'N' }}</div>
                    <div>
                      <div style="font-weight:700;font-size:0.88rem;color:#1C0902">{{ n.name }}</div>
                      <div style="font-size:0.74rem;color:#A8A29E">{{ n.city || '—' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let n" style="font-size:0.83rem;color:#78716C">
                  {{ n.phone || n.email || '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let n">
                  <span class="chip" [ngClass]="n.isActive ? 'active' : 'inactive'">
                    {{ n.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="verified">
                <th mat-header-cell *matHeaderCellDef>Verification</th>
                <td mat-cell *matCellDef="let n">
                  <span class="chip" [ngClass]="n.isVerified ? 'confirmed' : 'pending'">
                    {{ n.isVerified ? '✓ Verified' : 'Pending' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let n" style="text-align:right;padding-right:18px">
                  <div style="display:flex;gap:8px;justify-content:flex-end">
                    @if (!n.isVerified) {
                      <button mat-stroked-button (click)="verify(n)" class="verify-btn">
                        <mat-icon>verified</mat-icon> Verify
                      </button>
                    }
                    <button mat-stroked-button (click)="toggle(n)"
                            [class]="n.isActive ? 'deactivate-btn' : 'activate-btn'">
                      {{ n.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
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
    .info-notice {
      display: flex; align-items: flex-start; gap: 10px;
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px;
      padding: 14px 18px; font-size: 0.83rem; color: #1E40AF;
      margin-bottom: 20px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
    }
    .page-header-left {
      display: flex; align-items: center; gap: 12px;
    }
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important;
      background: #fff !important;
      border: 1px solid #F0E0D6 !important;
      color: #78716C !important;
      flex-shrink: 0;
      &:hover { border-color: #F97316 !important; color: #F97316 !important; }
    }
    .ngo-row { display: flex; align-items: center; gap: 10px; }
    .ngo-avatar-sm {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #B97AFB, #7C3AED);
      color: #fff; font-weight: 800; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .verify-btn {
      border-color: #A7F3D0 !important; color: #059669 !important;
      border-radius: 10px !important; font-size: 0.78rem !important; height: 32px !important;
      mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; }
      &:hover { background: #ECFDF5 !important; }
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
export class AdminNgosComponent implements OnInit {
  ngos: any[] = [];
  cols = ['ngo', 'contact', 'status', 'verified', 'actions'];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.loadNgos();
  }

  loadNgos(): void {
    this.loading = true;
    this.api.get<any>('/admin/ngos').subscribe({
      next: res => { this.ngos = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  verify(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/verify`, { verified: true }).subscribe({
      next: () => {
        ngo.isVerified = true;
        this.snack.open('NGO verified! ✓', '', { duration: 2000 });
      }
    });
  }

  toggle(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/toggle`, { active: !ngo.isActive }).subscribe({
      next: () => {
        ngo.isActive = !ngo.isActive;
        this.snack.open(`NGO ${ngo.isActive ? 'activated' : 'deactivated'}.`, '', { duration: 2000 });
      }
    });
  }
}
