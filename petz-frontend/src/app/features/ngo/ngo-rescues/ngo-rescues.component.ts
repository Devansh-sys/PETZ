import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { rescueStatusLabel } from '../../../core/utils/rescue-status.util';

@Component({
  standalone: false,
  selector: 'app-ngo-rescues',
  templateUrl: './ngo-rescues.component.html',
  styleUrls: ['./ngo-rescues.component.scss']
})
export class NgoRescuesComponent implements OnInit {
  rescues:  any[] = [];
  filtered: any[] = [];
  loading   = true;
  selected: any | null = null;
  completionNote = '';

  filter = { search: '', status: '', criticality: '', sort: 'newest' };

  get pendingCount()   { return this.rescues.filter(r => r.status === 'PENDING').length; }
  get assignedCount()  { return this.rescues.filter(r => r.status === 'ASSIGNED').length; }
  get inProgressCount(){ return this.rescues.filter(r => r.status === 'IN_PROGRESS').length; }
  get completedCount() { return this.rescues.filter(r => r.status === 'COMPLETED' || r.status === 'RESOLVED').length; }
  get criticalCount()  { return this.rescues.filter(r => r.criticality === 'CRITICAL').length; }
  get hasActiveFilters(){ return !!(this.filter.search || this.filter.status || this.filter.criticality); }

  critClass(c: string): string {
    return (c || 'low').toLowerCase();
  }

  statusLabel(s: string): string {
    return rescueStatusLabel(s);
  }

  statusClass(s: string): string {
    switch (s?.toUpperCase()) {
      case 'PENDING':     return 'chip-pending';
      case 'ASSIGNED':    return 'chip-assigned';
      case 'IN_PROGRESS': return 'chip-in_progress';
      case 'COMPLETED':
      case 'RESOLVED':    return 'chip-completed';
      default:            return 'chip-default';
    }
  }

  timeAgo(iso: string): string {
    const utc = iso && !iso.endsWith('Z') && !iso.includes('+') ? iso + 'Z' : iso;
    const diff = Date.now() - new Date(utc).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hrs  > 0) return `${hrs}h ago`;
    return `${Math.max(1, mins)}m ago`;
  }

  fmtDate(iso: string): string {
    const utc = iso && !iso.endsWith('Z') && !iso.includes('+') ? iso + 'Z' : iso;
    return new Date(utc).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  applyFilters(): void {
    const urgencyOrder: Record<string,number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    let r = [...this.rescues];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(x => x.animalType?.toLowerCase().includes(q) || x.address?.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q));
    if (this.filter.status)      r = r.filter(x => x.status === this.filter.status);
    if (this.filter.criticality) r = r.filter(x => x.criticality === this.filter.criticality);
    if (this.filter.sort === 'newest')  r.sort((a, b) => new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime());
    if (this.filter.sort === 'oldest')  r.sort((a, b) => new Date(a.reportedAt || 0).getTime() - new Date(b.reportedAt || 0).getTime());
    if (this.filter.sort === 'urgency') r.sort((a, b) => (urgencyOrder[a.criticality] ?? 9) - (urgencyOrder[b.criticality] ?? 9));
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', criticality: '', sort: 'newest' };
    this.applyFilters();
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/ngo').subscribe({
      next: res => { this.rescues = res.data ?? []; this.applyFilters(); this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  respond(id: number, response: string): void {
    this.api.post<any>(`/rescue/${id}/respond`, { response }).subscribe({
      next: _res => {
        if (response === 'DECLINE') {
          this.rescues = this.rescues.filter(x => x.id !== id);
          this.snack.open('Rescue declined and passed to the next available NGO.', '', { duration: 3500 });
        } else {
          const r = this.rescues.find(x => x.id === id);
          if (r) r.status = 'IN_PROGRESS';
          this.snack.open('Rescue accepted! You are now in charge.', '', { duration: 3000 });
        }
        this.applyFilters();
      },
      error: err => this.snack.open(err.error?.message ?? 'Error responding to rescue.', 'Close', { duration: 3500 })
    });
  }

  complete(id: number): void {
    this.api.post<any>(`/rescue/${id}/complete`, { notes: 'Rescue completed.' }).subscribe({
      next: () => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = 'COMPLETED';
        this.applyFilters();
        this.snack.open('Rescue marked as complete!', '', { duration: 2000 });
      }
    });
  }

  completeWithNote(id: number): void {
    const notes = this.completionNote.trim() || 'Rescue completed.';
    this.api.post<any>(`/rescue/${id}/complete`, { notes }).subscribe({
      next: () => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = 'COMPLETED';
        this.applyFilters();
        this.selected = null;
        this.completionNote = '';
        this.snack.open('Rescue marked as complete!', '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 })
    });
  }
}
