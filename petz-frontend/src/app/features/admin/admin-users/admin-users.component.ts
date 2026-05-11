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
        <div class="header-right">
          <div class="user-count-badge">
            <mat-icon>people</mat-icon>
            <span>{{ users.length }} users</span>
          </div>
        </div>
      </div>

      <!-- ── Pending Approvals Banner ── -->
      @if (pendingApprovals.length > 0) {
        <div class="pending-section">
          <div class="pending-section-header">
            <div class="pending-title">
              <span class="pending-dot"></span>
              <mat-icon>pending_actions</mat-icon>
              <span>Pending Approvals</span>
              <span class="pending-count-badge">{{ pendingApprovals.length }}</span>
            </div>
            <p class="pending-subtitle">These NGO / Hospital accounts are waiting for your approval before they can log in.</p>
          </div>
          <div class="pending-list">
            @for (u of pendingApprovals; track u.id) {
              <div class="pending-card">
                <div class="pending-avatar" [ngClass]="'pa-' + u.role?.toLowerCase()">
                  {{ u.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="pending-info">
                  <div class="pending-name">{{ u.name }}</div>
                  <div class="pending-email">{{ u.email }}</div>
                  <span class="role-badge role-{{ u.role?.toLowerCase() }}">{{ u.role }}</span>
                </div>
                <div class="pending-meta">
                  <span class="pending-date">{{ u.createdAt ? 'Registered ' + (u.createdAt | date:'mediumDate') : 'Just registered' }}</span>
                </div>
                <div class="pending-actions">
                  <button class="approve-btn" (click)="approve(u)" title="Approve">
                    <mat-icon>check_circle</mat-icon> Approve
                  </button>
                  <button class="reject-btn" (click)="reject(u)" title="Reject">
                    <mat-icon>cancel</mat-icon> Reject
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ── Filter Panel ── -->
      <div class="filter-panel">

        <!-- Row 1: Search + Sort + Clear -->
        <div class="filter-row">
          <div class="search-box">
            <mat-icon class="search-icon">search</mat-icon>
            <input class="search-input" placeholder="Search by name or email…"
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

        <!-- Row 2: Role chips -->
        <div class="filter-row">
          <span class="filter-label">Role</span>
          <div class="chip-group">
            @for (r of roleOptions; track r.value) {
              <button class="filter-chip"
                      [class.active]="filters.role === r.value"
                      [ngClass]="filters.role === r.value ? 'fc-' + r.value.toLowerCase() : ''"
                      (click)="filters.role = r.value">
                {{ r.label }}
              </button>
            }
          </div>
        </div>

        <!-- Row 3: Status + City + Phone -->
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
            <span class="filter-label">Phone</span>
            <div class="chip-group">
              @for (p of phoneOptions; track p.value) {
                <button class="filter-chip"
                        [class.active]="filters.phone === p.value"
                        (click)="filters.phone = p.value">
                  {{ p.label }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Result count -->
        <div class="result-row">
          <span class="result-count"
                [class.zero]="filteredUsers.length === 0">
            @if (filteredUsers.length === users.length) {
              Showing all {{ users.length }} users
            } @else {
              Showing <strong>{{ filteredUsers.length }}</strong> of {{ users.length }} users
            }
          </span>
          @if (activeFilterCount > 0) {
            <span class="active-filters-badge">{{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active</span>
          }
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

          <!-- No results -->
          @if (filteredUsers.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>manage_search</mat-icon></div>
              <h3>No users match your filters</h3>
              <p style="color:#8BA3B5;font-size:0.82rem;margin:4px 0 12px">
                Try adjusting or clearing the active filters
              </p>
              <button class="clear-all-btn" (click)="clearAll()">
                <mat-icon>filter_alt_off</mat-icon> Clear All Filters
              </button>
            </div>
          }

          @if (filteredUsers.length > 0) {
            <table mat-table [dataSource]="filteredUsers" style="width:100%">
              <ng-container matColumnDef="avatar">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let u" style="width:48px;padding:12px 8px 12px 18px">
                  <div class="user-avatar-sm">{{ u.name?.charAt(0)?.toUpperCase() || '?' }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let u">
                  <div style="font-weight:700;font-size:0.88rem;color:#1A3547">{{ u.name }}</div>
                  <div style="font-size:0.75rem;color:#8BA3B5">{{ u.email }}</div>
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
              <ng-container matColumnDef="city">
                <th mat-header-cell *matHeaderCellDef>City</th>
                <td mat-cell *matCellDef="let u">
                  <span style="font-size:0.8rem;color:#4A6478">{{ u.city || '—' }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="joined">
                <th mat-header-cell *matHeaderCellDef>Joined</th>
                <td mat-cell *matCellDef="let u">
                  <span style="font-size:0.78rem;color:#8BA3B5">{{ u.createdAt ? (u.createdAt | date:'mediumDate') : '—' }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let u" style="text-align:right;padding-right:18px">
                  <button mat-stroked-button
                          (click)="$event.stopPropagation(); toggle(u)"
                          [ngClass]="u.isActive ? 'deactivate-btn' : 'activate-btn'">
                    {{ u.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
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

    <!-- ── User Detail Modal ── -->
    @if (selected) {
      <div class="modal-backdrop" (click)="selected = null">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header" [ngClass]="'mh-' + selected.role?.toLowerCase()">
            <div class="modal-avatar">{{ selected.name?.charAt(0)?.toUpperCase() || '?' }}</div>
            <div class="modal-id-badge">#{{ selected.id }}</div>
            <button mat-icon-button class="modal-close" (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="modal-identity">
            <div class="modal-name">{{ selected.name }}</div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center">
              <span class="role-badge role-{{ selected.role?.toLowerCase() }}">{{ selected.role }}</span>
              <span class="chip" [ngClass]="selected.isActive ? 'confirmed' : 'cancelled'">
                {{ selected.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <div class="detail-row">
                <mat-icon class="detail-icon">email</mat-icon>
                <div>
                  <div class="detail-label">Email Address</div>
                  <div class="detail-value">{{ selected.email }}</div>
                </div>
              </div>
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
              @if (selected.createdAt) {
                <div class="detail-row">
                  <mat-icon class="detail-icon">calendar_today</mat-icon>
                  <div>
                    <div class="detail-label">Joined</div>
                    <div class="detail-value">{{ selected.createdAt | date:'mediumDate' }}</div>
                  </div>
                </div>
              }
            </div>
            <button class="modal-action-btn"
                    [ngClass]="selected.isActive ? 'modal-deactivate' : 'modal-activate'"
                    (click)="toggle(selected)">
              <mat-icon>{{ selected.isActive ? 'person_off' : 'person' }}</mat-icon>
              {{ selected.isActive ? 'Deactivate Account' : 'Activate Account' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Pending Approvals ── */
    .pending-section {
      background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
      border: 1.5px solid #FCD34D;
      border-radius: 18px; padding: 20px 22px; margin-bottom: 20px;
    }
    .pending-section-header { margin-bottom: 16px; }
    .pending-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 1rem; font-weight: 800; color: #92400E; margin-bottom: 6px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: #D97706; }
    }
    .pending-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #EF4444;
      animation: pulse 1.4s infinite;
      flex-shrink: 0;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }
    .pending-count-badge {
      background: #D97706; color: #fff; border-radius: 999px;
      padding: 1px 9px; font-size: 0.72rem; font-weight: 800;
    }
    .pending-subtitle { font-size: 0.78rem; color: #92400E; opacity: 0.75; margin: 0; }
    .pending-list { display: flex; flex-direction: column; gap: 10px; }
    .pending-card {
      display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
      background: #fff; border: 1px solid #FCD34D;
      border-radius: 14px; padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(217,119,6,0.08);
    }
    .pending-avatar {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      color: #fff; font-weight: 800; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
      &.pa-ngo      { background: linear-gradient(135deg,#7C3AED,#5B21B6); }
      &.pa-hospital { background: linear-gradient(135deg,#059669,#047857); }
    }
    .pending-info { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 4px; }
    .pending-name  { font-weight: 700; font-size: 0.9rem; color: #1A3547; }
    .pending-email { font-size: 0.75rem; color: #8BA3B5; }
    .pending-meta { flex-shrink: 0; }
    .pending-date  { font-size: 0.72rem; color: #92400E; font-weight: 600; }
    .pending-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .approve-btn {
      display: flex; align-items: center; gap: 5px;
      background: #ECFDF5; border: 1.5px solid #6EE7B7;
      border-radius: 10px; padding: 7px 14px;
      font-size: 0.78rem; font-weight: 700; color: #059669;
      cursor: pointer; font-family: 'Quicksand', system-ui, sans-serif;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: #D1FAE5; }
    }
    .reject-btn {
      display: flex; align-items: center; gap: 5px;
      background: #FEF2F2; border: 1.5px solid #FECACA;
      border-radius: 10px; padding: 7px 14px;
      font-size: 0.78rem; font-weight: 700; color: #DC2626;
      cursor: pointer; font-family: 'Quicksand', system-ui, sans-serif;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: #FEE2E2; }
    }

    /* ── Header ── */
    .header-right { display: flex; align-items: center; gap: 12px; }
    .back-btn {
      width: 38px !important; height: 38px !important; border-radius: 10px !important;
      background: #fff !important; border: 1px solid #E0EBF2 !important; color: #4A6478 !important;
      flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }
    .user-count-badge {
      display: flex; align-items: center; gap: 6px;
      background: #FFEDD5; color: #9A3412; border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
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
      &:focus-within { border-color: #FF8C42; }
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
      font-family: 'Quicksand', system-ui, sans-serif;
      cursor: pointer; padding-right: 4px;
    }

    /* Filter chips */
    .chip-group { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-chip {
      border: 1.5px solid #E0EBF2; background: #F8FAFC;
      border-radius: 999px; padding: 5px 14px;
      font-size: 0.76rem; font-weight: 700; color: #4A6478;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
      font-family: 'Quicksand', system-ui, sans-serif;
      &:hover { border-color: #FF8C42; color: #FF8C42; }
      &.active { border-color: transparent; color: #fff; }
      &.fc-all      { background: #1A3547; }
      &.fc-user     { background: #1E40AF; }
      &.fc-ngo      { background: #5B21B6; }
      &.fc-hospital { background: #065F46; }
      &.fc-admin    { background: #991B1B; }
    }
    /* Default active (status, phone) */
    .filter-chip.active:not([class*="fc-"]) { background: #FF8C42; border-color: transparent; }

    /* Clear all */
    .clear-all-btn {
      display: flex; align-items: center; gap: 5px;
      background: #FEF2F2; border: 1.5px solid #FECACA;
      border-radius: 12px; padding: 8px 14px;
      font-size: 0.78rem; font-weight: 700; color: #DC2626;
      cursor: pointer; white-space: nowrap;
      font-family: 'Quicksand', system-ui, sans-serif;
      transition: background 0.15s;
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
      background: #FFF7ED; border: 1px solid #FED7AA;
      border-radius: 999px; padding: 2px 10px;
      font-size: 0.7rem; font-weight: 700; color: #C2410C;
    }

    /* ── Table ── */
    .user-avatar-sm {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      color: #fff; font-weight: 800; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center;
    }
    .role-badge {
      display: inline-block; padding: 2px 10px; border-radius: 999px;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .role-user     { background: #DBEAFE; color: #1E40AF; }
    .role-ngo      { background: #EDE9FE; color: #5B21B6; }
    .role-hospital { background: #D1FAE5; color: #065F46; }
    .role-admin    { background: #FEE2E2; color: #991B1B; }
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
      &:hover { background: #FFF7ED !important; }
    }

    /* ── Empty state ── */
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
      width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto;
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
      &.mh-user     { background: linear-gradient(135deg,#BFDBFE,#93C5FD); }
      &.mh-ngo      { background: linear-gradient(135deg,#DDD6FE,#C4B5FD); }
      &.mh-hospital { background: linear-gradient(135deg,#A7F3D0,#6EE7B7); }
      &.mh-admin    { background: linear-gradient(135deg,#FECACA,#FCA5A5); }
    }
    .modal-avatar {
      width: 72px; height: 72px; border-radius: 20px;
      background: linear-gradient(135deg,#FF9F5A,#FF8C42);
      color: #fff; font-weight: 900; font-size: 1.8rem;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 20px rgba(255,140,66,0.4);
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
    .modal-name { font-size: 1.2rem; font-weight: 900; color: #1A3547; }
    .modal-body { padding: 16px 22px 22px; display: flex; flex-direction: column; gap: 16px; }
    .detail-section { display: flex; flex-direction: column; gap: 12px; }
    .detail-row { display: flex; align-items: flex-start; gap: 12px; }
    .detail-icon { color: #FF8C42; font-size: 20px; width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0; }
    .detail-label { font-size: 0.68rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
    .detail-value { font-size: 0.9rem; font-weight: 600; color: #1A3547; word-break: break-all; }
    .detail-link  { font-size: 0.9rem; font-weight: 600; color: #1D4ED8; text-decoration: none;
      &:hover { text-decoration: underline; } }
    .modal-action-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 12px; border: none; border-radius: 14px;
      font-size: 0.88rem; font-weight: 800; cursor: pointer;
      font-family: 'Quicksand', system-ui, sans-serif;
      transition: opacity 0.15s, transform 0.15s;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover { opacity: 0.88; transform: translateY(-1px); }
    }
    .modal-deactivate { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; }
    .modal-activate   { background: #ECFDF5; color: #059669; border: 1.5px solid #A7F3D0; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  pendingApprovals: any[] = [];
  cols = ['avatar', 'name', 'role', 'status', 'city', 'joined', 'actions'];
  loading  = true;
  selected: any | null = null;

  filters = {
    search: '',
    role:   'ALL',
    status: 'ALL',
    sort:   'name_asc',
    city:   'ALL',
    phone:  'ALL',
  };

  readonly roleOptions = [
    { label: 'All',      value: 'ALL'      },
    { label: 'User',     value: 'USER'     },
    { label: 'NGO',      value: 'NGO'      },
    { label: 'Hospital', value: 'HOSPITAL' },
    { label: 'Admin',    value: 'ADMIN'    },
  ];

  readonly statusOptions = [
    { label: 'All',      value: 'ALL'      },
    { label: 'Active',   value: 'ACTIVE'   },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  readonly phoneOptions = [
    { label: 'All',          value: 'ALL'     },
    { label: 'Has Phone',    value: 'WITH'    },
    { label: 'No Phone',     value: 'WITHOUT' },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/users').subscribe({
      next: res => {
        // Exclude NGO/HOSPITAL accounts that are still pending approval —
        // they belong in the Pending Approvals section, not the main users list.
        this.users = (res.data ?? []).filter((u: any) =>
          !((u.role === 'NGO' || u.role === 'HOSPITAL') && u.isApproved === false)
        );
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.loadPendingApprovals();
  }

  loadPendingApprovals(): void {
    this.api.get<any>('/admin/pending-approvals').subscribe({
      next: res => { this.pendingApprovals = res.data ?? []; }
    });
  }

  get availableCities(): string[] {
    return [...new Set(this.users.map(u => u.city).filter((c: any) => !!c))].sort() as string[];
  }

  get activeFilterCount(): number {
    return [
      this.filters.search.trim() !== '',
      this.filters.role   !== 'ALL',
      this.filters.status !== 'ALL',
      this.filters.city   !== 'ALL',
      this.filters.phone  !== 'ALL',
    ].filter(Boolean).length;
  }

  get filteredUsers(): any[] {
    let result = [...this.users];

    // Search: name or email (case-insensitive)
    const q = this.filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    // Role
    if (this.filters.role !== 'ALL') {
      result = result.filter(u => u.role === this.filters.role);
    }

    // Status
    if (this.filters.status === 'ACTIVE')   result = result.filter(u =>  u.isActive);
    if (this.filters.status === 'INACTIVE') result = result.filter(u => !u.isActive);

    // City
    if (this.filters.city !== 'ALL') {
      result = result.filter(u => u.city === this.filters.city);
    }

    // Phone
    if (this.filters.phone === 'WITH')    result = result.filter(u =>  !!u.phone);
    if (this.filters.phone === 'WITHOUT') result = result.filter(u => !u.phone);

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
    this.filters = { search: '', role: 'ALL', status: 'ALL', sort: 'name_asc', city: 'ALL', phone: 'ALL' };
  }

  locationOf(user: any): string {
    return [user.address, user.city].filter((v: any) => !!v).join(', ') || '—';
  }

  toggle(user: any): void {
    this.api.patch<any>(`/admin/users/${user.id}/toggle`, { active: !user.isActive }).subscribe({
      next: res => {
        user.isActive = res.data.isActive;
        if (this.selected?.id === user.id) this.selected = { ...this.selected, isActive: user.isActive };
        this.snack.open(`User ${user.isActive ? 'activated' : 'deactivated'}.`, '', { duration: 2500 });
      }
    });
  }

  approve(user: any): void {
    this.api.patch<any>(`/admin/users/${user.id}/approve`, { approved: true }).subscribe({
      next: res => {
        this.pendingApprovals = this.pendingApprovals.filter(u => u.id !== user.id);
        // Also update the user in the main list if already loaded
        const existing = this.users.find(u => u.id === user.id);
        if (existing) { existing.isApproved = true; }
        else { this.users.push({ ...res.data }); }
        this.snack.open(`${user.name} has been approved. They can now log in.`, 'OK', { duration: 4000 });
      }
    });
  }

  reject(user: any): void {
    this.api.patch<any>(`/admin/users/${user.id}/toggle`, { active: false }).subscribe({
      next: () => {
        this.pendingApprovals = this.pendingApprovals.filter(u => u.id !== user.id);
        this.snack.open(`${user.name}'s registration has been rejected.`, '', { duration: 3000 });
      }
    });
  }
}
