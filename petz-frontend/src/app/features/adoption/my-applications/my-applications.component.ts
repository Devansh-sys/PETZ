import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptionApplication } from '../../../core/models/adoption.model';

@Component({
  standalone: false,
  selector: 'app-my-applications',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center">
          <button mat-icon-button routerLink="/dashboard"
                  style="background:#fff;border:1px solid #E0EBF2;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
          </button>
          <div>
            <h1>My Applications</h1>
            <p>Track your adoption application statuses</p>
          </div>
        </div>
        <button mat-stroked-button routerLink="/adoption/animals"
                style="border-radius:10px;color:#4A6478;border-color:#C8DCE8;height:40px">
          <mat-icon>pets</mat-icon> Browse Animals
        </button>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading your applications...</span>
        </div>
      }

      @if (!loading) {

        <!-- Empty state -->
        @if (applications.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>assignment</mat-icon></div>
              <h3>No applications yet</h3>
              <p>Find your perfect companion and submit an adoption application.</p>
              <button mat-raised-button routerLink="/adoption/animals"
                      style="margin-top:12px;border-radius:12px;background:#FF8C42;color:#fff;height:42px">
                <mat-icon>pets</mat-icon> Browse Animals
              </button>
            </div>
          </div>
        }

        <!-- Application cards -->
        @if (applications.length > 0) {
          <div style="display:flex;flex-direction:column;gap:14px">
            @for (app of applications; track app.id) {
              <div class="app-card">

                <!-- Left: number + info -->
                <div class="app-left">
                  <div class="app-num-badge">#{{ app.id }}</div>
                  <div class="app-detail">
                    <div class="app-title">Adoption Application</div>
                    <div class="app-meta">
                      <span><mat-icon>pets</mat-icon>Animal #{{ app.animalId }}</span>
                      @if (app.appliedAt) {
                        <span><mat-icon>schedule</mat-icon>{{ app.appliedAt | date:'mediumDate' }}</span>
                      }
                    </div>
                    @if (app.adminNotes) {
                      <div class="app-note">
                        <mat-icon>comment</mat-icon>
                        <span>{{ app.adminNotes }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Right: status + timeline -->
                <div class="app-right">
                  <span class="chip" [ngClass]="statusClass(app.status)">
                    {{ app.status }}
                  </span>
                  <div class="status-hint" [ngClass]="'hint-' + statusClass(app.status)">
                    {{ statusHint(app.status) }}
                  </div>
                </div>

              </div>
            }
          </div>

          <!-- Summary chips -->
          <div class="summary-row">
            <div class="sum-pill">
              <span class="sum-num">{{ applications.length }}</span> Total
            </div>
            @if (pendingCount > 0) {
              <div class="sum-pill pending-pill">
                <span class="sum-num">{{ pendingCount }}</span> Pending
              </div>
            }
            @if (approvedCount > 0) {
              <div class="sum-pill approved-pill">
                <span class="sum-num">{{ approvedCount }}</span> Approved
              </div>
            }
          </div>
        }
      }

    </div>
  `,
  styles: [`
    .app-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: #fff;
      border: 1px solid #E0EBF2;
      border-radius: 18px;
      padding: 18px 22px;
      box-shadow: 0 4px 14px rgba(26,53,71,0.06);
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,53,71,0.1); }
    }
    .app-left { display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0; }
    .app-num-badge {
      min-width: 46px; height: 46px;
      border-radius: 14px;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 0.8rem; color: #fff;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(255,140,66,0.3);
    }
    .app-detail { flex: 1; min-width: 0; }
    .app-title { font-weight: 800; font-size: 0.92rem; color: #1A3547; margin-bottom: 5px; }
    .app-meta {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 6px;
      span { display: flex; align-items: center; gap: 3px; font-size: 0.76rem; color: #8BA3B5; }
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .app-note {
      display: flex; align-items: flex-start; gap: 5px;
      font-size: 0.78rem; color: #4A6478; font-style: italic;
      background: #F9FBFB; border-radius: 8px; padding: 6px 10px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #FF8C42; flex-shrink: 0; margin-top: 1px; }
      span { line-height: 1.5; }
    }
    .app-right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;
    }
    .status-hint {
      font-size: 0.68rem; font-weight: 600; text-align: right;
      max-width: 110px; line-height: 1.3;
    }
    .hint-pending    { color: #92400E; }
    .hint-approved   { color: #065F46; }
    .hint-rejected   { color: #991B1B; }
    .hint-completed  { color: #1E40AF; }

    /* Summary row */
    .summary-row {
      display: flex; gap: 10px; flex-wrap: wrap;
      margin-top: 20px;
    }
    .sum-pill {
      display: flex; align-items: center; gap: 6px;
      background: #F9FBFB; border: 1px solid #E0EBF2;
      border-radius: 999px; padding: 5px 14px;
      font-size: 0.76rem; font-weight: 600; color: #4A6478;
    }
    .sum-num { font-weight: 900; font-size: 0.9rem; color: #1A3547; }
    .pending-pill  { background: #FEF3C7; border-color: #FDE68A; color: #92400E; .sum-num { color: #92400E; } }
    .approved-pill { background: #D1FAE5; border-color: #A7F3D0; color: #065F46; .sum-num { color: #065F46; } }
  `]
})
export class MyApplicationsComponent implements OnInit {
  applications: AdoptionApplication[] = [];
  loading = true;

  get pendingCount(): number  { return this.applications.filter(a => a.status === 'PENDING').length; }
  get approvedCount(): number { return this.applications.filter(a => a.status === 'APPROVED').length; }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/my-applications').subscribe({
      next: res => { this.applications = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDING':   'pending',
      'APPROVED':  'approved',
      'REJECTED':  'cancelled',
      'COMPLETED': 'confirmed'
    };
    return map[status] ?? status?.toLowerCase() ?? '';
  }

  statusHint(status: string): string {
    const map: Record<string, string> = {
      'PENDING':   'Under review',
      'APPROVED':  'Congratulations!',
      'REJECTED':  'Not approved',
      'COMPLETED': 'Adoption done'
    };
    return map[status] ?? '';
  }
}
