import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptionApplication } from '../../../core/models/adoption.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-ngo-applications',
  templateUrl: './ngo-applications.component.html',
  styleUrls: ['./ngo-applications.component.scss']
})
export class NgoApplicationsComponent implements OnInit {
  applications: AdoptionApplication[] = [];
  filtered:     AdoptionApplication[] = [];
  loading    = true;
  selected:  AdoptionApplication | null = null;
  reviewNote = '';

  filter = { search: '', status: '', sort: 'newest' };

  get pendingCount()  { return this.applications.filter(a => a.status === 'PENDING').length; }
  get approvedCount() { return this.applications.filter(a => a.status === 'APPROVED').length; }
  get rejectedCount() { return this.applications.filter(a => a.status === 'REJECTED').length; }
  get uniqueAnimals() { return new Set(this.applications.map(a => a.animalId)).size; }
  get hasActiveFilters() { return !!(this.filter.search || this.filter.status); }

  imgSrc(url?: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.mediaUrl + url;
  }

  statusClass(s: string): string {
    switch (s?.toUpperCase()) {
      case 'PENDING':  return 'chip-pending';
      case 'APPROVED': return 'chip-approved';
      case 'REJECTED': return 'chip-rejected';
      default:         return 'chip-default';
    }
  }

  fmtAge(months?: number): string {
    if (!months && months !== 0) return '—';
    if (months < 12) return `${months} mo`;
    const y = Math.floor(months / 12), m = months % 12;
    return m > 0 ? `${y} yr ${m} mo` : `${y} yr`;
  }

  fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  applyFilters(): void {
    let r = [...this.applications];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(a =>
      a.animalName?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q) ||
      String(a.applicantId).includes(q)
    );
    if (this.filter.status) r = r.filter(a => a.status?.toUpperCase() === this.filter.status);
    if (this.filter.sort === 'newest')  r.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
    if (this.filter.sort === 'oldest')  r.sort((a, b) => new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime());
    if (this.filter.sort === 'pending') r.sort((a, b) => (a.status === 'PENDING' ? -1 : 1) - (b.status === 'PENDING' ? -1 : 1));
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', sort: 'newest' };
    this.applyFilters();
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/ngo/applications').subscribe({
      next: res => { this.applications = res.data ?? []; this.applyFilters(); this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  review(id: number, status: string, notes: string = ''): void {
    const body: any = { status };
    if (notes.trim()) body.notes = notes.trim();
    this.api.patch<any>(`/adoption/ngo/applications/${id}/review`, body).subscribe({
      next: () => {
        const a = this.applications.find(x => x.id === id);
        if (a) a.status = status;
        this.applyFilters();
        if (this.selected?.id === id) this.selected = null;
        this.reviewNote = '';
        this.snack.open(`Application ${status.toLowerCase()}.`, '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error processing application.', 'Close', { duration: 3000 })
    });
  }
}
