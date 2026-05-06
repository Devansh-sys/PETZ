import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-hospital-dashboard',
  template: `
    <div class="page-container">
      <h1>Hospital Dashboard</h1>

      @if (hospital) {
        <div class="card" style="margin-bottom:24px">
          <div style="display:flex;gap:16px;align-items:center">
            @if (hospital.logoUrl) {
              <img [src]="hospital.logoUrl" style="width:80px;height:80px;border-radius:8px;object-fit:cover">
            }
            <div>
              <h2 style="margin:0">{{ hospital.name }}</h2>
              <p style="color:#64748B;margin:4px 0">{{ hospital.address }}, {{ hospital.city }}</p>
              <p style="color:#64748B;margin:0">{{ hospital.phone }}</p>
            </div>
          </div>
        </div>
      }

      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button mat-raised-button color="primary" routerLink="/hospital/appointments">
          <mat-icon>event</mat-icon> Appointments
        </button>
        <button mat-raised-button routerLink="/hospital/doctors">
          <mat-icon>medical_services</mat-icon> Manage Doctors
        </button>
      </div>
    </div>
  `
})
export class HospitalDashboardComponent implements OnInit {
  hospital: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/hospitals/profile').subscribe({
      next: res => { this.hospital = res.data; },
      error: ()  => {}
    });
  }
}
