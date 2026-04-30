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

  // tab: 'apps' | 'listings' | 'rep'
  activeTab: 'apps' | 'listings' | 'rep' = 'apps';

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

  // Application detail modal (read-only view)
  selectedApp: any = null;

  // NGO pet listings modal
  selectedNgo: any = null;
  ngoPets: any[] = [];
  ngoPetsTotal = 0;
  ngoPetsPage = 0;
  ngoPetsTotalPages = 1;
  loadingNgoPets = false;
  ngoPetsFilter = '';

  // Create NGO + Rep form
  ngoName = '';
  ngoAddress = '';
  ngoContactPhone = '';
  ngoContactEmail = '';
  ngoRegistrationNumber = '';
  ngoLatitude = 0;
  ngoLongitude = 0;
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
  }

  closeDetail(): void { this.selectedApp = null; }

  // NGO pet listings
  openNgoPets(ngo: any): void {
    this.selectedNgo = ngo;
    this.ngoPetsFilter = '';
    this.loadNgoPets(0);
  }

  loadNgoPets(page: number): void {
    if (!this.selectedNgo) return;
    this.loadingNgoPets = true;
    const statusParam = this.ngoPetsFilter ? `&status=${this.ngoPetsFilter}` : '';
    this.http.get<any>(
      `${this.base}/admin/adoptions/ngos/${this.selectedNgo.id}/pets?page=${page}&size=12${statusParam}`
    ).pipe(map(r => r.data ?? r), catchError(() => of({ content: [], totalElements: 0, totalPages: 1 })))
     .subscribe(data => {
       this.ngoPets = data.content ?? [];
       this.ngoPetsTotal = data.totalElements ?? 0;
       this.ngoPetsTotalPages = data.totalPages ?? 1;
       this.ngoPetsPage = page;
       this.loadingNgoPets = false;
     });
  }

  closeNgoPetsModal(): void {
    this.selectedNgo = null;
    this.ngoPets = [];
  }

  // Add Rep to existing NGO
  addRepNgo: any = null;
  addRepBusy = false;
  addRepError = '';
  addRepSuccess = '';
  addRepForm = { fullName: '', phone: '', email: '', password: '' };

  openAddRep(ngo: any): void {
    this.addRepNgo = ngo;
    this.addRepError = '';
    this.addRepSuccess = '';
    this.addRepForm = { fullName: '', phone: '', email: '', password: '' };
  }

  closeAddRep(): void { this.addRepNgo = null; }

  submitAddRep(): void {
    if (!this.addRepForm.fullName || !this.addRepForm.phone || !this.addRepForm.password) {
      this.addRepError = 'Full name, phone, and password are required.';
      return;
    }
    this.addRepBusy = true;
    this.addRepError = '';
    this.http.post<any>(
      `${this.base}/admin/adoptions/ngos/${this.addRepNgo.id}/representative`,
      this.addRepForm
    ).pipe(catchError(err => {
      this.addRepError = err.error?.message ?? 'Failed to add representative.';
      this.addRepBusy = false;
      return of(null);
    })).subscribe(res => {
      if (res !== null) {
        this.addRepBusy = false;
        this.addRepSuccess = `Representative "${this.addRepForm.fullName}" added successfully.`;
        setTimeout(() => { this.addRepNgo = null; this.addRepSuccess = ''; this.loadAll(); }, 1500);
      }
    });
  }

  // Create NGO + Representative
  submitCreateNgo(): void {
    if (!this.ngoName || !this.repFullName || !this.repPhone || !this.repPassword) {
      this.repError = 'Please fill in all required fields.';
      return;
    }
    this.repBusy = true;
    this.repError = '';
    this.repSuccess = '';
    this.http.post<any>(
      `${this.base}/admin/adoptions/ngos`,
      {
        ngoName: this.ngoName,
        ngoAddress: this.ngoAddress,
        ngoContactPhone: this.ngoContactPhone,
        ngoContactEmail: this.ngoContactEmail,
        ngoRegistrationNumber: this.ngoRegistrationNumber,
        latitude: this.ngoLatitude,
        longitude: this.ngoLongitude,
        repFullName: this.repFullName,
        repPhone: this.repPhone,
        repEmail: this.repEmail,
        repPassword: this.repPassword
      }
    ).pipe(catchError(err => {
      this.repError = err.error?.message ?? 'Failed to create NGO.';
      this.repBusy = false;
      return of(null);
    })).subscribe(res => {
      if (res !== null) {
        this.repBusy = false;
        this.repSuccess = `NGO "${this.ngoName}" created with representative "${this.repFullName}".`;
        this.resetForm();
        this.loadAll();
      }
    });
  }

  private resetForm(): void {
    this.ngoName = ''; this.ngoAddress = ''; this.ngoContactPhone = '';
    this.ngoContactEmail = ''; this.ngoRegistrationNumber = '';
    this.ngoLatitude = 0; this.ngoLongitude = 0;
    this.repFullName = ''; this.repPhone = ''; this.repEmail = ''; this.repPassword = '';
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

  petStatusLabel(s: string): string {
    const m: Record<string, string> = {
      LISTED: 'Listed', ON_HOLD: 'On Hold', ADOPTED: 'Adopted', ARCHIVED: 'Archived'
    };
    return m[s] ?? s;
  }

  petStatusClass(s: string): string {
    const m: Record<string, string> = {
      LISTED: 'green', ON_HOLD: 'orange', ADOPTED: 'blue', ARCHIVED: 'grey'
    };
    return m[s] ?? 'grey';
  }

  ageLabel(months: number | null): string {
    if (months == null) return 'Unknown';
    if (months < 12) return `${months}mo`;
    const y = Math.floor(months / 12);
    const m = months % 12;
    return m > 0 ? `${y}y ${m}mo` : `${y}y`;
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
