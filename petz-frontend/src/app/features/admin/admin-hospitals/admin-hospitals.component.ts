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
        <div class="hosp-stats">
          <div class="h-stat total-stat">
            <span>{{ all.length }}</span> Total
          </div>
          <div class="h-stat active-stat">
            <span>{{ activeCount }}</span> Active
          </div>
          <div class="h-stat inactive-stat">
            <span>{{ inactiveCount }}</span> Inactive
          </div>
        </div>
      </div>

      <!-- Info notice -->
      <div class="info-notice">
        <mat-icon>info_outline</mat-icon>
        <span>Hospitals register themselves via the <strong>Sign Up</strong> page selecting the "Veterinary Hospital" account type. Use the Verify and Activate buttons below to manage them.</span>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">

        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input [(ngModel)]="filters.search" (ngModelChange)="applyFilters()"
                 placeholder="Search by name, city, email…" class="search-input" />
          @if (filters.search) {
            <button class="clear-search" (click)="filters.search=''; applyFilters()">
              <mat-icon style="font-size:15px;width:15px;height:15px">close</mat-icon>
            </button>
          }
        </div>

        <div class="select-group">
          <span class="select-label">Status</span>
          <select class="filter-select" [(ngModel)]="filters.status" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="select-group">
          <span class="select-label">City</span>
          <select class="filter-select" [(ngModel)]="filters.city" (ngModelChange)="applyFilters()">
            <option value="">All Cities</option>
            @for (c of availableCities; track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select>
        </div>

        <div class="select-group">
          <span class="select-label">Sort by</span>
          <select class="filter-select" [(ngModel)]="filters.sort" (ngModelChange)="applyFilters()">
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
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
          <span>Loading hospitals...</span>
        </div>
      }

      @if (!loading) {
        <div class="table-card">

          <div class="results-count">
            Showing <strong>{{ filteredData.length }}</strong> of <strong>{{ all.length }}</strong> hospitals
          </div>

          @if (filteredData.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>local_hospital</mat-icon></div>
              <h3>No hospitals found</h3>
              <p>No hospitals match your current filters.</p>
            </div>
          }

          @if (filteredData.length > 0) {
            <table mat-table [dataSource]="filteredData" style="width:100%">

              <ng-container matColumnDef="hospital">
                <th mat-header-cell *matHeaderCellDef>Hospital</th>
                <td mat-cell *matCellDef="let h" style="padding:14px 18px">
                  <div class="hosp-row">
                    <div class="hosp-avatar-sm">
                      @if (h.logoUrl) {
                        <img [src]="h.logoUrl" alt="logo" class="logo-thumb" />
                      } @else {
                        <mat-icon>local_hospital</mat-icon>
                      }
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:0.88rem;color:#1A3547">{{ h.name }}</div>
                      <div style="font-size:0.74rem;color:#8BA3B5">{{ h.city || '—' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let h" style="font-size:0.83rem;color:#4A6478">
                  <div>{{ h.phone || '—' }}</div>
                  @if (h.email) {
                    <div style="font-size:0.75rem;color:#8BA3B5">{{ h.email }}</div>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="city">
                <th mat-header-cell *matHeaderCellDef>City</th>
                <td mat-cell *matCellDef="let h" style="font-size:0.83rem;color:#4A6478">
                  {{ h.city || '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let h">
                  <span class="chip" [ngClass]="h.isActive !== false ? 'active-chip' : 'inactive-chip'">
                    {{ h.isActive !== false ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let h" style="text-align:right;padding-right:18px">
                  <button mat-stroked-button (click)="toggle(h); $event.stopPropagation()"
                          [class]="h.isActive !== false ? 'deactivate-btn' : 'activate-btn'">
                    {{ h.isActive !== false ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"
                  class="table-row" (click)="selected = row"></tr>
            </table>
          }

        </div>
      }

    </div>

    <!-- Detail Popup -->
    @if (selected) {
      <div class="popup-overlay" (click)="selected = null">
        <div class="popup-card" (click)="$event.stopPropagation()">

          <button class="popup-close" (click)="selected = null">
            <mat-icon>close</mat-icon>
          </button>

          <!-- Header -->
          <div class="popup-header">
            <div class="popup-avatar">
              @if (selected.logoUrl) {
                <img [src]="selected.logoUrl" alt="logo" class="popup-logo" />
              } @else {
                <mat-icon>local_hospital</mat-icon>
              }
            </div>
            <div class="popup-title-block">
              <div class="popup-name">{{ selected.name }}</div>
              <div class="popup-id-row">
                <span class="popup-id-badge">#{{ selected.id }}</span>
                <span class="chip small-chip" [ngClass]="selected.isActive !== false ? 'active-chip' : 'inactive-chip'">
                  {{ selected.isActive !== false ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="popup-body">

            <div class="detail-row-2">
              <div class="detail-group">
                <div class="detail-label">Phone</div>
                <div class="detail-value">{{ selected.phone || '—' }}</div>
              </div>
              <div class="detail-group">
                <div class="detail-label">Email</div>
                <div class="detail-value">{{ selected.email || '—' }}</div>
              </div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Address</div>
              <div class="detail-value">
                {{ locationOf(selected) }}
              </div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Owner User ID</div>
              <div class="detail-value">
                <span class="id-mono">#{{ selected.ownerUserId || '—' }}</span>
              </div>
            </div>

            <div class="detail-row-2">
              <div class="detail-group">
                <div class="detail-label">Registered On</div>
                <div class="detail-value">{{ formatDate(selected.createdAt) }}</div>
              </div>
              <div class="detail-group">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">{{ formatDate(selected.updatedAt) }}</div>
              </div>
            </div>

            <!-- Action -->
            <div class="popup-actions">
              <button mat-stroked-button (click)="toggle(selected)"
                      [class]="selected.isActive !== false ? 'modal-deactivate' : 'modal-activate'">
                <mat-icon>{{ selected.isActive !== false ? 'block' : 'check_circle' }}</mat-icon>
                {{ selected.isActive !== false ? 'Deactivate Hospital' : 'Activate Hospital' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Back button ─────────────────────────── */
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #E0EBF2 !important; color: #4A6478 !important; flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }

    /* ── Header stats ────────────────────────── */
    .hosp-stats { display: flex; gap: 10px; flex-wrap: wrap; }
    .h-stat {
      display: flex; align-items: center; gap: 6px;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 600;
      span { font-weight: 900; font-size: 0.9rem; }
    }
    .total-stat    { background: #E0F2FE; color: #0369A1; }
    .active-stat   { background: #D1FAE5; color: #065F46; }
    .inactive-stat { background: #FEE2E2; color: #991B1B; }

    /* ── Info notice ─────────────────────────── */
    .info-notice {
      display: flex; align-items: flex-start; gap: 10px;
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px;
      padding: 14px 18px; font-size: 0.83rem; color: #1E40AF; margin-bottom: 20px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
    }

    /* ── Filter bar ──────────────────────────── */
    .filter-bar {
      display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
      background: #fff; border-radius: 14px; border: 1px solid #E0EBF2;
      padding: 12px 16px; margin-bottom: 20px;
    }
    .search-box {
      flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
      border: 1.5px solid #E0EBF2; border-radius: 10px;
      padding: 7px 12px; background: #F9FBFB;
      &:focus-within { border-color: #059669; background: #fff; }
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
    .select-group { display: flex; flex-direction: column; gap: 3px; }
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
      &:focus { border-color: #059669; background: #fff; color: #1A3547; }
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

    /* ── Results count ───────────────────────── */
    .results-count {
      font-size: 0.78rem; color: #8BA3B5; padding: 8px 16px 4px;
      strong { color: #1A3547; }
    }

    /* ── Table row ───────────────────────────── */
    .table-row { cursor: pointer; transition: background 0.12s; }
    .table-row:hover { background: #F0FDF4 !important; }

    /* ── Hospital avatar ─────────────────────── */
    .hosp-row { display: flex; align-items: center; gap: 10px; }
    .hosp-avatar-sm {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #34D399, #059669);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      overflow: hidden;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #fff; }
    }
    .logo-thumb { width: 100%; height: 100%; object-fit: cover; }

    /* ── Status chips ────────────────────────── */
    .chip {
      display: inline-block; padding: 3px 10px;
      border-radius: 999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    }
    .active-chip   { background: #D1FAE5; color: #065F46; }
    .inactive-chip { background: #FEE2E2; color: #991B1B; }

    /* ── Action buttons ──────────────────────── */
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

    /* ── Popup overlay ───────────────────────── */
    .popup-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(15,30,45,0.45); backdrop-filter: blur(3px);
      display: flex; align-items: center; justify-content: center; padding: 16px;
      animation: fadeIn 0.18s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .popup-card {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 80px rgba(15,30,45,0.28); position: relative;
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

    /* ── Popup header (teal gradient) ────────── */
    .popup-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 24px 20px; border-radius: 20px 20px 0 0;
      background: linear-gradient(135deg, #10B981 0%, #065F46 100%);
    }
    .popup-avatar {
      width: 60px; height: 60px; border-radius: 16px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      overflow: hidden;
      mat-icon { color: #fff; font-size: 30px; width: 30px; height: 30px; }
    }
    .popup-logo { width: 100%; height: 100%; object-fit: cover; }
    .popup-name {
      font-size: 1.25rem; font-weight: 900; color: #fff;
      font-family: 'Quicksand', system-ui, sans-serif;
    }
    .popup-id-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
    .popup-id-badge {
      background: rgba(255,255,255,0.22); color: #fff;
      font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 999px;
    }
    .small-chip { font-size: 0.65rem; padding: 2px 8px; }

    /* ── Popup body ──────────────────────────── */
    .popup-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; }
    .detail-group { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.07em; }
    .detail-value { font-size: 0.88rem; color: #1A3547; font-weight: 500; }
    .detail-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .id-mono { font-family: 'Courier New', monospace; font-size: 0.85rem; color: #059669; font-weight: 700; }

    /* ── Popup actions ───────────────────────── */
    .popup-actions { display: flex; gap: 10px; padding-top: 4px; }
    .modal-deactivate {
      flex: 1; border-color: #FECACA !important; color: #DC2626 !important;
      border-radius: 12px !important; height: 40px !important;
      display: flex; align-items: center; gap: 6px;
      &:hover { background: #FEF2F2 !important; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .modal-activate {
      flex: 1; border-color: #A7F3D0 !important; color: #059669 !important;
      border-radius: 12px !important; height: 40px !important;
      display: flex; align-items: center; gap: 6px;
      &:hover { background: #ECFDF5 !important; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `]
})
export class AdminHospitalsComponent implements OnInit {
  all: any[] = [];
  filteredData: any[] = [];
  selected: any = null;
  loading = true;

  cols = ['hospital', 'contact', 'city', 'status', 'actions'];

  filters = { search: '', status: '', city: '', sort: 'az' };

  get activeCount()   { return this.all.filter(h => h.isActive !== false).length; }
  get inactiveCount() { return this.all.filter(h => h.isActive === false).length; }

  get availableCities(): string[] {
    const cities = this.all.map(h => h.city).filter(c => !!c);
    return [...new Set(cities)].sort();
  }

  get activeFilterCount(): number {
    let n = 0;
    if (this.filters.search) n++;
    if (this.filters.status) n++;
    if (this.filters.city)   n++;
    if (this.filters.sort !== 'az') n++;
    return n;
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.loadHospitals(); }

  loadHospitals(): void {
    this.loading = true;
    this.api.get<any>('/admin/hospitals').subscribe({
      next: res => {
        // Load ALL hospitals so admin can see and manage both active and inactive ones.
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
      result = result.filter(h =>
        (h.name  || '').toLowerCase().includes(q) ||
        (h.city  || '').toLowerCase().includes(q) ||
        (h.email || '').toLowerCase().includes(q) ||
        (h.phone || '').toLowerCase().includes(q)
      );
    }

    if (this.filters.status === 'active') {
      result = result.filter(h => h.isActive !== false);
    } else if (this.filters.status === 'inactive') {
      result = result.filter(h => h.isActive === false);
    }

    if (this.filters.city) {
      result = result.filter(h => h.city === this.filters.city);
    }

    result.sort((a, b) => {
      if (this.filters.sort === 'za')     return (b.name || '').localeCompare(a.name || '');
      if (this.filters.sort === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (this.filters.sort === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return (a.name || '').localeCompare(b.name || '');
    });

    this.filteredData = result;
  }

  clearAll(): void {
    this.filters = { search: '', status: '', city: '', sort: 'az' };
    this.applyFilters();
  }

  toggle(h: any): void {
    const newActive = h.isActive === false;
    this.api.patch<any>(`/admin/hospitals/${h.id}/toggle`, { active: newActive }).subscribe({
      next: () => {
        h.isActive = newActive;
        if (this.selected?.id === h.id) this.selected = { ...this.selected, isActive: newActive };
        this.snack.open(`Hospital ${newActive ? 'activated' : 'deactivated'}.`, '', { duration: 2000 });
      },
      error: err => {
        this.snack.open(err.error?.message ?? 'Action failed.', 'Close', { duration: 3000 });
      }
    });
  }

  locationOf(h: any): string {
    return [h.address, h.city].filter(v => !!v).join(', ') || '—';
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
