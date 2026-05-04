import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-admin-appointments',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './admin-appointments.html',
  styleUrl: './admin-appointments.scss'
})
export class AdminAppointments implements OnInit {
  private base = environment.apiBaseUrl;

  metrics: any[] = [];
  loading = true;
  error = '';

  get totals() {
    return {
      total: this.metrics.reduce((s, m) => s + (m.totalAppointments ?? 0), 0),
      confirmed: this.metrics.reduce((s, m) => s + (m.confirmedCount ?? 0), 0),
      completed: this.metrics.reduce((s, m) => s + (m.completedCount ?? 0), 0),
      cancelled: this.metrics.reduce((s, m) => s + (m.cancelledCount ?? 0), 0),
      noShow: this.metrics.reduce((s, m) => s + (m.noShowCount ?? 0), 0),
    };
  }

  get donutSegments(): { color: string; value: number; label: string }[] {
    const t = this.totals;
    if (!t.total) return [];
    return [
      { color: '#16a34a', value: t.completed, label: 'Completed' },
      { color: '#2563eb', value: t.confirmed, label: 'Confirmed' },
      { color: '#f97316', value: t.cancelled, label: 'Cancelled' },
      { color: '#dc2626', value: t.noShow, label: 'No-Show' },
    ].filter(s => s.value > 0);
  }

  donutPath(segments: any[], idx: number): string {
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const r = 40, cx = 50, cy = 50;
    let startAngle = -Math.PI / 2;
    for (let i = 0; i < idx; i++) {
      startAngle += (segments[i].value / total) * 2 * Math.PI;
    }
    const angle = (segments[idx].value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.base}/admin/hospitals/metrics`)
      .pipe(
        map(r => r.data ?? r),
        catchError(err => {
          this.error = err.error?.message ?? 'Could not load appointment metrics.';
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.metrics = Array.isArray(data) ? data : (data?.content ?? []);
          this.loading = false;
        }
      });
  }
}
