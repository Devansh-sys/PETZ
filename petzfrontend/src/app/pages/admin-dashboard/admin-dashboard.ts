import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'petz-admin-dashboard',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  stats = { totalRescues: 0, activeRescues: 0, pendingHospitals: 0, totalNgos: 0 };
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    forkJoin({
      kpis: this.http.get<any>('/api/admin/kpis').pipe(catchError(() => of(null))),
      pending: this.http.get<any>('/api/admin/hospitals/pending')
        .pipe(map(r => r.data ?? r), catchError(() => of([])))
    }).subscribe(({ kpis, pending }) => {
      if (kpis) {
        this.stats.totalRescues  = kpis.totalSos        ?? 0;
        this.stats.activeRescues = kpis.totalDispatched ?? 0;
      }
      this.stats.pendingHospitals = Array.isArray(pending) ? pending.length : 0;
      this.loading = false;
    });
  }
}
