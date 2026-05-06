import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { RescueReport } from '../../../core/models/rescue.model';

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
          <button mat-raised-button color="primary" routerLink="/rescue/report">
            <mat-icon>add_alert</mat-icon> Report Animal
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

          <!-- Summary chips + filter -->
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
                                            [class.cancelled-card]="r.status === 'CANCELLED'">

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

              </div>
            }
          </div>
        }

      }

    </div>
  `,
  styles: [`
    .page-header-left { display: flex; align-items: center; }

    /* ── Filter bar ── */
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
    .hint-pending     { background: #FFF3EC; color: #9A3412; mat-icon { color: #FF8C42; } }
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
  `]
})
export class RescueListComponent implements OnInit {
  rescues: RescueReport[] = [];
  loading = true;
  activeFilter = 'ALL';

  readonly steps = [
    { key: 'PENDING',     label: 'Reported'    },
    { key: 'ASSIGNED',    label: 'Assigned'    },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED',   label: 'Completed'   }
  ];

  readonly statusFilters = [
    { key: 'PENDING',     label: 'Pending'     },
    { key: 'ASSIGNED',    label: 'Assigned'    },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED',   label: 'Completed'   },
    { key: 'CANCELLED',   label: 'Cancelled'   }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/my').subscribe({
      next: res => { this.rescues = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  filtered(): RescueReport[] {
    if (this.activeFilter === 'ALL') return this.rescues;
    return this.rescues.filter(r => r.status === this.activeFilter);
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
    const map: Record<string, string> = {
      PENDING: 'Pending', ASSIGNED: 'Assigned',
      IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled'
    };
    return map[status] ?? status;
  }

  statusHint(status: string): string {
    const map: Record<string, string> = {
      PENDING:     'Your report is awaiting pickup by a rescue NGO.',
      ASSIGNED:    'An NGO has been assigned and will respond shortly.',
      IN_PROGRESS: 'The rescue team is actively working on this case.',
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
