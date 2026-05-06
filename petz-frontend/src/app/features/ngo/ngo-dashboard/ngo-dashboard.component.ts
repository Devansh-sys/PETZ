import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-ngo-dashboard',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>NGO Dashboard</h1>
          <p>Manage your rescue operations and adoption listings</p>
        </div>
      </div>

      <!-- NGO profile card -->
      @if (ngo) {
        <div class="ngo-profile-card">
          <div class="ngo-avatar">
            @if (ngo.logoUrl) {
              <img [src]="ngo.logoUrl" [alt]="ngo.name">
            } @else {
              <mat-icon>business</mat-icon>
            }
          </div>
          <div class="ngo-info">
            <div class="ngo-name">{{ ngo.name }}</div>
            <div class="ngo-meta">
              @if (ngo.city) { <span><mat-icon>place</mat-icon>{{ ngo.city }}</span> }
              @if (ngo.phone) { <span><mat-icon>phone</mat-icon>{{ ngo.phone }}</span> }
            </div>
          </div>
          <div class="ngo-verify">
            @if (ngo.isVerified) {
              <span class="chip confirmed"><mat-icon>verified</mat-icon> Verified</span>
            } @else {
              <span class="chip pending">Pending Verification</span>
            }
          </div>
        </div>
      }

      <!-- Stats -->
      <div class="stats-grid" style="margin-bottom:32px">
        @for (s of stats; track s.label) {
          <mat-card class="stat-card {{ s.color }}">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>{{ s.icon }}</mat-icon>
              </div>
              <p class="stat-value">{{ s.value }}</p>
              <p class="stat-label">{{ s.label }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Quick actions -->
      <div class="section-header">
        <h2>Quick Actions</h2>
      </div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/ngo/animals">
          <div class="action-icon orange"><mat-icon>pets</mat-icon></div>
          <div class="action-body">
            <p class="action-title">Manage Animals</p>
            <p class="action-desc">List and update adoptable animals</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/ngo/rescues">
          <div class="action-icon red"><mat-icon>emergency</mat-icon></div>
          <div class="action-body">
            <p class="action-title">Rescue Queue</p>
            <p class="action-desc">View and handle rescue reports</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/ngo/applications">
          <div class="action-icon purple"><mat-icon>assignment</mat-icon></div>
          <div class="action-body">
            <p class="action-title">Adoption Applications</p>
            <p class="action-desc">Review and approve applications</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .ngo-profile-card {
      display: flex;
      align-items: center;
      gap: 18px;
      background: #fff;
      border: 1px solid #F0E0D6;
      border-radius: 20px;
      padding: 20px 24px;
      box-shadow: 0 4px 16px rgba(28,9,2,0.07);
      margin-bottom: 28px;
    }
    .ngo-avatar {
      width: 60px; height: 60px;
      border-radius: 16px;
      background: linear-gradient(135deg, #FF9748, #F97316);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(249,115,22,0.3);
      img { width: 100%; height: 100%; object-fit: cover; }
      mat-icon { color: #fff; font-size: 28px; width: 28px; height: 28px; }
    }
    .ngo-info { flex: 1; }
    .ngo-name { font-weight: 900; font-size: 1.1rem; color: #1C0902; margin-bottom: 6px; }
    .ngo-meta {
      display: flex; gap: 16px; flex-wrap: wrap;
      span {
        display: flex; align-items: center; gap: 3px;
        font-size: 0.8rem; color: #78716C;
        mat-icon { font-size: 14px; width: 14px; height: 14px; color: #F97316; }
      }
    }
    .ngo-verify { flex-shrink: 0; }
    .chip mat-icon { font-size: 13px; width: 13px; height: 13px; vertical-align: middle; margin-right: 2px; }
  `]
})
export class NgoDashboardComponent implements OnInit {
  ngo: any = null;
  stats = [
    { icon: 'pets',       value: '—', label: 'Animals Listed',  color: 'orange' },
    { icon: 'emergency',  value: '—', label: 'Active Rescues',  color: 'pink'   },
    { icon: 'assignment', value: '—', label: 'Applications',    color: 'purple' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/ngo/profile').subscribe({
      next: res => { this.ngo = res.data; },
      error: ()  => {}
    });
    this.api.get<any>('/adoption/ngo/animals').subscribe({
      next: res => { this.stats[0].value = (res.data?.length ?? 0).toString(); },
      error: ()  => {}
    });
    this.api.get<any>('/rescue/ngo').subscribe({
      next: res => {
        const active = (res.data ?? []).filter((r: any) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length;
        this.stats[1].value = active.toString();
      },
      error: ()  => {}
    });
    this.api.get<any>('/adoption/ngo/applications').subscribe({
      next: res => { this.stats[2].value = (res.data?.length ?? 0).toString(); },
      error: ()  => {}
    });
  }
}
