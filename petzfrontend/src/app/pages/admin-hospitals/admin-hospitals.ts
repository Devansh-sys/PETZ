import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'petz-admin-hospitals',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './admin-hospitals.html',
  styleUrl: './admin-hospitals.scss'
})
export class AdminHospitals implements OnInit {
  hospitals: any[] = [];
  loading = true;
  error = '';
  filterVerified = '';
  busy: string | null = null;
  actionError = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<any>('/api/admin/hospitals/pending')
      .pipe(map(r => r.data ?? r)).subscribe({
        next: (data) => { this.hospitals = Array.isArray(data) ? data : []; this.loading = false; },
        error: () => { this.error = 'Could not load hospitals.'; this.loading = false; }
      });
  }

  verify(hospitalId: string): void {
    this.busy = hospitalId;
    this.http.post<any>(`/api/admin/hospitals/${hospitalId}/verify`, { action: 'APPROVE' })
      .pipe(map(r => r.data ?? r)).subscribe({
        next: () => { this.busy = null; this.load(); },
        error: () => { this.actionError = 'Verification failed.'; this.busy = null; }
      });
  }

  toggleActive(hospitalId: string, active: boolean): void {
    if (active) {
      this.busy = hospitalId;
      this.http.post<any>(`/api/admin/hospitals/${hospitalId}/disable`, { reason: 'Admin deactivation' })
        .subscribe({
          next: () => { this.busy = null; this.load(); },
          error: () => { this.actionError = 'Action failed.'; this.busy = null; }
        });
    }
  }
}
