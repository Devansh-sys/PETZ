import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-users',
  template: `
    <div class="page-container">
      <h1>Users</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="users" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let u">{{ u.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let u">{{ u.name }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u">{{ u.role }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Active</th>
              <td mat-cell *matCellDef="let u">
                <span class="chip" [ngClass]="u.isActive ? 'confirmed' : 'cancelled'">
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let u">
                <button mat-stroked-button (click)="toggle(u)">
                  {{ u.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  cols = ['id', 'name', 'email', 'role', 'status', 'actions'];
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
        this.snack.open('User status updated.', '', { duration: 2000 });
      }
    });
  }
}
