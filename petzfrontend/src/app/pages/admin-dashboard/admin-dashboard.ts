import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-admin-dashboard',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private base = environment.apiBaseUrl;

  stats = { totalRescues: 0, activeRescues: 0, pendingHospitals: 0, totalNgos: 0 };
  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    forkJoin({
      kpis: this.http.get<any>(`${this.base}/admin/kpis`)
        .pipe(map(r => r.data ?? r), catchError(() => of(null))),
      pending: this.http.get<any>(`${this.base}/admin/hospitals/pending`)
        .pipe(map(r => r.data ?? r), catchError(() => of([])))
    }).subscribe({
      next: ({ kpis, pending }) => {
        if (kpis) {
          this.stats.totalRescues  = kpis.totalSos        ?? kpis.totalRescues  ?? 0;
          this.stats.activeRescues = kpis.totalDispatched ?? kpis.activeRescues ?? 0;
          this.stats.totalNgos     = kpis.totalNgos ?? 0;
        }
        this.stats.pendingHospitals = Array.isArray(pending) ? pending.length : (pending?.totalElements ?? 0);
        this.loading = false;
      },
      error: () => { this.error = 'Could not load dashboard stats.'; this.loading = false; }
    });
  }
}
