import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-hospital-dashboard',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>Hospital Dashboard</h1>
          <p>Manage appointments, doctors and hospital operations</p>
        </div>
      </div>

      <!-- Hospital profile card -->
      @if (hospital) {
        <div class="hospital-card">
          <div class="hospital-logo">
            @if (hospital.logoUrl) {
              <img [src]="hospital.logoUrl" [alt]="hospital.name">
            } @else {
              <mat-icon>local_hospital</mat-icon>
            }
          </div>
          <div class="hospital-info">
            <div class="hospital-name">{{ hospital.name }}</div>
            <div class="hospital-meta">
              @if (hospital.address || hospital.city) {
                <span><mat-icon>place</mat-icon>{{ hospital.address }}{{ hospital.city ? ', ' + hospital.city : '' }}</span>
              }
              @if (hospital.phone) {
                <span><mat-icon>phone</mat-icon>{{ hospital.phone }}</span>
              }
            </div>
          </div>
          <span class="chip confirmed" style="flex-shrink:0"><mat-icon>verified</mat-icon> Registered</span>
        </div>
      }

      <!-- Stats -->
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

      <!-- Quick actions -->
      <div class="section-header"><h2>Quick Actions</h2></div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/hospital/appointments">
          <div class="action-icon purple"><mat-icon>event</mat-icon></div>
          <div class="action-body">
            <p class="action-title">Appointments</p>
            <p class="action-desc">View and manage today's appointments</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/hospital/doctors">
          <div class="action-icon green"><mat-icon>medical_services</mat-icon></div>
          <div class="action-body">
            <p class="action-title">Manage Doctors</p>
            <p class="action-desc">Add, edit or remove doctor profiles</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .hospital-card {
      display: flex;
      align-items: center;
      gap: 18px;
      background: #fff;
      border: 1px solid #E0EBF2;
      border-radius: 20px;
      padding: 20px 24px;
      box-shadow: 0 4px 16px rgba(26,53,71,0.07);
      margin-bottom: 28px;
    }
    .hospital-logo {
      width: 62px; height: 62px;
      border-radius: 16px;
      background: linear-gradient(135deg, #34D399, #059669);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(5,150,105,0.3);
      img { width: 100%; height: 100%; object-fit: cover; }
      mat-icon { color: #fff; font-size: 30px; width: 30px; height: 30px; }
    }
    .hospital-info { flex: 1; }
    .hospital-name { font-weight: 900; font-size: 1.1rem; color: #1A3547; margin-bottom: 6px; }
    .hospital-meta {
      display: flex; gap: 16px; flex-wrap: wrap;
      span { display: flex; align-items: center; gap: 3px; font-size: 0.8rem; color: #4A6478; }
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #059669; }
    }
    .chip mat-icon { font-size: 13px; width: 13px; height: 13px; vertical-align: middle; margin-right: 2px; }
  `]
})
export class HospitalDashboardComponent implements OnInit {
  hospital: any = null;
  stats = [
    { icon: 'event',            value: '—', label: "Today's Appointments", color: 'purple' },
    { icon: 'medical_services', value: '—', label: 'Registered Doctors',   color: 'green'  },
    { icon: 'pets',             value: '—', label: 'Total Appointments',   color: 'orange' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/hospitals/profile').subscribe({
      next: res => {
        this.hospital = res.data;
        const hid = res.data?.id;
        if (hid) {
          this.api.get<any>(`/hospitals/public/${hid}/doctors`).subscribe({
            next: dr => { this.stats[1].value = (dr.data?.length ?? 0).toString(); },
            error: () => {}
          });
        }
      },
      error: ()  => {}
    });
    this.api.get<any>('/appointments/hospital').subscribe({
      next: res => {
        const all = res.data ?? [];
        const today = new Date().toDateString();
        const todayCount = all.filter((a: any) => {
          try { return new Date(a.apptDate).toDateString() === today; } catch { return false; }
        }).length;
        this.stats[0].value = todayCount.toString();
        this.stats[2].value = all.length.toString();
      },
      error: () => {}
    });
  }
}
