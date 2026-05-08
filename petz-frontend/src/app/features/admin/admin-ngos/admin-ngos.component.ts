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
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/admin" class="back-btn" title="Back to Admin Panel">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>NGO Management</h1>
            <p>Create and manage rescue organisations</p>
          </div>
        </div>
        <div class="ngo-count-badge">
          <mat-icon>business</mat-icon>
          <span>{{ ngos.length }} organisations</span>
        </div>
      </div>

      <!-- Info notice -->
      <div class="info-notice">
        <mat-icon>info_outline</mat-icon>
        <span>NGOs register themselves via the <strong>Sign Up</strong> page selecting the "NGO / Rescue Organisation" account type. Use the Verify and Activate buttons below to manage them.</span>
      </div>

      <!-- ── Filter Panel ── -->
      <div class="filter-panel">

        <!-- Row 1: Search + Sort + Clear -->
        <div class="filter-row">
          <div class="search-box">
            <mat-icon class="search-icon">search</mat-icon>
            <input class="search-input" placeholder="Search by name, city or email…"
                   [(ngModel)]="filters.search" />
            @if (filters.search) {
              <button class="search-clear" (click)="filters.search = ''">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>

          <div class="sort-wrap">
            <mat-icon class="sort-icon">sort</mat-icon>
            <select class="sort-select" [(ngModel)]="filters.sort">
              <option value="name_asc">Name A → Z</option>
              <option value="name_desc">Name Z → A</option>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
            </select>
          </div>

          @if (activeFilterCount > 0) {
            <button class="clear-all-btn" (click)="clearAll()">
              <mat-icon>filter_alt_off</mat-icon>
              Clear ({{ activeFilterCount }})
            </button>
          }
        </div>

        <!-- Row 2: Verification chips -->
        <div class="filter-row">
          <span class="filter-label">Verification</span>
          <div class="chip-group">
            @for (v of verifyOptions; track v.value) {
              <button class="filter-chip"
                      [class.active]="filters.verified === v.value"
                      [ngClass]="filters.verified === v.value ? 'fc-' + v.value.toLowerCase() : ''"
                      (click)="filters.verified = v.value">
                {{ v.label }}
              </button>
            }
          </div>
        </div>

        <!-- Row 3: Status + City + RegNo -->
        <div class="filter-row wrap">
          <div class="filter-group">
            <span class="filter-label">Status</span>
            <div class="chip-group">
              @for (s of statusOptions; track s.value) {
                <button class="filter-chip"
                        [class.active]="filters.status === s.value"
                        (click)="filters.status = s.value">
                  {{ s.label }}
                </button>
              }
            </div>
          </div>

          @if (availableCities.length > 0) {
            <div class="filter-group">
              <span class="filter-label">City</span>
              <div class="sort-wrap">
                <mat-icon class="sort-icon">location_city</mat-icon>
                <select class="sort-select" [(ngModel)]="filters.city">
                  <option value="ALL">All Cities</option>
                  @for (c of availableCities; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
            </div>
          }

          <div class="filter-group">
            <span class="filter-label">Registration</span>
            <div class="chip-group">
              @for (r of regOptions; track r.value) {
                <button class="filter-chip"
                        [class.active]="filters.regNo === r.value"
                        (click)="filters.regNo = r.value">
                  {{ r.label }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Result count row -->
        <div class="result-row">
          <span class="result-count" [class.zero]="filteredNgos.length === 0">
            @if (filteredNgos.length === ngos.length) {
              Showing all {{ ngos.length }} organisations
            } @else {
              Showing <strong>{{ filteredNgos.length }}</strong> of {{ ngos.length }} organisations
            }
          </span>
          @if (activeFilterCount > 0) {
            <span class="active-filters-badge">
              {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active
            </span>
          }
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading NGOs...</span>
        </div>
      }

      @if (!loading) {
        <div class="table-card">

          <!-- No results -->
          @if (filteredNgos.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>manage_search</mat-icon></div>
              <h3>No NGOs match your filters</h3>
              <p style="color:#8BA3B5;font-size:0.82rem;margin:4px 0 12px">
                Try adjusting or clearing the active filters
              </p>
              <button class="clear-all-btn" (click)="clearAll()">
                <mat-icon>filter_alt_off</mat-icon> Clear All Filters
              </button>
            </div>
          }

          @if (filteredNgos.length > 0) {
            <table mat-table [dataSource]="filteredNgos" style="width:100%">

              <ng-container matColumnDef="ngo">
                <th mat-header-cell *matHeaderCellDef>Organisation</th>
                <td mat-cell *matCellDef="let n" style="padding:14px 18px">
                  <div class="ngo-row">
                    <div class="ngo-avatar-sm">{{ n.name?.charAt(0) || 'N' }}</div>
                    <div>
                      <div style="font-weight:700;font-size:0.88rem;color:#1A3547">{{ n.name }}</div>
                      <div style="font-size:0.74rem;color:#8BA3B5">{{ n.city || '—' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let n">
                  <div style="font-size:0.82rem;color:#4A6478">{{ n.phone || '—' }}</div>
                  <div style="font-size:0.74rem;color:#8BA3B5">{{ n.email || '' }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="regno">
                <th mat-header-cell *matHeaderCellDef>Reg. No</th>
                <td mat-cell *matCellDef="let n">
                  @if (n.registrationNo) {
                    <span class="regno-badge">{{ n.registrationNo }}</span>
                  } @else {
                    <span style="font-size:0.78rem;color:#B0C4D4">—</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let n">
                  <span class="chip" [ngClass]="n.isActive ? 'confirmed' : 'cancelled'">
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
                      <button mat-stroked-button
                              (click)="$event.stopPropagation(); verify(n)"
                              class="verify-btn">
                        <mat-icon>verified</mat-icon> Verify
                      </button>
                    }
                    <button mat-stroked-button
                            (click)="$event.stopPropagation(); toggle(n)"
                            [class]="n.isActive ? 'deactivate-btn' : 'activate-btn'">
                      {{ n.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"
                  class="clickable-row"
                  (click)="selected = row"></tr>
            </table>
          }
        </div>
      }

    </div>

    <!-- ── NGO Detail Modal ── -->
    @if (selected) {
      <div class="modal-backdrop" (click)="selected = null">
        <div class="modal-card" (click)="$event.stopPropagation()">

          <!-- Purple header -->
          <div class="modal-header">
            <div class="modal-avatar">{{ selected.name?.charAt(0) || 'N' }}</div>
            <div class="modal-id-badge">#{{ selected.id }}</div>
            <button mat-icon-button class="modal-close" (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Name + badges -->
          <div class="modal-identity">
            <div class="modal-name">{{ selected.name }}</div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center">
              <span class="chip" [ngClass]="selected.isVerified ? 'confirmed' : 'pending'">
                {{ selected.isVerified ? '✓ Verified' : 'Pending Verification' }}
              </span>
              <span class="chip" [ngClass]="selected.isActive ? 'confirmed' : 'cancelled'">
                {{ selected.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <div class="modal-body">

            <div class="detail-section">

              @if (selected.email) {
                <div class="detail-row">
                  <mat-icon class="detail-icon">email</mat-icon>
                  <div>
                    <div class="detail-label">Email</div>
                    <a class="detail-link" [href]="'mailto:' + selected.email">{{ selected.email }}</a>
                  </div>
                </div>
              }

              @if (selected.phone) {
                <div class="detail-row">
                  <mat-icon class="detail-icon">call</mat-icon>
                  <div>
                    <div class="detail-label">Phone</div>
                    <a class="detail-link" [href]="'tel:' + selected.phone">{{ selected.phone }}</a>
                  </div>
                </div>
              }

              @if (selected.city || selected.address) {
                <div class="detail-row">
                  <mat-icon class="detail-icon">location_on</mat-icon>
                  <div>
                    <div class="detail-label">Location</div>
                    <div class="detail-value">{{ locationOf(selected) }}</div>
                  </div>
                </div>
              }

              @if (selected.registrationNo) {
                <div class="detail-row">
                  <mat-icon class="detail-icon">badge</mat-icon>
                  <div>
                    <div class="detail-label">Registration No</div>
                    <div class="detail-value">{{ selected.registrationNo }}</div>
                  </div>
                </div>
              }

              @if (selected.description) {
                <div class="detail-row">
                  <mat-icon class="detail-icon">description</mat-icon>
                  <div>
                    <div class="detail-label">About</div>
                    <div class="detail-value" style="font-size:0.82rem;line-height:1.5;font-weight:500">
                      {{ selected.description }}
                    </div>
                  </div>
                </div>
              }

              @if (selected.createdAt) {
                <div class="detail-row">
                  <mat-icon class="detail-icon">calendar_today</mat-icon>
                  <div>
                    <div class="detail-label">Registered On</div>
                    <div class="detail-value">{{ selected.createdAt | date:'mediumDate' }}</div>
                  </div>
                </div>
              }

            </div>

            <!-- Action buttons -->
            <div class="modal-actions">
              @if (!selected.isVerified) {
                <button class="modal-action-btn modal-verify" (click)="verify(selected)">
                  <mat-icon>verified</mat-icon> Verify Organisation
                </button>
              }
              <button class="modal-action-btn"
                      [ngClass]="selected.isActive ? 'modal-deactivate' : 'modal-activate'"
                      (click)="toggle(selected)">
                <mat-icon>{{ selected.isActive ? 'person_off' : 'person' }}</mat-icon>
                {{ selected.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Header ── */
    .back-btn {
      width: 38px !important; height: 38px !important; border-radius: 10px !important;
      background: #fff !important; border: 1px solid #E0EBF2 !important; color: #4A6478 !important;
      flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }
    .ngo-count-badge {
      display: flex; align-items: center; gap: 6px;
      background: #EDE9FE; color: #5B21B6; border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* Info notice */
    .info-notice {
      display: flex; align-items: flex-start; gap: 10px;
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px;
      padding: 14px 18px; font-size: 0.83rem; color: #1E40AF; margin-bottom: 20px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
    }

    /* ── Filter panel ── */
    .filter-panel {
      background: #fff; border: 1px solid #E0EBF2; border-radius: 18px;
      padding: 18px 20px; margin-bottom: 20px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .filter-row {
      display: flex; align-items: center; gap: 12px; flex-wrap: nowrap;
      &.wrap { flex-wrap: wrap; }
    }
    .filter-group { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; }
    .filter-label {
      font-size: 0.7rem; font-weight: 700; color: #8BA3B5;
      text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; flex-shrink: 0;
    }

    /* Search */
    .search-box {
      flex: 1; min-width: 220px;
      display: flex; align-items: center; gap: 8px;
      background: #F8FAFC; border: 1.5px solid #E0EBF2; border-radius: 12px;
      padding: 0 12px; transition: border-color 0.15s;
      &:focus-within { border-color: #7C3AED; }
    }
    .search-icon { font-size: 18px; width: 18px; height: 18px; color: #8BA3B5; flex-shrink: 0; }
    .search-input {
      flex: 1; border: none; background: transparent; outline: none;
      font-size: 0.85rem; color: #1A3547; padding: 10px 0;
      font-family: 'Quicksand', system-ui, sans-serif;
      &::placeholder { color: #B0C4D4; }
    }
    .search-clear {
      border: none; background: transparent; cursor: pointer; padding: 0;
      display: flex; align-items: center;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #8BA3B5; }
      &:hover mat-icon { color: #EF4444; }
    }

    /* Sort / City select */
    .sort-wrap {
      display: flex; align-items: center; gap: 6px;
      background: #F8FAFC; border: 1.5px solid #E0EBF2; border-radius: 12px;
      padding: 0 12px; height: 40px; flex-shrink: 0;
    }
    .sort-icon { font-size: 16px; width: 16px; height: 16px; color: #8BA3B5; }
    .sort-select {
      border: none; background: transparent; outline: none;
      font-size: 0.82rem; font-weight: 600; color: #1A3547;
      font-family: 'Quicksand', system-ui, sans-serif; cursor: pointer;
    }

    /* Filter chips */
    .chip-group { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-chip {
      border: 1.5px solid #E0EBF2; background: #F8FAFC;
      border-radius: 999px; padding: 5px 14px;
      font-size: 0.76rem; font-weight: 700; color: #4A6478;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
      font-family: 'Quicksand', system-ui, sans-serif;
      &:hover { border-color: #7C3AED; color: #7C3AED; }
      &.active { border-color: transparent; color: #fff; }
      &.fc-all        { background: #1A3547; }
      &.fc-verified   { background: #059669; }
      &.fc-unverified { background: #D97706; }
    }
    .filter-chip.active:not([class*="fc-"]) { background: #7C3AED; border-color: transparent; }

    /* Clear all */
    .clear-all-btn {
      display: flex; align-items: center; gap: 5px;
      background: #FEF2F2; border: 1.5px solid #FECACA;
      border-radius: 12px; padding: 8px 14px;
      font-size: 0.78rem; font-weight: 700; color: #DC2626;
      cursor: pointer; white-space: nowrap;
      font-family: 'Quicksand', system-ui, sans-serif; transition: background 0.15s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: #FEE2E2; }
    }

    /* Result row */
    .result-row { display: flex; align-items: center; gap: 10px; padding-top: 2px; }
    .result-count { font-size: 0.78rem; color: #8BA3B5; font-weight: 600;
      &.zero { color: #EF4444; }
      strong { color: #1A3547; }
    }
    .active-filters-badge {
      background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 999px;
      padding: 2px 10px; font-size: 0.7rem; font-weight: 700; color: #5B21B6;
    }

    /* ── Table ── */
    .ngo-row { display: flex; align-items: center; gap: 10px; }
    .ngo-avatar-sm {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #B97AFB, #7C3AED);
      color: #fff; font-weight: 800; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .regno-badge {
      background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 8px;
      padding: 2px 8px; font-size: 0.72rem; font-weight: 700; color: #5B21B6;
      font-family: monospace;
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
    .clickable-row {
      cursor: pointer; transition: background 0.15s;
      &:hover { background: #F5F3FF !important; }
    }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; text-align: center;
    }
    .empty-icon {
      width: 64px; height: 64px; border-radius: 18px; background: #F8FAFC;
      display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
      mat-icon { font-size: 32px; width: 32px; height: 32px; color: #B0C4D4; }
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .modal-card {
      background: #fff; border-radius: 24px;
      width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,0.22);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(24px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .modal-header {
      position: relative; padding: 36px 20px 20px;
      display: flex; align-items: flex-end; justify-content: center;
      border-radius: 24px 24px 0 0;
      background: linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%);
    }
    .modal-avatar {
      width: 72px; height: 72px; border-radius: 20px;
      background: linear-gradient(135deg, #B97AFB, #7C3AED);
      color: #fff; font-weight: 900; font-size: 1.8rem;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 20px rgba(124,58,237,0.4);
    }
    .modal-id-badge {
      position: absolute; top: 12px; left: 16px;
      font-size: 0.7rem; font-weight: 700; color: rgba(0,0,0,0.4);
      background: rgba(255,255,255,0.6); border-radius: 999px; padding: 2px 10px;
    }
    .modal-close { position: absolute !important; top: 8px; right: 8px; color: rgba(0,0,0,0.35) !important; }
    .modal-identity {
      padding: 16px 20px 4px; display: flex; flex-direction: column;
      align-items: center; gap: 8px; text-align: center;
    }
    .modal-name { font-size: 1.15rem; font-weight: 900; color: #1A3547; }
    .modal-body { padding: 16px 22px 22px; display: flex; flex-direction: column; gap: 16px; }
    .detail-section { display: flex; flex-direction: column; gap: 12px; }
    .detail-row { display: flex; align-items: flex-start; gap: 12px; }
    .detail-icon { color: #7C3AED; font-size: 20px; width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0; }
    .detail-label { font-size: 0.68rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
    .detail-value { font-size: 0.9rem; font-weight: 600; color: #1A3547; word-break: break-word; }
    .detail-link  { font-size: 0.9rem; font-weight: 600; color: #1D4ED8; text-decoration: none;
      &:hover { text-decoration: underline; } }

    /* Modal action buttons */
    .modal-actions { display: flex; flex-direction: column; gap: 10px; }
    .modal-action-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 12px; border: none; border-radius: 14px;
      font-size: 0.88rem; font-weight: 800; cursor: pointer;
      font-family: 'Quicksand', system-ui, sans-serif;
      transition: opacity 0.15s, transform 0.15s;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover { opacity: 0.88; transform: translateY(-1px); }
    }
    .modal-verify     { background: #ECFDF5; color: #059669; border: 1.5px solid #A7F3D0; }
    .modal-deactivate { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; }
    .modal-activate   { background: #ECFDF5; color: #059669; border: 1.5px solid #A7F3D0; }
  `]
})
export class AdminNgosComponent implements OnInit {
  ngos:    any[] = [];
  cols     = ['ngo', 'contact', 'regno', 'status', 'verified', 'actions'];
  loading  = true;
  selected: any | null = null;

  filters = {
    search:   '',
    verified: 'ALL',
    status:   'ALL',
    sort:     'name_asc',
    city:     'ALL',
    regNo:    'ALL',
  };

  readonly verifyOptions = [
    { label: 'All',        value: 'ALL'        },
    { label: '✓ Verified', value: 'VERIFIED'   },
    { label: 'Pending',    value: 'UNVERIFIED' },
  ];

  readonly statusOptions = [
    { label: 'All',      value: 'ALL'      },
    { label: 'Active',   value: 'ACTIVE'   },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  readonly regOptions = [
    { label: 'All',            value: 'ALL'     },
    { label: 'Has Reg. No',    value: 'WITH'    },
    { label: 'No Reg. No',     value: 'WITHOUT' },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.loadNgos(); }

  loadNgos(): void {
    this.loading = true;
    this.api.get<any>('/admin/ngos').subscribe({
      next: res => {
        // Only show approved (active) NGOs — pending ones are in the Pending Approvals section.
        this.ngos = (res.data ?? []).filter((n: any) => n.isActive !== false);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get availableCities(): string[] {
    return [...new Set(this.ngos.map(n => n.city).filter((c: any) => !!c))].sort() as string[];
  }

  get activeFilterCount(): number {
    return [
      this.filters.search.trim() !== '',
      this.filters.verified !== 'ALL',
      this.filters.status   !== 'ALL',
      this.filters.city     !== 'ALL',
      this.filters.regNo    !== 'ALL',
    ].filter(Boolean).length;
  }

  get filteredNgos(): any[] {
    let result = [...this.ngos];

    // Search: name, city, email
    const q = this.filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(n =>
        n.name?.toLowerCase().includes(q) ||
        n.city?.toLowerCase().includes(q) ||
        n.email?.toLowerCase().includes(q)
      );
    }

    // Verification
    if (this.filters.verified === 'VERIFIED')   result = result.filter(n =>  n.isVerified);
    if (this.filters.verified === 'UNVERIFIED') result = result.filter(n => !n.isVerified);

    // Status
    if (this.filters.status === 'ACTIVE')   result = result.filter(n =>  n.isActive);
    if (this.filters.status === 'INACTIVE') result = result.filter(n => !n.isActive);

    // City
    if (this.filters.city !== 'ALL') {
      result = result.filter(n => n.city === this.filters.city);
    }

    // Registration No
    if (this.filters.regNo === 'WITH')    result = result.filter(n =>  !!n.registrationNo);
    if (this.filters.regNo === 'WITHOUT') result = result.filter(n => !n.registrationNo);

    // Sort
    result.sort((a, b) => {
      switch (this.filters.sort) {
        case 'name_asc':  return (a.name || '').localeCompare(b.name || '');
        case 'name_desc': return (b.name || '').localeCompare(a.name || '');
        case 'date_desc': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'date_asc':  return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        default: return 0;
      }
    });

    return result;
  }

  clearAll(): void {
    this.filters = { search: '', verified: 'ALL', status: 'ALL', sort: 'name_asc', city: 'ALL', regNo: 'ALL' };
  }

  locationOf(ngo: any): string {
    return [ngo.address, ngo.city].filter((v: any) => !!v).join(', ') || '—';
  }

  verify(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/verify`, { verified: true }).subscribe({
      next: () => {
        ngo.isVerified = true;
        if (this.selected?.id === ngo.id) this.selected = { ...this.selected, isVerified: true };
        this.snack.open('NGO verified! ✓', '', { duration: 2000 });
      }
    });
  }

  toggle(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/toggle`, { active: !ngo.isActive }).subscribe({
      next: () => {
        ngo.isActive = !ngo.isActive;
        if (this.selected?.id === ngo.id) this.selected = { ...this.selected, isActive: ngo.isActive };
        this.snack.open(`NGO ${ngo.isActive ? 'activated' : 'deactivated'}.`, '', { duration: 2000 });
      }
    });
  }
}
