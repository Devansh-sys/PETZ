import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-ngo-dashboard',
  templateUrl: './ngo-dashboard.component.html',
  styleUrls: ['./ngo-dashboard.component.scss']
})
export class NgoDashboardComponent implements OnInit {
  ngo:          any   = null;
  animals:      any[] = [];
  rescues:      any[] = [];
  applications: any[] = [];
  loading = true;

  readonly CIRC = 213.63;

  /* ── Computed counts ──────────────────────────────── */
  get pendingRescues()   { return this.rescues.filter(r => r.status === 'PENDING').length; }
  get activeRescues()    { return this.rescues.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length; }
  get completedRescues() { return this.rescues.filter(r => r.status === 'COMPLETED' || r.status === 'RESOLVED').length; }
  get cancelledRescues() { return this.rescues.filter(r => r.status === 'CANCELLED').length; }
  get criticalRescues()  { return this.rescues.filter(r => r.criticality === 'CRITICAL' && (r.status === 'PENDING' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS')).length; }
  get pendingApps()      { return this.applications.filter(a => a.status === 'PENDING').length; }
  get reviewApps()       { return this.applications.filter(a => a.status === 'UNDER_REVIEW').length; }
  get approvedApps()     { return this.applications.filter(a => a.status === 'APPROVED').length; }
  get rejectedApps()     { return this.applications.filter(a => a.status === 'REJECTED').length; }
  get withdrawnApps()    { return this.applications.filter(a => a.status === 'WITHDRAWN').length; }

  /* ── Chart data ───────────────────────────────────── */
  get rescuePipeline() {
    const base = [
      { label: 'Pending',     count: this.pendingRescues,                                              color: '#E89340' },
      { label: 'Reported',               count: this.rescues.filter(r => r.status === 'ASSIGNED').length,    color: '#4F8FD4' },
      { label: 'Assigned & In Progress', count: this.rescues.filter(r => r.status === 'IN_PROGRESS').length, color: '#7C62CC' },
      { label: 'Resolved',    count: this.completedRescues,                                             color: '#2EB894' },
    ];
    if (this.cancelledRescues > 0) {
      base.push({ label: 'Cancelled', count: this.cancelledRescues, color: '#94A3B8' });
    }
    return base;
  }

  get appBreakdown() {
    const base = [
      { label: 'Pending',   count: this.pendingApps,  color: '#7C62CC' },
      { label: 'In Review', count: this.reviewApps,   color: '#4F8FD4' },
      { label: 'Approved',  count: this.approvedApps, color: '#2EB894' },
      { label: 'Rejected',  count: this.rejectedApps, color: '#E05858' },
    ];
    if (this.withdrawnApps > 0) {
      base.push({ label: 'Withdrawn', count: this.withdrawnApps, color: '#94A3B8' });
    }
    return base;
  }

  /* ── SVG helpers ──────────────────────────────────── */
  gaugeDash(active: number, total: number): string {
    const C = 113.1;
    if (!total) return `0 ${C}`;
    return `${(active / total) * C} ${C}`;
  }

  gaugeFull(): string { return `${113.1} 0`; }

  buildSegs(items: { count: number; color: string }[], total: number) {
    if (!total) return [];
    const active = items.filter(i => i.count > 0);
    if (active.length === 1) return [{ dash: `${this.CIRC} 0`, offset: '0', color: active[0].color }];
    const GAP = 3; let acc = 0;
    return active.map(i => {
      const len = (i.count / total) * this.CIRC;
      const seg = { dash: `${Math.max(len - GAP, 0)} ${this.CIRC}`, offset: `${-acc}`, color: i.color };
      acc += len;
      return seg;
    });
  }

  pct(value: number, total: number): number {
    return !total ? 0 : Math.round((value / total) * 100);
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      ngo:          this.api.get<any>('/ngo/profile').pipe(catchError(() => of({ data: null }))),
      animals:      this.api.get<any>('/adoption/ngo/animals').pipe(catchError(() => of({ data: [] }))),
      rescues:      this.api.get<any>('/rescue/ngo').pipe(catchError(() => of({ data: [] }))),
      applications: this.api.get<any>('/adoption/ngo/applications').pipe(catchError(() => of({ data: [] }))),
    }).subscribe(results => {
      this.ngo          = results.ngo.data          ?? null;
      this.animals      = results.animals.data      ?? [];
      this.rescues      = results.rescues.data      ?? [];
      this.applications = results.applications.data ?? [];
      this.loading      = false;
    });
  }
}
