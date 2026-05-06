import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>Admin Panel</h1>
          <p>Platform management and oversight</p>
        </div>
        <div class="admin-badge">
          <mat-icon>verified_user</mat-icon>
          <span>Administrator</span>
        </div>
      </div>

      <!-- Platform stats -->
      <div class="stats-grid" style="margin-bottom:32px">
        @for (s of stats; track s.label) {
          <mat-card class="stat-card {{ s.color }}">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>{{ s.icon }}</mat-icon></div>
              <p class="stat-value">{{ s.value }}</p>
              <p class="stat-label">{{ s.label }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Management sections -->
      <div class="section-header">
        <h2>Platform Management</h2>
      </div>

      <div class="admin-grid">
        @for (item of cards; track item.route) {
          <div class="admin-card" [routerLink]="item.route">
            <div class="admin-card-icon {{ item.color }}">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="admin-card-body">
              <div class="admin-card-title">{{ item.label }}</div>
              <div class="admin-card-desc">{{ item.desc }}</div>
            </div>
            <mat-icon class="admin-card-arrow">chevron_right</mat-icon>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .admin-badge {
      display: flex; align-items: center; gap: 6px;
      background: #FEE2E2; color: #991B1B;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 14px;
    }
    .admin-card {
      display: flex; align-items: center; gap: 16px;
      background: #fff; border: 1px solid #F0E0D6;
      border-radius: 18px; padding: 20px 22px;
      cursor: pointer; transition: all 0.2s ease;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(28,9,2,0.1);
        border-color: #FDBF8A;
      }
    }
    .admin-card-icon {
      width: 52px; height: 52px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 24px; width: 24px; height: 24px; color: #fff; }
      &.orange { background: linear-gradient(135deg,#FF9748,#F97316); }
      &.red    { background: linear-gradient(135deg,#F87171,#DC2626); }
      &.purple { background: linear-gradient(135deg,#B97AFB,#7C3AED); }
      &.green  { background: linear-gradient(135deg,#34D399,#059669); }
      &.blue   { background: linear-gradient(135deg,#60A5FA,#2563EB); }
    }
    .admin-card-body { flex: 1; }
    .admin-card-title { font-weight: 800; font-size: 0.92rem; color: #1C0902; margin-bottom: 3px; }
    .admin-card-desc  { font-size: 0.78rem; color: #A8A29E; }
    .admin-card-arrow { color: #E5D0C5 !important; font-size: 22px !important; }
  `]
})
export class AdminDashboardComponent implements OnInit {

  stats = [
    { icon: 'people',         value: '—', label: 'Total Users',     color: 'orange' },
    { icon: 'business',       value: '—', label: 'Registered NGOs', color: 'purple' },
    { icon: 'emergency',      value: '—', label: 'Active Rescues',  color: 'pink'   },
    { icon: 'local_hospital', value: '—', label: 'Hospitals',       color: 'green'  }
  ];

  cards = [
    { icon: 'people',         color: 'orange', label: 'User Management',     desc: 'View, activate or deactivate user accounts',  route: '/admin/users'     },
    { icon: 'business',       color: 'purple', label: 'NGO Management',      desc: 'Create and manage rescue organisations',       route: '/admin/ngos'      },
    { icon: 'emergency',      color: 'red',    label: 'Rescue Oversight',    desc: 'Monitor all platform rescue reports',          route: '/admin/rescues'   },
    { icon: 'local_hospital', color: 'green',  label: 'Hospital Management', desc: 'View and manage registered hospitals',         route: '/admin/hospitals' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // Load platform-wide counts
    this.api.get<any>('/admin/users').subscribe(res => {
      this.stats[0].value = (res.data?.length ?? '—').toString();
    });
    this.api.get<any>('/admin/ngos').subscribe(res => {
      this.stats[1].value = (res.data?.length ?? '—').toString();
    });
    this.api.get<any>('/admin/rescues').subscribe(res => {
      const active = (res.data ?? []).filter((r: any) =>
        r.status === 'PENDING' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
      ).length;
      this.stats[2].value = active.toString();
    });
    this.api.get<any>('/hospitals/public').subscribe(res => {
      this.stats[3].value = (res.data?.length ?? '—').toString();
    });
  }
}
