import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  template: `
    <div class="page-container">
      <h1>Admin Panel</h1>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
        @for (item of cards; track item.route) {
          <mat-card [routerLink]="item.route" style="cursor:pointer">
            <mat-card-content style="text-align:center;padding:24px">
              <mat-icon style="font-size:40px;width:40px;height:40px;color:#0F766E">{{ item.icon }}</mat-icon>
              <h3 style="margin:12px 0 4px">{{ item.label }}</h3>
              <p style="color:#64748B;margin:0;font-size:0.85rem">{{ item.desc }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  cards = [
    { icon: 'people',         label: 'Users',     desc: 'Manage all users',       route: '/admin/users'     },
    { icon: 'business',       label: 'NGOs',      desc: 'Verify and manage NGOs', route: '/admin/ngos'      },
    { icon: 'emergency',      label: 'Rescues',   desc: 'Monitor rescue reports', route: '/admin/rescues'   },
    { icon: 'local_hospital', label: 'Hospitals', desc: 'Manage hospitals',       route: '/admin/hospitals' }
  ];
}
