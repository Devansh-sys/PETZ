import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-admin-rescues',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './admin-rescues.html',
  styleUrl: './admin-rescues.scss'
})
export class AdminRescues implements OnInit {
  private base = environment.apiBaseUrl;

  reports: any[] = [];
  loading = true;
  error = '';
  filterStatus = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

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
      .subscribe({
        next: (data) => {
          this.reports = Array.isArray(data) ? data : (data?.content ?? []);
          this.loading = false;
        }
      });
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      REPORTED: 'orange', DISPATCHED: 'blue', ON_SITE: 'blue',
      TRANSPORTING: 'blue', COMPLETE: 'green', MISSION_COMPLETE: 'green',
      FLAGGED: 'orange', CLOSED: 'grey'
    };
    return m[s] ?? 'grey';
  }
}
