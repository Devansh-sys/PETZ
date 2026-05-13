import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptionApplication } from '../../../core/models/adoption.model';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.scss']
})
export class MyApplicationsComponent implements OnInit {
  applications: AdoptionApplication[] = [];
  filtered: AdoptionApplication[] = [];
  loading = true;
  selected: AdoptionApplication | null = null;

  filter = { search: '', status: '', sort: 'newest' };

  get pendingCount(): number  { return this.applications.filter(a => a.status === 'PENDING').length; }
  get approvedCount(): number { return this.applications.filter(a => a.status === 'APPROVED').length; }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/my-applications').subscribe({
      next: res => {
        this.applications = res.data ?? [];
        this.loading = false;
        this.applyFilters();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let r = [...this.applications];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(a =>
      (a.animalName || '').toLowerCase().includes(q) ||
      (a.animalSpecies || '').toLowerCase().includes(q) ||
      (a.animalBreed || '').toLowerCase().includes(q)
    );
    if (this.filter.status) r = r.filter(a => a.status === this.filter.status);
    if (this.filter.sort === 'newest') {
      r.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
    } else {
      r.sort((a, b) => new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime());
    }
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', sort: 'newest' };
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filter.search || this.filter.status || this.filter.sort !== 'newest');
  }

  imgSrc(url?: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.mediaUrl + url;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDING':      'Pending',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED':     'Approved',
      'REJECTED':     'Rejected',
      'WITHDRAWN':    'Withdrawn'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDING':      'pending',
      'UNDER_REVIEW': 'under_review',
      'APPROVED':     'approved',
      'REJECTED':     'cancelled',
      'WITHDRAWN':    'cancelled'
    };
    return map[status] ?? status?.toLowerCase() ?? '';
  }

  statusHint(status: string): string {
    const map: Record<string, string> = {
      'PENDING':      'Awaiting NGO review',
      'UNDER_REVIEW': 'NGO is reviewing',
      'APPROVED':     'Congratulations!',
      'REJECTED':     'Not approved',
      'WITHDRAWN':    'Withdrawn'
    };
    return map[status] ?? '';
  }

  ageDisplay(months: number): string {
    if (!months) return '—';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const y = Math.floor(months / 12);
    const m = months % 12;
    return m > 0 ? `${y}y ${m}m` : `${y} year${y > 1 ? 's' : ''}`;
  }
}
