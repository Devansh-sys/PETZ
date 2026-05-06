import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-ngo-applications',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/ngo" class="back-btn" title="Back to NGO Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Adoption Applications</h1>
            <p>Review and process incoming adoption requests</p>
          </div>
        </div>
        <div class="app-count-badge">
          <mat-icon>assignment</mat-icon>
          <span>{{ pendingCount }} pending</span>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading applications...</span>
        </div>
      }

      @if (!loading) {
        @if (applications.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>assignment</mat-icon></div>
              <h3>No applications</h3>
              <p>Adoption applications will appear here once submitted.</p>
            </div>
          </div>
        }

        <div style="display:flex;flex-direction:column;gap:14px">
          @for (app of applications; track app.id) {
            <div class="app-card">
              <div class="app-card-left">
                <div class="app-num">#{{ app.id }}</div>
                <div class="app-info">
                  <div class="app-title">Application for Animal #{{ app.animalId }}</div>
                  <div class="app-meta">Applicant ID: {{ app.applicantId }}</div>
                  @if (app.reason) {
                    <div class="app-reason">"{{ app.reason }}"</div>
                  }
                </div>
              </div>
              <div class="app-card-right">
                <span class="chip" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
                @if (app.status === 'PENDING') {
                  <div class="app-actions">
                    <button mat-raised-button color="primary" (click)="review(app.id, 'APPROVED')"
                            style="height:36px;font-size:0.8rem;border-radius:10px">
                      <mat-icon>check_circle</mat-icon> Approve
                    </button>
                    <button mat-stroked-button (click)="review(app.id, 'REJECTED')"
                            style="height:36px;font-size:0.8rem;border-radius:10px;color:#DC2626;border-color:#FECACA">
                      <mat-icon>cancel</mat-icon> Reject
                    </button>
                  </div>
                }
              </div>
            </div>
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
    .app-count-badge {
      display: flex; align-items: center; gap: 6px;
      background: #EDE9FE; color: #5B21B6;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .app-card {
      display: flex; align-items: center; gap: 16px;
      background: #fff; border: 1px solid #F0E0D6;
      border-radius: 18px; padding: 18px 22px;
      box-shadow: 0 4px 14px rgba(28,9,2,0.06);
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(28,9,2,0.1); }
    }
    .app-card-left { display: flex; gap: 14px; flex: 1; min-width: 0; align-items: flex-start; }
    .app-num {
      min-width: 44px; height: 44px;
      border-radius: 12px;
      background: #EDE9FE;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 0.78rem; color: #7C3AED;
      flex-shrink: 0;
    }
    .app-info { flex: 1; min-width: 0; }
    .app-title { font-weight: 700; font-size: 0.9rem; color: #1C0902; margin-bottom: 3px; }
    .app-meta { font-size: 0.76rem; color: #A8A29E; margin-bottom: 4px; }
    .app-reason { font-size: 0.8rem; color: #78716C; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .app-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
    .app-actions { display: flex; gap: 8px; }
    .app-actions button mat-icon { font-size: 15px; width: 15px; height: 15px; margin-right: 4px; }
  `]
})
export class NgoApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = true;

  get pendingCount(): number {
    return this.applications.filter(a => a.status === 'PENDING').length;
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/ngo/applications').subscribe({
      next: res => { this.applications = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  review(id: number, status: string): void {
    this.api.patch<any>(`/adoption/ngo/applications/${id}/review`, { status }).subscribe({
      next: () => {
        const a = this.applications.find(x => x.id === id);
        if (a) a.status = status;
        this.snack.open(`Application ${status.toLowerCase()}. ✓`, '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error processing application.', 'Close', { duration: 3000 })
    });
  }
}
