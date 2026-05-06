import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-users',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/admin" class="back-btn" title="Back to Admin Panel">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>User Management</h1>
            <p>View and manage all platform accounts</p>
          </div>
        </div>
        <div class="user-count-badge">
          <mat-icon>people</mat-icon>
          <span>{{ users.length }} users</span>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading users...</span>
        </div>
      }

      @if (!loading) {
        <div class="table-card">
          @if (users.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>people_outline</mat-icon></div>
              <h3>No users found</h3>
            </div>
          }

          @if (users.length > 0) {
            <table mat-table [dataSource]="users" style="width:100%">
              <ng-container matColumnDef="avatar">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let u" style="width:48px;padding:12px 8px 12px 18px">
                  <div class="user-avatar-sm">{{ u.name?.charAt(0)?.toUpperCase() || '?' }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let u">
                  <div style="font-weight:700;font-size:0.88rem;color:#1C0902">{{ u.name }}</div>
                  <div style="font-size:0.75rem;color:#A8A29E">{{ u.email }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let u">
                  <span class="role-badge role-{{ u.role?.toLowerCase() }}">{{ u.role }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let u">
                  <span class="chip" [ngClass]="u.isActive ? 'confirmed' : 'cancelled'">
                    {{ u.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let u" style="text-align:right;padding-right:18px">
                  <button mat-stroked-button (click)="toggle(u)"
                          [ngClass]="u.isActive ? 'deactivate-btn' : 'activate-btn'">
                    {{ u.isActive ? 'Deactivate' : 'Activate' }}
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
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important;
      background: #fff !important;
      border: 1px solid #F0E0D6 !important;
      color: #78716C !important;
      flex-shrink: 0;
      &:hover { border-color: #F97316 !important; color: #F97316 !important; }
    }
    .user-count-badge {
      display: flex; align-items: center; gap: 6px;
      background: #FFEDD5; color: #9A3412;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .user-avatar-sm {
      width: 34px; height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #FF9748, #F97316);
      color: #fff;
      font-weight: 800;
      font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center;
    }
    .role-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .role-user     { background: #DBEAFE; color: #1E40AF; }
    .role-ngo      { background: #EDE9FE; color: #5B21B6; }
    .role-hospital { background: #D1FAE5; color: #065F46; }
    .role-admin    { background: #FEE2E2; color: #991B1B; }
    .deactivate-btn {
      border-color: #FECACA !important;
      color: #DC2626 !important;
      border-radius: 10px !important;
      font-size: 0.78rem !important;
      height: 32px !important;
      &:hover { background: #FEF2F2 !important; }
    }
    .activate-btn {
      border-color: #A7F3D0 !important;
      color: #059669 !important;
      border-radius: 10px !important;
      font-size: 0.78rem !important;
      height: 32px !important;
      &:hover { background: #ECFDF5 !important; }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  cols = ['avatar', 'name', 'role', 'status', 'actions'];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/users').subscribe({
      next: res => { this.users = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  toggle(user: any): void {
    this.api.patch<any>(`/admin/users/${user.id}/toggle`, { active: !user.isActive }).subscribe({
      next: res => {
        user.isActive = res.data.isActive;
        this.snack.open(`User ${user.isActive ? 'activated' : 'deactivated'}.`, '', { duration: 2000 });
      }
    });
  }
}
