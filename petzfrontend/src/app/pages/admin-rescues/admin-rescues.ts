import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'petz-admin-rescues',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './admin-rescues.html',
  styleUrl: './admin-rescues.scss'
})
export class AdminRescues implements OnInit {
  reports: any[] = [];
  loading = true;
  error = '';
  filterStatus = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params = this.filterStatus ? `?status=${this.filterStatus}` : '';
    this.http.get<any[]>(`/api/admin/rescues/live${params}`)
      .subscribe({
        next: (data) => { this.reports = Array.isArray(data) ? data : []; this.loading = false; },
        error: () => { this.error = 'Could not load rescue reports.'; this.loading = false; }
      });
  }

  statusClass(s: string): string {
    const m: Record<string, string> = { PENDING: 'orange', ASSIGNED: 'blue', IN_PROGRESS: 'blue', COMPLETED: 'green', CANCELLED: 'grey' };
    return m[s] ?? 'grey';
  }
}
