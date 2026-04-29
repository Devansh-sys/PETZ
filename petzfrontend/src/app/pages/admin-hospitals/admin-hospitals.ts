import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-admin-hospitals',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './admin-hospitals.html',
  styleUrl: './admin-hospitals.scss'
})
export class AdminHospitals implements OnInit {
  private base = environment.apiBaseUrl;

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
    this.error = '';
    this.http.get<any>(`${this.base}/hospitals`)
      .pipe(map(r => r.data ?? r), catchError(err => {
        this.error = err.error?.message ?? 'Could not load hospitals.';
        return of([]);
      }))
      .subscribe({
        next: (data) => {
          let list = Array.isArray(data) ? data : (data?.content ?? []);
          if (this.filterVerified === 'true')  list = list.filter((h: any) => h.isVerified || h.verified);
          if (this.filterVerified === 'false') list = list.filter((h: any) => !(h.isVerified || h.verified));
          this.hospitals = list;
          this.loading = false;
        }
      });
  }

  verify(hospitalId: string): void {
    this.busy = hospitalId;
    this.actionError = '';
    this.http.post<any>(`${this.base}/admin/hospitals/${hospitalId}/verify`, { action: 'APPROVE' })
      .pipe(map(r => r.data ?? r), catchError(err => {
        this.actionError = err.error?.message ?? 'Verification failed.';
        this.busy = null;
        return of(null);
      }))
      .subscribe({
        next: (res) => { if (res !== null) { this.busy = null; this.load(); } }
      });
  }

  toggleActive(hospitalId: string, active: boolean): void {
    if (!active) return;
    this.busy = hospitalId;
    this.actionError = '';
    this.http.post<any>(`${this.base}/admin/hospitals/${hospitalId}/disable`, { reason: 'Admin deactivation' })
      .pipe(catchError(err => {
        this.actionError = err.error?.message ?? 'Action failed.';
        this.busy = null;
        return of(null);
      }))
      .subscribe({
        next: (res) => { if (res !== null) { this.busy = null; this.load(); } }
      });
  }
}
