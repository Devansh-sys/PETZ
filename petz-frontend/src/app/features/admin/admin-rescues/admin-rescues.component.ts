import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { rescueStatusLabel } from '../../../core/utils/rescue-status.util';

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
          <div class="r-stat unassigned-stat">
            <span>{{ unassignedCount }}</span> Unassigned
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">

        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input [(ngModel)]="filters.search" (ngModelChange)="applyFilters()"
                 placeholder="Search location, description, animal…" class="search-input" />
          @if (filters.search) {
            <button class="clear-search" (click)="filters.search=''; applyFilters()">
              <mat-icon style="font-size:15px;width:15px;height:15px">close</mat-icon>
            </button>
          }
        </div>

        <div class="select-group">
          <span class="select-label">Status</span>
          <select class="filter-select" [(ngModel)]="filters.status" (ngModelChange)="applyFilters()">
            @for (s of statuses; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
        </div>

        <div class="select-group">
          <span class="select-label">Urgency</span>
          <select class="filter-select" [(ngModel)]="filters.urgency" (ngModelChange)="applyFilters()">
            @for (u of urgencies; track u.value) {
              <option [value]="u.value">{{ u.label }}</option>
            }
          </select>
        </div>

        <div class="select-group">
          <span class="select-label">Animal</span>
          <select class="filter-select" [(ngModel)]="filters.animalType" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            @for (t of availableAnimalTypes; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>

        <div class="select-group">
          <span class="select-label">Assigned</span>
          <select class="filter-select" [(ngModel)]="filters.assignment" (ngModelChange)="applyFilters()">
            @for (a of assignmentOptions; track a.value) {
              <option [value]="a.value">{{ a.label }}</option>
            }
          </select>
        </div>

        <div class="select-group">
          <span class="select-label">Sort by</span>
          <select class="filter-select" [(ngModel)]="filters.sort" (ngModelChange)="applyFilters()">
            @for (s of sortOptions; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
        </div>

        @if (activeFilterCount > 0) {
          <button class="clear-all-btn" (click)="clearAll()">
            Clear <span class="filter-badge">{{ activeFilterCount }}</span>
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
          <div class="results-count">
            Showing <strong>{{ filteredData.length }}</strong> of <strong>{{ all.length }}</strong> reports
          </div>

          @if (filteredData.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>emergency</mat-icon></div>
              <h3>No rescue reports</h3>
              <p>No reports match your current filters.</p>
            </div>
          }

          @if (filteredData.length > 0) {
            <table mat-table [dataSource]="filteredData" style="width:100%">

              <ng-container matColumnDef="animal">
                <th mat-header-cell *matHeaderCellDef>Animal</th>
                <td mat-cell *matCellDef="let r" style="padding:14px 18px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="rescue-icon-sm">
                      <mat-icon>pets</mat-icon>
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:0.88rem;color:#1A3547">{{ r.animalType || 'Unknown' }}</div>
                      <div style="font-size:0.74rem;color:#8BA3B5">ID #{{ r.id }}</div>
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
                <td mat-cell *matCellDef="let r" style="font-size:0.82rem;color:#4A6478;max-width:200px">
                  {{ r.address || '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="ngo">
                <th mat-header-cell *matHeaderCellDef>Assigned NGO</th>
                <td mat-cell *matCellDef="let r">
                  @if (r.ngoName) {
                    <span class="ngo-chip">{{ r.ngoName }}</span>
                  } @else {
                    <span class="unassigned-chip">Unassigned</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="chip" [ngClass]="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"
                  class="table-row"
                  [class]="'table-row urgency-row-' + row.criticality?.toLowerCase()"
                  (click)="selected = row"></tr>
            </table>
          }
        </div>
      }

    </div>

    <!-- Detail Popup -->
    @if (selected) {
      <div class="popup-overlay" (click)="selected = null">
        <div class="popup-card" (click)="$event.stopPropagation()">

          <!-- Close -->
          <button class="popup-close" (click)="selected = null">
            <mat-icon>close</mat-icon>
          </button>

          <!-- Header -->
          <div class="popup-header" [class]="'popup-header crit-header-' + selected.criticality?.toLowerCase()">
            <div class="popup-avatar">
              <mat-icon>pets</mat-icon>
            </div>
            <div class="popup-title-block">
              <div class="popup-animal">{{ selected.animalType || 'Unknown Animal' }}</div>
              <div class="popup-id-row">
                <span class="popup-id-badge">#{{ selected.id }}</span>
                <span class="crit-badge crit-{{ selected.criticality?.toLowerCase() }}">{{ selected.criticality }}</span>
                <span class="chip small-chip" [ngClass]="statusClass(selected.status)">{{ statusLabel(selected.status) }}</span>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="popup-body">

            <!-- Photo -->
            @if (selected.photoUrl) {
              <div class="photo-section">
                <img [src]="selected.photoUrl" alt="Animal photo" class="rescue-photo" />
                <div class="photo-label">Reported photo</div>
              </div>
            }

            <!-- Description -->
            @if (selected.description) {
              <div class="detail-group">
                <div class="detail-label">Description</div>
                <div class="detail-value desc-value">{{ selected.description }}</div>
              </div>
            }

            <!-- Location -->
            <div class="detail-group">
              <div class="detail-label">Location</div>
              <div class="detail-value">{{ selected.address || '—' }}</div>
            </div>

            <!-- Timestamps row -->
            <div class="detail-row-2">
              <div class="detail-group">
                <div class="detail-label">Reported At</div>
                <div class="detail-value">{{ formatDate(selected.reportedAt) }}</div>
              </div>
              <div class="detail-group">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">{{ formatDate(selected.updatedAt) }}</div>
              </div>
            </div>

            <!-- Response time -->
            @if (selected.reportedAt && selected.updatedAt) {
              <div class="response-time-block">
                <mat-icon class="rt-icon">timer</mat-icon>
                <span>{{ responseTime(selected.reportedAt, selected.updatedAt) }}</span>
              </div>
            }

            <!-- Reporter -->
            <div class="detail-group">
              <div class="detail-label">Reporter ID</div>
              <div class="detail-value">
                <span class="id-mono">#{{ selected.reporterId || '—' }}</span>
              </div>
            </div>

            <!-- Assigned NGO -->
            <div class="detail-group">
              <div class="detail-label">Assigned NGO</div>
              @if (selected.ngoName) {
                <div class="ngo-block">
                  <div class="ngo-name">{{ selected.ngoName }}</div>
                  @if (selected.ngoPhone) {
                    <div class="ngo-meta"><mat-icon class="ngo-icon">phone</mat-icon>{{ selected.ngoPhone }}</div>
                  }
                  @if (selected.ngoEmail) {
                    <div class="ngo-meta"><mat-icon class="ngo-icon">email</mat-icon>{{ selected.ngoEmail }}</div>
                  }
                  @if (selected.ngoCity || selected.ngoAddress) {
                    <div class="ngo-meta"><mat-icon class="ngo-icon">location_on</mat-icon>{{ selected.ngoCity }}{{ selected.ngoCity && selected.ngoAddress ? ', ' : '' }}{{ selected.ngoAddress }}</div>
                  }
                </div>
              } @else {
                <span class="unassigned-chip" style="margin-top:4px;display:inline-block">Unassigned</span>
              }
            </div>

            <!-- Resolution Notes -->
            @if (selected.resolutionNotes) {
              <div class="detail-group">
                <div class="detail-label">Resolution Notes</div>
                <div class="detail-value desc-value resolution-note">{{ selected.resolutionNotes }}</div>
              </div>
            }

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Back button ────────────────────────── */
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #E0EBF2 !important; color: #4A6478 !important; flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }

    /* ── Header stats ───────────────────────── */
    .rescue-stats { display: flex; gap: 10px; flex-wrap: wrap; }
    .r-stat {
      display: flex; align-items: center; gap: 6px;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 600;
      span { font-weight: 900; font-size: 0.9rem; }
    }
    .pending-stat    { background: #FEF3C7; color: #92400E; }
    .progress-stat   { background: #DBEAFE; color: #1E40AF; }
    .unassigned-stat { background: #F3E8FF; color: #6B21A8; }

    /* ── Filter bar ─────────────────────────── */
    .filter-bar {
      display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
      background: #fff; border-radius: 14px; border: 1px solid #E0EBF2;
      padding: 12px 16px; margin-bottom: 20px;
    }
    .search-box {
      flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
      border: 1.5px solid #E0EBF2; border-radius: 10px;
      padding: 7px 12px; background: #F9FBFB;
      &:focus-within { border-color: #FF8C42; background: #fff; }
    }
    .search-icon { color: #8BA3B5; font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .search-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-family: 'DM Sans', sans-serif; font-size: 0.83rem; color: #1A3547;
      &::placeholder { color: #B0C4D0; }
    }
    .clear-search {
      border: none; background: none; cursor: pointer; color: #8BA3B5;
      display: flex; align-items: center; padding: 0;
      &:hover { color: #EF4444; }
    }
    .select-group {
      display: flex; flex-direction: column; gap: 3px;
    }
    .select-label {
      font-size: 0.65rem; font-weight: 700; color: #8BA3B5;
      text-transform: uppercase; letter-spacing: 0.07em; padding-left: 2px;
    }
    .filter-select {
      height: 34px; padding: 0 10px; border-radius: 10px;
      border: 1.5px solid #E0EBF2; background: #F9FBFB;
      color: #4A6478; font-size: 0.8rem; font-weight: 600;
      font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none;
      appearance: auto;
      &:focus { border-color: #FF8C42; background: #fff; color: #1A3547; }
    }
    .clear-all-btn {
      display: flex; align-items: center; gap: 6px; white-space: nowrap;
      border: 1.5px solid #EF4444; border-radius: 999px; padding: 5px 12px;
      background: #FEF2F2; color: #DC2626; font-size: 0.78rem; font-weight: 700;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      &:hover { background: #EF4444; color: #fff; }
    }
    .filter-badge {
      background: #EF4444; color: #fff; border-radius: 999px;
      padding: 1px 7px; font-size: 0.7rem; font-weight: 800;
    }

    /* ── Results count ──────────────────────── */
    .results-count {
      font-size: 0.78rem; color: #8BA3B5; padding: 8px 16px 4px;
      strong { color: #1A3547; }
    }

    /* ── Rescue icon ────────────────────────── */
    .rescue-icon-sm {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #F87171, #DC2626);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #fff; font-size: 18px; width: 18px; height: 18px; }
    }

    /* ── Urgency badge ──────────────────────── */
    .crit-badge {
      display: inline-block; padding: 2px 10px;
      border-radius: 999px; font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .crit-low      { background: #D1FAE5; color: #065F46; }
    .crit-medium   { background: #FEF3C7; color: #92400E; }
    .crit-high     { background: #FFEDD5; color: #9A3412; }
    .crit-critical { background: #FEE2E2; color: #991B1B; }

    /* ── Status chip ────────────────────────── */
    .chip {
      display: inline-block; padding: 3px 10px;
      border-radius: 999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    }
    .pending     { background: #FEF3C7; color: #92400E; }
    .assigned    { background: #DBEAFE; color: #1E40AF; }
    .in_progress { background: #E0E7FF; color: #3730A3; }
    .completed   { background: #D1FAE5; color: #065F46; }
    .resolved    { background: #D1FAE5; color: #065F46; }

    /* ── NGO / Unassigned chips ─────────────── */
    .ngo-chip {
      display: inline-block; padding: 3px 10px; border-radius: 999px;
      background: #F3E8FF; color: #6B21A8; font-size: 0.75rem; font-weight: 700;
    }
    .unassigned-chip {
      display: inline-block; padding: 3px 10px; border-radius: 999px;
      background: #F1F5F9; color: #64748B; font-size: 0.75rem; font-weight: 600; font-style: italic;
    }

    /* ── Urgency-colored row left border ────── */
    .table-row { cursor: pointer; transition: background 0.12s; }
    .table-row:hover { background: #F9FBFB !important; }

    .urgency-row-critical { border-left: 4px solid #DC2626 !important; }
    .urgency-row-high     { border-left: 4px solid #EA580C !important; }
    .urgency-row-medium   { border-left: 4px solid #D97706 !important; }
    .urgency-row-low      { border-left: 4px solid #059669 !important; }

    /* ── Popup overlay ──────────────────────── */
    .popup-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(15,30,45,0.45);
      backdrop-filter: blur(3px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: fadeIn 0.18s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .popup-card {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 520px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 80px rgba(15,30,45,0.28);
      position: relative;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .popup-close {
      position: absolute; top: 12px; right: 12px; z-index: 10;
      border: none; background: rgba(255,255,255,0.25); border-radius: 50%;
      width: 32px; height: 32px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #fff; transition: background 0.15s;
      &:hover { background: rgba(255,255,255,0.4); }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    /* ── Popup header ───────────────────────── */
    .popup-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 24px 20px;
      border-radius: 20px 20px 0 0;
      background: linear-gradient(135deg, #EF4444 0%, #991B1B 100%);
    }
    .crit-header-critical { background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%); }
    .crit-header-high     { background: linear-gradient(135deg, #EA580C 0%, #9A3412 100%); }
    .crit-header-medium   { background: linear-gradient(135deg, #D97706 0%, #92400E 100%); }
    .crit-header-low      { background: linear-gradient(135deg, #059669 0%, #064E3B 100%); }

    .popup-avatar {
      width: 56px; height: 56px; border-radius: 16px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #fff; font-size: 28px; width: 28px; height: 28px; }
    }
    .popup-animal {
      font-size: 1.3rem; font-weight: 900; color: #fff;
      font-family: 'Quicksand', system-ui, sans-serif;
      text-transform: capitalize;
    }
    .popup-id-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
    .popup-id-badge {
      background: rgba(255,255,255,0.22); color: #fff;
      font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 999px;
    }
    .small-chip { font-size: 0.65rem; padding: 2px 8px; }

    /* ── Popup body ─────────────────────────── */
    .popup-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; }

    .photo-section {
      text-align: center;
      .rescue-photo {
        width: 100%; max-height: 200px; object-fit: cover;
        border-radius: 12px; border: 1px solid #E0EBF2;
      }
      .photo-label { font-size: 0.72rem; color: #8BA3B5; margin-top: 6px; }
    }

    .detail-group { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.07em; }
    .detail-value { font-size: 0.88rem; color: #1A3547; font-weight: 500; }
    .desc-value { line-height: 1.5; }

    .detail-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* ── Response time block ────────────────── */
    .response-time-block {
      display: flex; align-items: center; gap: 8px;
      background: #F0FDF4; border-radius: 10px; padding: 8px 14px;
      font-size: 0.82rem; color: #065F46; font-weight: 600;
      border: 1px solid #A7F3D0;
    }
    .rt-icon { font-size: 16px; width: 16px; height: 16px; color: #059669; }

    .id-mono { font-family: 'Courier New', monospace; font-size: 0.85rem; color: #6B21A8; font-weight: 700; }

    /* ── NGO block ──────────────────────────── */
    .ngo-block {
      background: #FAF5FF; border-radius: 12px; padding: 12px 14px;
      border: 1px solid #E9D5FF; margin-top: 4px;
    }
    .ngo-name { font-weight: 800; font-size: 0.92rem; color: #6B21A8; margin-bottom: 8px; }
    .ngo-meta {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.8rem; color: #4A6478; margin-bottom: 4px;
    }
    .ngo-icon { font-size: 14px; width: 14px; height: 14px; color: #8B5CF6; flex-shrink: 0; }

    /* ── Resolution note ────────────────────── */
    .resolution-note {
      background: #F0FDF4; border-radius: 10px; padding: 10px 14px;
      border-left: 3px solid #10B981; color: #065F46;
    }
  `]
})
export class AdminRescuesComponent implements OnInit {
  all: any[] = [];
  filteredData: any[] = [];
  selected: any = null;
  loading = true;

  cols = ['animal', 'crit', 'address', 'ngo', 'status'];

  filters = {
    search: '',
    status: '',
    urgency: '',
    animalType: '',
    assignment: '',
    sort: 'newest'
  };

  statuses = [
    { label: 'All',                    value: '' },
    { label: 'Pending',                value: 'PENDING' },
    { label: 'Reported',               value: 'ASSIGNED' },
    { label: 'Assigned & In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed',              value: 'COMPLETED' }
  ];

  urgencies = [
    { label: 'All',      value: '' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High',     value: 'HIGH' },
    { label: 'Medium',   value: 'MEDIUM' },
    { label: 'Low',      value: 'LOW' }
  ];

  assignmentOptions = [
    { label: 'All',        value: '' },
    { label: 'Assigned',   value: 'assigned' },
    { label: 'Unassigned', value: 'unassigned' }
  ];

  sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' }
  ];

  get pendingCount()    { return this.all.filter(r => r.status === 'PENDING').length; }
  get progressCount()   { return this.all.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length; }
  get unassignedCount() { return this.all.filter(r => !r.ngoName).length; }

  get availableAnimalTypes(): string[] {
    const types = this.all.map(r => r.animalType).filter(t => !!t);
    return [...new Set(types)].sort();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filters.search)      count++;
    if (this.filters.status)      count++;
    if (this.filters.urgency)     count++;
    if (this.filters.animalType)  count++;
    if (this.filters.assignment)  count++;
    if (this.filters.sort !== 'newest') count++;
    return count;
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/rescues').subscribe({
      next: res => {
        this.all = res.data ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.all];

    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      result = result.filter(r =>
        (r.address || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.animalType || '').toLowerCase().includes(q)
      );
    }

    if (this.filters.status) {
      result = result.filter(r => r.status === this.filters.status);
    }

    if (this.filters.urgency) {
      result = result.filter(r => r.criticality === this.filters.urgency);
    }

    if (this.filters.animalType) {
      result = result.filter(r => r.animalType === this.filters.animalType);
    }

    if (this.filters.assignment === 'assigned') {
      result = result.filter(r => !!r.ngoName);
    } else if (this.filters.assignment === 'unassigned') {
      result = result.filter(r => !r.ngoName);
    }

    result.sort((a, b) => {
      const aTime = new Date(a.reportedAt || 0).getTime();
      const bTime = new Date(b.reportedAt || 0).getTime();
      return this.filters.sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    this.filteredData = result;
  }

  clearAll(): void {
    this.filters = { search: '', status: '', urgency: '', animalType: '', assignment: '', sort: 'newest' };
    this.applyFilters();
  }

  statusLabel(status: string): string {
    return rescueStatusLabel(status);
  }

  statusClass(status: string): string {
    return (status || '').toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  responseTime(reportedAt: string, updatedAt: string): string {
    const diff = new Date(updatedAt).getTime() - new Date(reportedAt).getTime();
    if (diff <= 0) return 'Updated immediately';
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `Updated ${days}d ${hours % 24}h after report`;
    if (hours > 0) return `Updated ${hours}h ${mins % 60}m after report`;
    return `Updated ${mins}m after report`;
  }
}
