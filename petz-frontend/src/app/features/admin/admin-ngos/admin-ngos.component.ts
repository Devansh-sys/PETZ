import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-ngos',
  template: `
    <div class="page-container">
      <h1>NGO Management</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="ngos" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let n">{{ n.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let n">{{ n.name }}</td>
            </ng-container>
            <ng-container matColumnDef="city">
              <th mat-header-cell *matHeaderCellDef>City</th>
              <td mat-cell *matCellDef="let n">{{ n.city }}</td>
            </ng-container>
            <ng-container matColumnDef="verified">
              <th mat-header-cell *matHeaderCellDef>Verified</th>
              <td mat-cell *matCellDef="let n">
                <span class="chip" [ngClass]="n.isVerified ? 'confirmed' : 'pending'">
                  {{ n.isVerified ? 'Yes' : 'Pending' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let n">
                @if (!n.isVerified) {
                  <button mat-stroked-button color="primary" (click)="verify(n)">Verify</button>
                }
                @if (n.isActive) {
                  <button mat-stroked-button color="warn" (click)="toggle(n)">Deactivate</button>
                }
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
export class AdminNgosComponent implements OnInit {
  ngos: any[] = [];
  cols = ['id', 'name', 'city', 'verified', 'actions'];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/ngos').subscribe({
      next: res => { this.ngos = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  verify(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/verify`, { verified: true }).subscribe({
      next: () => {
        ngo.isVerified = true;
        this.snack.open('NGO verified!', '', { duration: 2000 });
      }
    });
  }

  toggle(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/toggle`, { active: !ngo.isActive }).subscribe({
      next: () => {
        ngo.isActive = !ngo.isActive;
        this.snack.open('NGO status updated.', '', { duration: 2000 });
      }
    });
  }
}
