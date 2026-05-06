import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  template: `
    <div class="page-container">

      <!-- ── Greeting ───────────────────────────── -->
      <div class="greeting-row">
        <div>
          <h1 class="greeting-text">{{ greeting }}, {{ firstName }}! 🐾</h1>
          <p class="page-subtitle">Here's today's overview of the platform.</p>
        </div>
        <div class="date-badge">
          <mat-icon style="font-size:16px;width:16px;height:16px;color:#F97316">calendar_today</mat-icon>
          <span>{{ today }}</span>
        </div>
      </div>

      <!-- ── Stat cards ─────────────────────────── -->
      <div class="stats-grid">

        <mat-card class="stat-card orange">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>pets</mat-icon></div>
            <p class="stat-value">{{ stats[0].value }}</p>
            <p class="stat-label">{{ stats[0].label }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card purple">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>event</mat-icon></div>
            <p class="stat-value">{{ stats[1].value }}</p>
            <p class="stat-label">{{ stats[1].label }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card pink">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>emergency</mat-icon></div>
            <p class="stat-value">{{ stats[2].value }}</p>
            <p class="stat-label">{{ stats[2].label }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card green">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>favorite</mat-icon></div>
            <p class="stat-value">{{ stats[3].value }}</p>
            <p class="stat-label">{{ stats[3].label }}</p>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- ── Quick actions ──────────────────────── -->
      <div class="section-header">
        <h2>Quick Actions</h2>
      </div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/rescue">
          <div class="action-icon red"><mat-icon>emergency</mat-icon></div>
          <div>
            <p class="action-title">Report Rescue</p>
            <p class="action-desc">Submit a new animal rescue report</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/adoption/animals">
          <div class="action-icon orange"><mat-icon>favorite</mat-icon></div>
          <div>
            <p class="action-title">Browse Adoptions</p>
            <p class="action-desc">Find animals looking for a home</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/appointments/book">
          <div class="action-icon purple"><mat-icon>event</mat-icon></div>
          <div>
            <p class="action-title">Book Appointment</p>
            <p class="action-desc">Schedule a vet visit for your pet</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/pets">
          <div class="action-icon green"><mat-icon>pets</mat-icon></div>
          <div>
            <p class="action-title">My Pets</p>
            <p class="action-desc">Manage your registered pets</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .greeting-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .greeting-text {
      font-size: 1.9rem;
      font-weight: 900;
      color: #F97316;
      margin: 0 0 4px;
    }
    .date-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #fff;
      border: 1px solid #F0E0D6;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #78716C;
      white-space: nowrap;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 36px;
    }
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      h2 { margin: 0; color: #1C0902; }
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    .action-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #fff;
      border: 1px solid #F0E0D6;
      border-radius: 16px;
      padding: 18px 20px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        border-color: #FDBF8A;
      }
    }
    .action-icon {
      width: 48px; height: 48px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; color: #fff; }
      &.red    { background: linear-gradient(135deg,#F87171,#DC2626); }
      &.orange { background: linear-gradient(135deg,#FF9748,#F97316); }
      &.purple { background: linear-gradient(135deg,#B97AFB,#7C3AED); }
      &.green  { background: linear-gradient(135deg,#34D399,#059669); }
    }
    .action-title {
      margin: 0 0 3px;
      font-weight: 700;
      font-size: 0.92rem;
      color: #1C0902;
    }
    .action-desc {
      margin: 0;
      font-size: 0.78rem;
      color: #A8A29E;
    }
    .action-arrow {
      margin-left: auto;
      color: #D6C4BB !important;
      font-size: 20px !important;
    }
  `]
})
export class DashboardComponent implements OnInit {
  firstName = '';
  greeting = '';
  today = '';

  stats = [
    { value: '—', label: 'My Pets' },
    { value: '—', label: 'Appointments' },
    { value: '—', label: 'Rescue Reports' },
    { value: '—', label: 'Adoptions' }
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.currentUser$.value;
    const fullName = user?.name ?? 'User';
    this.firstName = fullName.split(' ')[0];
    this.greeting = this.getGreeting();
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
