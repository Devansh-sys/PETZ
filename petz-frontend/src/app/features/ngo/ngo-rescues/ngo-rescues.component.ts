import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-ngo-rescues',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/ngo" class="back-btn" title="Back to NGO Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Rescue Queue</h1>
            <p>Rescue assignments waiting for your response</p>
          </div>
        </div>
        <div class="rescue-count-badge">
          <mat-icon>emergency</mat-icon>
          <span>{{ rescues.length }} reports</span>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading rescue queue...</span>
        </div>
      }

      @if (!loading) {
        @if (rescues.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>emergency</mat-icon></div>
              <h3>No rescue assignments</h3>
              <p>Your queue is clear. New assignments will appear here.</p>
            </div>
          </div>
        }

        <div style="display:flex;flex-direction:column;gap:14px">
          @for (r of rescues; track r.id) {
            <div class="rescue-queue-card">
              <div class="rq-left">
                <div class="rq-icon" [class.critical-icon]="r.criticality === 'CRITICAL' || r.criticality === 'HIGH'">
                  <mat-icon>pets</mat-icon>
                </div>
                <div class="rq-info">
                  <div class="rq-title">{{ r.animalType || 'Unknown Animal' }}</div>
                  @if (r.address) {
                    <div class="rq-address">
                      <mat-icon>place</mat-icon> {{ r.address }}
                    </div>
                  }
                  @if (r.description) {
                    <div class="rq-desc">{{ r.description }}</div>
                  }
                </div>
              </div>
              <div class="rq-right">
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
                  <span class="chip" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
                  <span class="crit-pill crit-{{ r.criticality?.toLowerCase() }}">{{ r.criticality }}</span>
                </div>
                <div class="rq-actions">
                  @if (r.status === 'ASSIGNED') {
                    <button mat-raised-button color="primary" (click)="respond(r.id, 'ACCEPT')"
                            style="height:36px;font-size:0.82rem;border-radius:10px">
                      <mat-icon>check</mat-icon> Accept
                    </button>
                    <button mat-stroked-button (click)="respond(r.id, 'DECLINE')"
                            style="height:36px;font-size:0.82rem;border-radius:10px;color:#DC2626;border-color:#FECACA">
                      Decline
                    </button>
                  }
                  @if (r.status === 'IN_PROGRESS') {
                    <button mat-raised-button (click)="complete(r.id)"
                            style="height:36px;font-size:0.82rem;border-radius:10px;background:#059669;color:#fff">
                      <mat-icon>done_all</mat-icon> Complete
                    </button>
                  }
                </div>
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
      border: 1px solid #E0EBF2 !important; color: #4A6478 !important; flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }
    .rescue-count-badge {
      display: flex; align-items: center; gap: 6px;
      background: #FEE2E2; color: #991B1B;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .rescue-queue-card {
      display: flex; align-items: flex-start; gap: 16px;
      background: #fff; border: 1px solid #E0EBF2;
      border-radius: 18px; padding: 18px 20px;
      box-shadow: 0 4px 14px rgba(26,53,71,0.06);
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,53,71,0.1); }
    }
    .rq-left { display: flex; gap: 14px; flex: 1; min-width: 0; }
    .rq-icon {
      width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
      background: linear-gradient(135deg, #34D399, #059669);
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #fff; font-size: 22px; }
    }
    .rq-icon.critical-icon { background: linear-gradient(135deg, #F87171, #DC2626); }
    .rq-info { flex: 1; min-width: 0; }
    .rq-title { font-weight: 800; font-size: 0.95rem; color: #1A3547; margin-bottom: 4px; }
    .rq-address { display: flex; align-items: center; gap: 3px; font-size: 0.78rem; color: #4A6478; margin-bottom: 4px; mat-icon { font-size: 13px; width: 13px; height: 13px; color: #FF8C42; } }
    .rq-desc { font-size: 0.8rem; color: #8BA3B5; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .rq-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
    .rq-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .crit-pill {
      font-size: 0.68rem; font-weight: 700; padding: 2px 8px;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .crit-low { background: #D1FAE5; color: #065F46; }
    .crit-medium { background: #FEF3C7; color: #92400E; }
    .crit-high { background: #FFEDD5; color: #9A3412; }
    .crit-critical { background: #FEE2E2; color: #991B1B; }
  `]
})
export class NgoRescuesComponent implements OnInit {
  rescues: any[] = [];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/ngo').subscribe({
      next: res => { this.rescues = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  respond(id: number, response: string): void {
    this.api.post<any>(`/rescue/${id}/respond`, { response }).subscribe({
      next: res => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = res.data.status;
        this.snack.open(`Response recorded: ${response}`, '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 })
    });
  }

  complete(id: number): void {
    this.api.post<any>(`/rescue/${id}/complete`, { notes: 'Rescue completed.' }).subscribe({
      next: () => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = 'COMPLETED';
        this.snack.open('Rescue marked as complete! ✓', '', { duration: 2000 });
      }
    });
  }
}
