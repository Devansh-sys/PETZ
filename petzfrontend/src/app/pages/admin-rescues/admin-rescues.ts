import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-admin-rescues',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './admin-rescues.html',
  styleUrl: './admin-rescues.scss'
})
export class AdminRescues implements OnInit {
  private base = environment.apiBaseUrl;

  reports: any[] = [];
  loading = true;
  error = '';
  filterStatus = '';

  // Geocoded names cache: reportId → display string
  locationNames: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const params = this.filterStatus ? `?status=${this.filterStatus}` : '';
    this.http.get<any>(`${this.base}/admin/rescues/live${params}`)
      .pipe(
        map(r => r.data ?? r),
        catchError(err => {
          this.error = err.error?.message ?? 'Could not load rescue reports.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.reports = Array.isArray(data) ? data : (data?.content ?? []);
        this.loading = false;
        this.geocodeReports();
      });
  }

  geocodeReports(): void {
    for (const r of this.reports) {
      const id = r.sosId;
      if (!r.latitude || !r.longitude || this.locationNames[id]) continue;
      const lat = r.latitude;
      const lng = r.longitude;
      this.http.get<any>(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      ).pipe(catchError(() => of(null)))
        .subscribe(res => {
          if (res?.address) {
            const a = res.address;
            const parts = [a.suburb ?? a.neighbourhood ?? a.road, a.city ?? a.town ?? a.village ?? a.county].filter(Boolean);
            this.locationNames[id] = parts.join(', ') || res.display_name?.split(',').slice(0, 2).join(', ') || `${lat}, ${lng}`;
          } else {
            this.locationNames[id] = `${lat}, ${lng}`;
          }
        });
    }
  }

  locationOf(r: any): string {
    return this.locationNames[r.sosId] ?? (r.latitude ? `${r.latitude}, ${r.longitude}` : '—');
  }

  get activeReports(): any[] {
    return this.reports.filter(r => !['COMPLETE', 'MISSION_COMPLETE', 'CLOSED'].includes(r.status));
  }

  get completedReports(): any[] {
    return this.reports.filter(r => ['COMPLETE', 'MISSION_COMPLETE', 'CLOSED'].includes(r.status));
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      REPORTED: 'orange', ASSIGNED: 'orange', DISPATCHED: 'blue', REJECTED: 'red',
      ON_SITE: 'blue', TRANSPORTING: 'blue', COMPLETE: 'green',
      MISSION_COMPLETE: 'green', FLAGGED: 'red', CLOSED: 'grey'
    };
    return m[s] ?? 'grey';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      REPORTED: 'Reported', ASSIGNED: 'Pending NGO', DISPATCHED: 'Dispatched', REJECTED: 'Rejected',
      ON_SITE: 'On Site', TRANSPORTING: 'Transporting', COMPLETE: 'Complete',
      MISSION_COMPLETE: 'Complete', FLAGGED: 'Flagged', CLOSED: 'Closed'
    };
    return m[s] ?? s;
  }
}
