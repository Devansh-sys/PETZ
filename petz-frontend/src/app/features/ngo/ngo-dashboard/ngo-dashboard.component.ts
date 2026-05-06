import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-ngo-dashboard',
  template: `
    <div class="page-container">
      <h1>NGO Dashboard</h1>

      @if (ngo) {
        <div class="card" style="margin-bottom:20px">
          <div style="display:flex;gap:16px;align-items:center">
            @if (ngo.logoUrl) {
              <img [src]="ngo.logoUrl" style="width:80px;height:80px;border-radius:50%;object-fit:cover">
            }
            <div>
              <h2 style="margin:0">{{ ngo.name }}</h2>
              <p style="color:#64748B;margin:4px 0">{{ ngo.city }} • {{ ngo.phone }}</p>
              @if (ngo.isVerified) {
                <span class="chip confirmed">Verified</span>
              } @else {
                <span class="chip pending">Pending Verification</span>
              }
            </div>
          </div>
        </div>
      }

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:24px">
        @for (s of stats; track s.label) {
          <mat-card>
            <mat-card-content style="text-align:center;padding:20px">
              <mat-icon style="font-size:36px;width:36px;height:36px;color:#0F766E">{{ s.icon }}</mat-icon>
              <h2 style="margin:8px 0 4px;color:#0F766E;font-size:1.8rem">{{ s.value }}</h2>
              <p style="color:#64748B;margin:0">{{ s.label }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <div style="display:flex;gap:12px">
        <button mat-raised-button color="primary" routerLink="/ngo/animals">
          <mat-icon>pets</mat-icon> Manage Animals
        </button>
        <button mat-raised-button routerLink="/ngo/rescues">
          <mat-icon>emergency</mat-icon> Rescue Queue
        </button>
        <button mat-raised-button routerLink="/ngo/applications">
          <mat-icon>assignment</mat-icon> Applications
        </button>
      </div>
    </div>
  `
})
export class NgoDashboardComponent implements OnInit {
  ngo: any = null;
  stats = [
    { icon: 'pets',       value: '—', label: 'Animals Listed' },
    { icon: 'emergency',  value: '—', label: 'Active Rescues' },
    { icon: 'assignment', value: '—', label: 'Applications' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/ngo/profile').subscribe({
      next: res => { this.ngo = res.data; },
      error: ()  => {}
    });
  }
}
