import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { RescueReport } from '../../../core/models/rescue.model';
import { rescueStatusLabel } from '../../../core/utils/rescue-status.util';

@Component({
  standalone: false,
  selector: 'app-rescue-list',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <button mat-icon-button routerLink="/dashboard"
                  style="background:#fff;border:1px solid #E0EBF2;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
          </button>
          <div>
            <h1>Rescue Reports</h1>
            <p>Animals you've reported that need help</p>
          </div>
        </div>
        <div class="page-header-actions">
          <button class="report-btn" routerLink="/rescue/report">
            <mat-icon>crisis_alert</mat-icon>
            <span>Report Animal</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading reports...</span>
        </div>
      }

      @if (!loading) {

        <!-- Empty state -->
        @if (rescues.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>emergency</mat-icon></div>
              <h3>No rescue reports</h3>
              <p>Spotted an animal in need? Report it and we'll dispatch help immediately.</p>
              <button mat-raised-button color="primary" routerLink="/rescue/report" style="margin-top:8px">
                <mat-icon>add_alert</mat-icon> Report Now
              </button>
            </div>
          </div>
        }

        @if (rescues.length > 0) {

          <!-- Search + secondary filter bar -->
          <div class="search-filter-bar">
            <div class="search-wrap">
              <mat-icon class="search-icon">search</mat-icon>
              <input class="search-input" [(ngModel)]="searchFilter.search"
                     placeholder="Search by animal type, description, address…">
            </div>
            <div class="select-group">
              <label class="select-label">Urgency</label>
              <select class="fsel" [(ngModel)]="searchFilter.criticality">
                <option value="">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div class="select-group">
              <label class="select-label">Sort</label>
              <select class="fsel" [(ngModel)]="searchFilter.sort">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            @if (hasSearchFilters) {
              <button class="clear-btn" (click)="clearSearchFilters()">
                <mat-icon>close</mat-icon> Clear
              </button>
            }
          </div>

          <!-- Status chips filter -->
          <div class="filter-bar">
            <button class="filter-btn" [class.active]="activeFilter === 'ALL'"
                    (click)="activeFilter = 'ALL'">
              All <span class="f-count">{{ rescues.length }}</span>
            </button>
            @for (s of statusFilters; track s.key) {
              @if (countOf(s.key) > 0) {
                <button class="filter-btn" [class.active]="activeFilter === s.key"
                        (click)="activeFilter = s.key">
                  {{ s.label }} <span class="f-count">{{ countOf(s.key) }}</span>
                </button>
              }
            }
          </div>

          <!-- Cards grid -->
          <div class="rescue-grid">
            @for (r of filtered(); track r.id) {
              <div class="rescue-card-item" [class.completed-card]="r.status === 'COMPLETED'"
                                            [class.cancelled-card]="r.status === 'CANCELLED'"
                                            (click)="selected = r" style="cursor:pointer">

                <!-- Top row: icon + status chips -->
                <div class="rescue-card-top">
                  <div class="rescue-animal-icon" [class.green-icon]="r.status === 'COMPLETED'"
                                                  [class.grey-icon]="r.status === 'CANCELLED'">
                    <mat-icon>{{ animalIcon(r.animalType) }}</mat-icon>
                  </div>
                  <div class="rescue-card-chips">
                    <span class="chip" [ngClass]="r.status.toLowerCase()">{{ statusLabel(r.status) }}</span>
                    <span class="crit-badge" [ngClass]="critClass(r.criticality)">{{ r.criticality }}</span>
                  </div>
                </div>

                <!-- Animal name + date -->
                <div class="rescue-card-content">
                  <div class="rescue-animal-name">{{ r.animalType || 'Unknown Animal' }}</div>
                  @if (r.reportedAt) {
                    <div class="report-date">
                      <mat-icon>schedule</mat-icon>
                      Reported {{ r.reportedAt | date:'MMM d, y' }}
                    </div>
                  }
                  <p class="rescue-desc">{{ r.description || 'No description provided.' }}</p>
                </div>

                <!-- ── Status timeline ── -->
                @if (r.status !== 'CANCELLED') {
                  <div class="timeline">
                    @for (step of steps; track step.key; let i = $index) {
                      <div class="tl-step" [class.tl-done]="stepIndex(r.status) >= i"
                                           [class.tl-active]="stepIndex(r.status) === i">
                        <div class="tl-dot">
                          @if (stepIndex(r.status) > i) {
                            <mat-icon>check</mat-icon>
                          }
                        </div>
                        <span class="tl-label">{{ step.label }}</span>
                      </div>
                      @if (i < steps.length - 1) {
                        <div class="tl-line" [class.tl-line-done]="stepIndex(r.status) > i"></div>
                      }
                    }
                  </div>
                }

                <!-- Status hint message -->
                <div class="status-hint" [ngClass]="'hint-' + r.status.toLowerCase()">
                  <mat-icon>{{ statusIcon(r.status) }}</mat-icon>
                  <span>{{ statusHint(r.status) }}</span>
                </div>

                <!-- Resolution notes (shown when COMPLETED) -->
                @if (r.resolutionNotes) {
                  <div class="resolution-notes">
                    <mat-icon>check_circle</mat-icon>
                    <span><strong>Resolution:</strong> {{ r.resolutionNotes }}</span>
                  </div>
                }

                <!-- Location -->
                @if (r.address) {
                  <div class="rescue-location">
                    <mat-icon>place</mat-icon>
                    <span>{{ r.address }}</span>
                  </div>
                }

                <!-- Reporter phone (visible to reporter) -->
                @if (r.reporterPhone) {
                  <div class="rescue-location" style="color:#4A6478">
                    <mat-icon>phone</mat-icon>
                    <span>{{ r.reporterPhone }}</span>
                  </div>
                }

              </div>
            }
            @if (filtered().length === 0) {
              <div style="grid-column:1/-1;text-align:center;padding:32px;color:#8BA3B5;font-size:0.88rem">
                No rescue reports match your filters.
              </div>
            }
          </div>
        }

      }

    </div>

    <!-- ── Detail Modal ── -->
    @if (selected) {
      <div class="modal-backdrop" (click)="selected = null">
        <div class="modal-card" (click)="$event.stopPropagation()">

          <div class="modal-header" [class.header-completed]="selected.status === 'COMPLETED'"
                                    [class.header-cancelled]="selected.status === 'CANCELLED'">
            <div>
              <div class="modal-title">{{ selected.animalType || 'Unknown Animal' }} — Report Details</div>
              <div class="modal-sub">
                <span class="chip" [ngClass]="selected.status.toLowerCase()">{{ statusLabel(selected.status) }}</span>
                <span class="crit-badge" [ngClass]="critClass(selected.criticality)" style="margin-left:6px">{{ selected.criticality }}</span>
              </div>
            </div>
            <button mat-icon-button (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="modal-body">

            <!-- Status timeline -->
            @if (selected.status !== 'CANCELLED') {
              <div class="modal-timeline">
                @for (step of steps; track step.key; let i = $index) {
                  <div class="tl-step" [class.tl-done]="stepIndex(selected.status) >= i"
                                       [class.tl-active]="stepIndex(selected.status) === i">
                    <div class="tl-dot">
                      @if (stepIndex(selected.status) > i) {
                        <mat-icon>check</mat-icon>
                      }
                    </div>
                    <span class="tl-label">{{ step.label }}</span>
                  </div>
                  @if (i < steps.length - 1) {
                    <div class="tl-line" [class.tl-line-done]="stepIndex(selected.status) > i"></div>
                  }
                }
              </div>
            }

            <!-- Reported on -->
            <div class="detail-row">
              <mat-icon class="detail-icon">schedule</mat-icon>
              <div>
                <div class="detail-label">Reported On</div>
                <div class="detail-value">{{ selected.reportedAt | date:'EEEE, d MMMM y, h:mm a' }}</div>
              </div>
            </div>

            <!-- Description -->
            <div class="detail-row">
              <mat-icon class="detail-icon">description</mat-icon>
              <div>
                <div class="detail-label">Description</div>
                <div class="detail-value" style="font-weight:500;line-height:1.5">{{ selected.description || 'No description provided.' }}</div>
              </div>
            </div>

            <!-- Location -->
            @if (selected.address) {
              <div class="detail-row">
                <mat-icon class="detail-icon">place</mat-icon>
                <div>
                  <div class="detail-label">Location</div>
                  <div class="detail-value" style="font-weight:500">{{ selected.address }}</div>
                </div>
              </div>
            }

            <!-- Reporter Phone -->
            @if (selected.reporterPhone) {
              <div class="detail-row">
                <mat-icon class="detail-icon">phone</mat-icon>
                <div>
                  <div class="detail-label">Your Contact Number</div>
                  <div class="detail-value">{{ selected.reporterPhone }}</div>
                </div>
              </div>
            }

            <!-- NGO Section -->
            @if (selected.ngoName) {
              <div class="ngo-section">
                <div class="ngo-section-title">
                  <mat-icon>groups</mat-icon> Assigned NGO
                </div>
                <div class="ngo-name">{{ selected.ngoName }}</div>
                @if (selected.ngoCity) {
                  <div class="ngo-meta">{{ selected.ngoAddress ? selected.ngoAddress + ', ' : '' }}{{ selected.ngoCity }}</div>
                }
                <div class="ngo-contacts">
                  @if (selected.ngoPhone) {
                    <a class="ngo-contact-chip" [href]="'tel:' + selected.ngoPhone">
                      <mat-icon>call</mat-icon> {{ selected.ngoPhone }}
                    </a>
                  }
                  @if (selected.ngoEmail) {
                    <a class="ngo-contact-chip" [href]="'mailto:' + selected.ngoEmail">
                      <mat-icon>email</mat-icon> {{ selected.ngoEmail }}
                    </a>
                  }
                </div>
              </div>
            } @else if (selected.status === 'PENDING') {
              <div class="ngo-pending-box">
                <mat-icon>hourglass_empty</mat-icon>
                <span>Awaiting NGO assignment. You'll be notified once one is assigned.</span>
              </div>
            } @else if (selected.status === 'ASSIGNED' || selected.status === 'IN_PROGRESS') {
              <div class="ngo-pending-box" style="background:#EFF6FF;border-color:#BFDBFE;color:#1E40AF">
                <mat-icon style="color:#3B82F6">groups</mat-icon>
                <span>An NGO is assigned. Contact details will appear after refreshing.</span>
              </div>
            }

            <!-- Resolution notes -->
            @if (selected.resolutionNotes) {
              <div class="resolution-notes">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <div class="detail-label">Resolution</div>
                  <span>{{ selected.resolutionNotes }}</span>
                </div>
              </div>
            }

          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .page-header-left { display: flex; align-items: center; }

    /* ── Red report button ── */
    .report-btn {
      display: flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
      color: #fff; border: none; border-radius: 14px;
      padding: 10px 20px; font-size: 0.88rem; font-weight: 800;
      cursor: pointer; letter-spacing: 0.01em;
      box-shadow: 0 4px 16px rgba(185,28,28,0.4);
      transition: transform 0.18s, box-shadow 0.18s;
      font-family: 'Quicksand', system-ui, sans-serif;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(185,28,28,0.5);
      }
      &:active { transform: translateY(0); }
    }

    /* ── Search + secondary filter bar ── */
    .search-filter-bar {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 8px rgba(26,53,71,0.06);
      padding: 14px 18px; display: flex; gap: 10px; align-items: flex-end;
      margin-bottom: 14px; flex-wrap: wrap;
    }
    .search-wrap {
      position: relative; flex: 1; min-width: 160px;
    }
    .search-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      font-size: 16px; width: 16px; height: 16px; color: #94A3B8;
    }
    .search-input {
      width: 100%; height: 36px; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 0 12px 0 34px; font-size: 0.82rem; background: #F8FAFB;
      color: #1A3547; outline: none; box-sizing: border-box;
      font-family: inherit;
      &::placeholder { color: #94A3B8; }
      &:focus { border-color: #FF8C42; }
    }
    .select-group { display: flex; flex-direction: column; gap: 3px; }
    .select-label { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
    .fsel {
      height: 36px; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 0 10px; font-size: 0.82rem; color: #1A3547;
      background: #F8FAFB; outline: none; cursor: pointer;
      font-family: inherit;
      &:focus { border-color: #FF8C42; }
    }
    .clear-btn {
      display: flex; align-items: center; gap: 4px;
      height: 36px; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 0 12px; background: #F8FAFB; color: #64748B;
      font-size: 0.78rem; font-weight: 600; cursor: pointer;
      font-family: inherit;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { border-color: #E05858; color: #E05858; }
    }

    /* ── Status chip filter bar ── */
    .filter-bar {
      display: flex; flex-wrap: wrap; gap: 8px;
      margin-bottom: 20px;
    }
    .filter-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 999px;
      border: 1px solid #C8DCE8; background: #fff;
      font-size: 0.8rem; font-weight: 600; color: #4A6478;
      cursor: pointer; transition: all 0.15s;
      &:hover { border-color: #FF8C42; color: #FF8C42; }
      &.active { background: #FF8C42; color: #fff; border-color: #FF8C42; }
    }
    .f-count {
      background: rgba(0,0,0,0.12); border-radius: 999px;
      padding: 0 6px; font-size: 0.72rem; font-weight: 700;
      .active & { background: rgba(255,255,255,0.25); }
    }

    /* ── Card grid ── */
    .rescue-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
    }
    .rescue-card-item {
      background: #fff;
      border-radius: 20px;
      border: 1px solid #E0EBF2;
      box-shadow: 0 4px 16px rgba(26,53,71,0.07);
      padding: 18px 20px 16px;
      transition: all 0.2s ease;
      display: flex; flex-direction: column; gap: 12px;
      &:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(26,53,71,0.12); }
    }
    .completed-card { border-color: #A7F3D0; background: #F0FDF4; }
    .cancelled-card { border-color: #E5E7EB; background: #F9FAFB; opacity: 0.8; }

    /* ── Card top ── */
    .rescue-card-top {
      display: flex; align-items: flex-start; justify-content: space-between;
    }
    .rescue-animal-icon {
      width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
      background: linear-gradient(135deg, #F87171, #DC2626);
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #fff; font-size: 22px; }
    }
    .green-icon { background: linear-gradient(135deg, #34D399, #059669) !important; }
    .grey-icon  { background: linear-gradient(135deg, #D1D5DB, #9CA3AF) !important; }

    .rescue-card-chips { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
    .crit-badge {
      display: inline-block; padding: 2px 8px; border-radius: 999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .crit-low      { background: #D1FAE5; color: #065F46; }
    .crit-medium   { background: #FEF3C7; color: #92400E; }
    .crit-high     { background: #FFE8D6; color: #9A3412; }
    .crit-critical { background: #FEE2E2; color: #991B1B; }

    /* ── Card content ── */
    .rescue-card-content { display: flex; flex-direction: column; gap: 4px; }
    .rescue-animal-name { font-weight: 800; font-size: 1rem; color: #1A3547; }
    .report-date {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.74rem; color: #8BA3B5;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .rescue-desc {
      font-size: 0.83rem; color: #4A6478; line-height: 1.5; margin: 0;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }

    /* ── Status timeline ── */
    .timeline {
      display: flex; align-items: center; gap: 0;
      padding: 4px 0;
    }
    .tl-step {
      display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;
    }
    .tl-dot {
      width: 20px; height: 20px; border-radius: 50%;
      border: 2px solid #C8DCE8; background: #fff;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      mat-icon { font-size: 12px; width: 12px; height: 12px; color: #fff; }
    }
    .tl-done .tl-dot  { background: #059669; border-color: #059669; }
    .tl-active .tl-dot { background: #FF8C42; border-color: #FF8C42; box-shadow: 0 0 0 3px rgba(255,140,66,0.2); }
    .tl-label {
      font-size: 0.62rem; font-weight: 600; color: #8BA3B5; text-align: center; white-space: nowrap;
      .tl-done &  { color: #059669; }
      .tl-active & { color: #FF8C42; font-weight: 700; }
    }
    .tl-line {
      flex: 1; height: 2px; background: #E0EBF2; margin-bottom: 18px; transition: all 0.2s;
    }
    .tl-line-done { background: #059669; }

    /* ── Status hint ── */
    .status-hint {
      display: flex; align-items: flex-start; gap: 8px;
      border-radius: 10px; padding: 10px 12px;
      font-size: 0.78rem; line-height: 1.4;
      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }
    }
    .hint-pending     { background: #FFF7ED; color: #9A3412; mat-icon { color: #FF8C42; } }
    .hint-assigned    { background: #EFF6FF; color: #1E40AF; mat-icon { color: #3B82F6; } }
    .hint-in_progress { background: #FDF4FF; color: #7E22CE; mat-icon { color: #9333EA; } }
    .hint-completed   { background: #F0FDF4; color: #15803D; mat-icon { color: #22C55E; } }
    .hint-cancelled   { background: #F9FAFB; color: #6B7280; mat-icon { color: #9CA3AF; } }

    /* ── Resolution notes ── */
    .resolution-notes {
      display: flex; align-items: flex-start; gap: 8px;
      background: #F0FDF4; border: 1px solid #A7F3D0; border-radius: 10px;
      padding: 10px 12px; font-size: 0.8rem; color: #15803D; line-height: 1.4;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #22C55E; flex-shrink: 0; margin-top: 1px; }
    }

    /* ── Location ── */
    .rescue-location {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.76rem; color: #8BA3B5;
      mat-icon { font-size: 14px; width: 14px; height: 14px; flex-shrink: 0; }
      span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .modal-card {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,0.2);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .modal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 22px 22px 16px; border-bottom: 1px solid #F0F4F8;
      background: linear-gradient(135deg, #FFF7ED 0%, #fff 100%);
      position: sticky; top: 0; z-index: 1;
    }
    .header-completed { background: linear-gradient(135deg, #F0FDF4 0%, #fff 100%) !important; }
    .header-cancelled { background: linear-gradient(135deg, #F9FAFB 0%, #fff 100%) !important; }
    .modal-title { font-size: 1.05rem; font-weight: 800; color: #1A3547; margin-bottom: 6px; }
    .modal-sub   { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }

    .modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; }

    .modal-timeline {
      display: flex; align-items: center;
      background: #F8FAFC; border-radius: 14px; padding: 14px 16px;
    }

    .detail-row { display: flex; align-items: flex-start; gap: 14px; }
    .detail-icon { color: #FF8C42; font-size: 20px; width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
    .detail-value { font-size: 0.9rem; font-weight: 600; color: #1A3547; }

    /* ── NGO section ── */
    .ngo-section {
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 14px;
      padding: 14px 16px; display: flex; flex-direction: column; gap: 6px;
    }
    .ngo-section-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.72rem; font-weight: 700; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.06em;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }
    .ngo-name { font-size: 1rem; font-weight: 800; color: #1A3547; }
    .ngo-meta { font-size: 0.78rem; color: #4A6478; }
    .ngo-contacts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .ngo-contact-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: #fff; border: 1px solid #BFDBFE; border-radius: 999px;
      padding: 5px 12px; font-size: 0.78rem; font-weight: 600; color: #1D4ED8;
      text-decoration: none; transition: all 0.15s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { background: #DBEAFE; }
    }

    .ngo-pending-box {
      display: flex; align-items: center; gap: 10px;
      background: #FFF3E8; border: 1px solid #C8DCE8; border-radius: 12px;
      padding: 12px 14px; font-size: 0.82rem; color: #9A3412;
      mat-icon { color: #FF8C42; font-size: 18px; flex-shrink: 0; }
    }

    .resolution-notes {
      display: flex; align-items: flex-start; gap: 10px;
      background: #F0FDF4; border: 1px solid #A7F3D0; border-radius: 12px;
      padding: 12px 14px; font-size: 0.82rem; color: #15803D; line-height: 1.5;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #22C55E; flex-shrink: 0; margin-top: 2px; }
    }
  `]
})
export class RescueListComponent implements OnInit {
  rescues: RescueReport[] = [];
  loading = true;
  activeFilter = 'ALL';
  selected: RescueReport | null = null;

  searchFilter = { search: '', criticality: '', sort: 'newest' };

  readonly steps = [
    { key: 'PENDING',     label: 'Reported'    },
    { key: 'ASSIGNED',    label: 'Reported to NGO' },
    { key: 'IN_PROGRESS', label: 'Assigned & In Progress' },
    { key: 'COMPLETED',   label: 'Completed'   }
  ];

  readonly statusFilters = [
    { key: 'PENDING',     label: 'Pending'               },
    { key: 'ASSIGNED',    label: 'Reported'              },
    { key: 'IN_PROGRESS', label: 'Assigned & In Progress'},
    { key: 'COMPLETED',   label: 'Completed'             },
    { key: 'CANCELLED',   label: 'Cancelled'             }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/my').subscribe({
      next: res => {
        this.rescues = (res.data ?? []).map((r: any) => ({
          ...r,
          reportedAt: r.reportedAt && !r.reportedAt.endsWith('Z') && !r.reportedAt.includes('+')
            ? r.reportedAt + 'Z' : r.reportedAt,
          updatedAt: r.updatedAt && !r.updatedAt.endsWith('Z') && !r.updatedAt.includes('+')
            ? r.updatedAt + 'Z' : r.updatedAt,
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get hasSearchFilters(): boolean {
    return !!(this.searchFilter.search || this.searchFilter.criticality || this.searchFilter.sort !== 'newest');
  }

  clearSearchFilters(): void {
    this.searchFilter = { search: '', criticality: '', sort: 'newest' };
  }

  filtered(): RescueReport[] {
    let r = this.activeFilter === 'ALL' ? this.rescues : this.rescues.filter(x => x.status === this.activeFilter);
    const q = this.searchFilter.search.toLowerCase().trim();
    if (q) r = r.filter(x =>
      (x.animalType || '').toLowerCase().includes(q) ||
      (x.description || '').toLowerCase().includes(q) ||
      (x.address || '').toLowerCase().includes(q)
    );
    if (this.searchFilter.criticality) r = r.filter(x => x.criticality === this.searchFilter.criticality);
    if (this.searchFilter.sort === 'newest') {
      r = [...r].sort((a, b) => new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime());
    } else {
      r = [...r].sort((a, b) => new Date(a.reportedAt || 0).getTime() - new Date(b.reportedAt || 0).getTime());
    }
    return r;
  }

  countOf(status: string): number {
    return this.rescues.filter(r => r.status === status).length;
  }

  stepIndex(status: string): number {
    const map: Record<string, number> = {
      PENDING: 0, ASSIGNED: 1, IN_PROGRESS: 2, COMPLETED: 3
    };
    return map[status] ?? 0;
  }

  statusLabel(status: string): string {
    return rescueStatusLabel(status);
  }

  statusHint(status: string): string {
    const map: Record<string, string> = {
      PENDING:     'Your report is queued — an NGO will be assigned shortly.',
      ASSIGNED:    'Waiting for NGO confirmation. An NGO has been notified and will respond shortly.',
      IN_PROGRESS: 'A rescue team is actively on the way — help is coming!',
      COMPLETED:   'This animal has been successfully rescued. Thank you!',
      CANCELLED:   'This report has been cancelled.'
    };
    return map[status] ?? '';
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      PENDING:     'hourglass_empty',
      ASSIGNED:    'group',
      IN_PROGRESS: 'directions_run',
      COMPLETED:   'check_circle',
      CANCELLED:   'cancel'
    };
    return map[status] ?? 'info_outline';
  }

  animalIcon(type?: string): string {
    const t = (type || '').toLowerCase();
    if (t === 'dog')  return 'pets';
    if (t === 'cat')  return 'pets';
    if (t === 'bird') return 'flutter_dash';
    return 'cruelty_free';
  }

  critClass(c: string): string {
    return 'crit-' + (c || '').toLowerCase();
  }
}
