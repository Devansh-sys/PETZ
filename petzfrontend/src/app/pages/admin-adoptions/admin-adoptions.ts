import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { map, catchError, forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-admin-adoptions',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './admin-adoptions.html',
  styleUrl: './admin-adoptions.scss'
})
export class AdminAdoptions implements OnInit {
  private base = environment.apiBaseUrl;

  // tab: 'apps' | 'ngos' | 'rep'
  activeTab: 'apps' | 'ngos' | 'rep' = 'apps';

  metrics: any = null;
  ngos: any[] = [];
  applications: any[] = [];
  appTotal = 0;
  appPage = 0;
  appTotalPages = 1;
  loading = true;
  loadingApps = false;
  error = '';
  filterStatus = '';

  selectedApp: any = null;
  decideAction = '';
  decideReason = '';
  decideBusy = false;
  decideError = '';

  busy: string | null = null;
  actionError = '';

  // Add NGO rep form
  repNgoId = '';
  repFullName = '';
  repPhone = '';
  repEmail = '';
  repPassword = '';
  repBusy = false;
  repError = '';
  repSuccess = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      metrics: this.http.get<any>(`${this.base}/admin/adoptions/metrics`).pipe(
        map(r => r.data ?? r), catchError(() => of(null))
      ),
      ngos: this.http.get<any>(`${this.base}/admin/adoptions/ngos`).pipe(
        map(r => r.data ?? r), catchError(() => of([]))
      )
    }).subscribe({
      next: ({ metrics, ngos }) => {
        this.metrics = metrics;
        this.ngos = Array.isArray(ngos) ? ngos : (ngos?.content ?? []);
        this.loading = false;
        this.loadApplications(0);
      },
      error: () => { this.error = 'Could not load data.'; this.loading = false; }
    });
  }

  loadApplications(page: number): void {
    this.loadingApps = true;
    const statusParam = this.filterStatus ? `&status=${this.filterStatus}` : '';
    this.http.get<any>(`${this.base}/admin/adoptions/applications?page=${page}&size=15${statusParam}`)
      .pipe(map(r => r.data ?? r), catchError(() => of({ content: [], totalElements: 0, totalPages: 1 })))
      .subscribe(data => {
        this.applications = data.content ?? [];
        this.appTotal = data.totalElements ?? 0;
        this.appTotalPages = data.totalPages ?? 1;
        this.appPage = page;
        this.loadingApps = false;
      });
  }

  openDetail(app: any): void {
    this.selectedApp = app;
    this.decideAction = '';
    this.decideReason = '';
    this.decideError = '';
  }

  closeDetail(): void { this.selectedApp = null; }

  submitDecide(): void {
    if (!this.decideAction) return;
    this.decideBusy = true;
    this.decideError = '';
    this.http.post<any>(
      `${this.base}/admin/adoptions/applications/${this.selectedApp.id}/decide`,
      { action: this.decideAction, reason: this.decideReason }
    ).pipe(catchError(err => {
      this.decideError = err.error?.message ?? 'Action failed.';
      this.decideBusy = false;
      return of(null);
    })).subscribe(res => {
      if (res !== null) {
        this.decideBusy = false;
        this.selectedApp = null;
        this.loadApplications(this.appPage);
        this.loadAll();
      }
    });
  }

  verifyNgo(ngoId: string, action: string): void {
    this.busy = ngoId + action;
    this.actionError = '';
    this.http.post<any>(`${this.base}/admin/adoptions/ngos/${ngoId}/verify`, { action })
      .pipe(catchError(err => {
        this.actionError = err.error?.message ?? 'Action failed.';
        this.busy = null;
        return of(null);
      }))
      .subscribe(res => { if (res !== null) { this.busy = null; this.loadAll(); } });
  }

  submitAddRep(): void {
    if (!this.repNgoId || !this.repFullName || !this.repPhone || !this.repPassword) {
      this.repError = 'Please fill in all required fields.';
      return;
    }
    this.repBusy = true;
    this.repError = '';
    this.repSuccess = '';
    this.http.post<any>(
      `${this.base}/admin/adoptions/ngos/${this.repNgoId}/representative`,
      { fullName: this.repFullName, phone: this.repPhone, email: this.repEmail, password: this.repPassword }
    ).pipe(catchError(err => {
      this.repError = err.error?.message ?? 'Failed to add representative.';
      this.repBusy = false;
      return of(null);
    })).subscribe(res => {
      if (res !== null) {
        this.repBusy = false;
        this.repSuccess = `Representative "${this.repFullName}" added successfully.`;
        this.repFullName = ''; this.repPhone = ''; this.repEmail = ''; this.repPassword = ''; this.repNgoId = '';
        this.loadAll();
      }
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
      CLARIFICATION_REQUESTED: 'Clarification', APPROVED: 'Approved',
      REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn'
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      APPROVED: 'green', REJECTED: 'red', UNDER_REVIEW: 'blue',
      SUBMITTED: 'orange', DRAFT: 'grey', WITHDRAWN: 'grey', CLARIFICATION_REQUESTED: 'orange'
    };
    return m[s] ?? 'grey';
  }

  // SVG donut data
  get donutSegments(): { color: string; value: number; label: string }[] {
    if (!this.metrics) return [];
    const total = this.metrics.totalApplications || 1;
    return [
      { color: '#16a34a', value: this.metrics.approvedCount ?? 0, label: 'Approved' },
      { color: '#dc2626', value: this.metrics.rejectedCount ?? 0, label: 'Rejected' },
      { color: '#2563eb', value: this.metrics.completedAdoptions ?? 0, label: 'Completed' },
      { color: '#f97316', value: Math.max(0, total - (this.metrics.approvedCount ?? 0) - (this.metrics.rejectedCount ?? 0) - (this.metrics.withdrawnCount ?? 0)), label: 'Pending' },
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
}
