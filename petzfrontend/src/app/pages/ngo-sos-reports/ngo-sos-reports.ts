import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Navbar } from '../../shared/navbar/navbar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-ngo-sos-reports',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './ngo-sos-reports.html',
  styleUrl: './ngo-sos-reports.scss'
})
export class NgoSosReports implements OnInit {
  private base = environment.apiBaseUrl;

  allReports: any[] = [];
  filteredReports: any[] = [];
  loading = true;
  error = '';
  selectedLevel = 'ALL';

  locationNames: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.base}/sos-reports`)
      .pipe(
        map(r => r?.data ?? r),
        catchError(err => {
          this.error = err?.error?.message ?? 'Could not load SOS reports.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.allReports = Array.isArray(data) ? data : (data?.content ?? []);
        this.allReports.sort((a, b) => {
          const ta = a.reportedAt ? new Date(a.reportedAt).getTime() : 0;
          const tb = b.reportedAt ? new Date(b.reportedAt).getTime() : 0;
          return tb - ta;
        });
        this.filterByLevel(this.selectedLevel);
        this.loading = false;
        this.geocodeReports();
      });
  }

  filterByLevel(level: string): void {
    this.selectedLevel = level;
    if (level === 'ALL') {
      this.filteredReports = this.allReports;
    } else {
      this.filteredReports = this.allReports.filter(r => r.urgencyLevel === level);
    }
  }

  countByLevel(level: string): number {
    return this.allReports.filter(r => r.urgencyLevel === level).length;
  }

  geocodeReports(): void {
    for (const r of this.allReports) {
      const id = r.id;
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
    return this.locationNames[r.id] ?? (r.latitude ? `${r.latitude}, ${r.longitude}` : '—');
  }

  urgencyLabel(level: string): string {
    switch (level) {
      case 'CRITICAL': return '🚨 Critical';
      case 'MODERATE': return '⚠️ Moderate';
      case 'LOW': return '🐾 Low';
      default: return level || '—';
    }
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      REPORTED: 'warn', DISPATCHED: 'pending', ON_SITE: 'pending',
      TRANSPORTING: 'pending', COMPLETE: 'ok', MISSION_COMPLETE: 'ok',
      FLAGGED: 'warn', CLOSED: 'ok'
    };
    return m[s] ?? 'warn';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      REPORTED: 'Reported', DISPATCHED: 'Dispatched', ON_SITE: 'On Site',
      TRANSPORTING: 'Transporting', COMPLETE: 'Complete', MISSION_COMPLETE: 'Complete',
      FLAGGED: 'Flagged', CLOSED: 'Closed'
    };
    return m[s] ?? s ?? 'Pending';
  }

  formatDate(ts: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
