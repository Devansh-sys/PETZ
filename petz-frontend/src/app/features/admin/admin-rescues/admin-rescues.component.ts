import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-admin-rescues',
  template: `
    <div class="page-container">
      <h1>All Rescue Reports</h1>
      <mat-form-field appearance="outline" style="margin-bottom:12px">
        <mat-label>Filter by status</mat-label>
        <mat-select [(ngModel)]="statusFilter" (ngModelChange)="filter()">
          <mat-option value="">All</mat-option>
          <mat-option value="PENDING">Pending</mat-option>
          <mat-option value="ASSIGNED">Assigned</mat-option>
          <mat-option value="IN_PROGRESS">In Progress</mat-option>
          <mat-option value="COMPLETED">Completed</mat-option>
        </mat-select>
      </mat-form-field>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="filtered" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let r">{{ r.id }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Animal</th>
              <td mat-cell *matCellDef="let r">{{ r.animalType }}</td>
            </ng-container>
            <ng-container matColumnDef="crit">
              <th mat-header-cell *matHeaderCellDef>Criticality</th>
              <td mat-cell *matCellDef="let r">{{ r.criticality }}</td>
            </ng-container>
            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>Address</th>
              <td mat-cell *matCellDef="let r">{{ r.address }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r">
                <span class="chip" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (filtered.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B">
              No rescues found.
            </p>
          }
        </mat-card>
      }
    </div>
  `
})
export class AdminRescuesComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  cols = ['id', 'type', 'crit', 'address', 'status'];
  loading = true;
  statusFilter = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/rescues').subscribe({
      next: res => {
        this.all = res.data ?? [];
        this.filtered = this.all;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filter(): void {
    this.filtered = this.statusFilter
        ? this.all.filter(r => r.status === this.statusFilter)
        : this.all;
  }
}
