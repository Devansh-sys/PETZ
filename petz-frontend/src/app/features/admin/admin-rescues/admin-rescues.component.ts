import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-admin-rescues',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/admin" class="back-btn" title="Back to Admin Panel">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Rescue Oversight</h1>
            <p>Monitor all animal rescue reports platform-wide</p>
          </div>
        </div>
        <div class="rescue-stats">
          <div class="r-stat pending-stat">
            <span>{{ pendingCount }}</span> Pending
          </div>
          <div class="r-stat progress-stat">
            <span>{{ progressCount }}</span> Active
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-row">
        @for (s of statuses; track s.value) {
          <button class="filter-chip" [class.active]="statusFilter === s.value"
                  (click)="setFilter(s.value)">
            {{ s.label }}
          </button>
        }
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading rescue reports...</span>
        </div>
      }

      @if (!loading) {
        <div class="table-card">
          @if (filtered.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>emergency</mat-icon></div>
              <h3>No rescue reports</h3>
              <p>No reports matching your filter.</p>
            </div>
          }

          @if (filtered.length > 0) {
            <table mat-table [dataSource]="filtered" style="width:100%">
              <ng-container matColumnDef="animal">
                <th mat-header-cell *matHeaderCellDef>Animal</th>
                <td mat-cell *matCellDef="let r" style="padding:14px 18px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="rescue-icon-sm">
                      <mat-icon>pets</mat-icon>
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:0.88rem;color:#1C0902">{{ r.animalType || 'Unknown' }}</div>
                      <div style="font-size:0.74rem;color:#A8A29E">ID #{{ r.id }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="crit">
                <th mat-header-cell *matHeaderCellDef>Urgency</th>
                <td mat-cell *matCellDef="let r">
                  <span class="crit-badge crit-{{ r.criticality?.toLowerCase() }}">{{ r.criticality }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="address">
                <th mat-header-cell *matHeaderCellDef>Location</th>
                <td mat-cell *matCellDef="let r" style="font-size:0.82rem;color:#78716C;max-width:200px">
                  {{ r.address || '—' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="chip" [ngClass]="r.status?.toLowerCase()?.replace(' ','_')">{{ r.status }}</span>
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
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #F0E0D6 !important; color: #78716C !important; flex-shrink: 0;
      &:hover { border-color: #F97316 !important; color: #F97316 !important; }
    }
    .rescue-stats { display: flex; gap: 10px; }
    .r-stat {
      display: flex; align-items: center; gap: 6px;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 600;
      span { font-weight: 900; font-size: 0.9rem; }
    }
    .pending-stat  { background: #FEF3C7; color: #92400E; }
    .progress-stat { background: #DBEAFE; color: #1E40AF; }
    .filter-row {
      display: flex; gap: 8px; flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .filter-chip {
      padding: 6px 16px;
      border-radius: 999px;
      border: 1px solid #F0E0D6;
      background: #fff;
      color: #78716C;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
      &.active, &:hover { background: #F97316; color: #fff; border-color: #F97316; }
    }
    .rescue-icon-sm {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #F87171, #DC2626);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #fff; font-size: 18px; width: 18px; height: 18px; }
    }
    .crit-badge {
      display: inline-block; padding: 2px 10px;
      border-radius: 999px; font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .crit-low      { background: #D1FAE5; color: #065F46; }
    .crit-medium   { background: #FEF3C7; color: #92400E; }
    .crit-high     { background: #FFEDD5; color: #9A3412; }
    .crit-critical { background: #FEE2E2; color: #991B1B; }
  `]
})
export class AdminRescuesComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  cols = ['animal', 'crit', 'address', 'status'];
  loading = true;
  statusFilter = '';
  statuses = [
    { label: 'All',         value: '' },
    { label: 'Pending',     value: 'PENDING' },
    { label: 'Assigned',    value: 'ASSIGNED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed',   value: 'COMPLETED' }
  ];

  get pendingCount()  { return this.all.filter(r => r.status === 'PENDING').length; }
  get progressCount() { return this.all.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length; }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/rescues').subscribe({
      next: res => { this.all = res.data ?? []; this.filtered = this.all; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  setFilter(value: string): void {
    this.statusFilter = value;
    this.filtered = value ? this.all.filter(r => r.status === value) : this.all;
  }
}
