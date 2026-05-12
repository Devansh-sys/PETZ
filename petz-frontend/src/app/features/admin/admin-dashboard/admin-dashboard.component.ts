import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

/* ── Medium-bright palette ────────────────────────────────────
   Users     : #4F8FD4  clear blue
   NGOs      : #7C62CC  medium indigo
   Rescues   : #E05858  clear red
   Hospitals : #2EB894  medium teal
   Adoptions : #E89340  warm amber
   ────────────────────────────────────────────────────────── */

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  loading = true;
  users: any[]     = [];
  ngos: any[]      = [];
  rescues: any[]   = [];
  hospitals: any[] = [];
  adoptions: any[] = [];

  readonly CIRC = 213.63;

  gaugeDash(active: number, total: number): string {
    const C = 113.1; // 2 * π * 18
    if (!total) return `0 ${C}`;
    return `${(active / total) * C} ${C}`;
  }

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

  /* ── Counts ─────────────────────────── */
  get activeUsers()       { return this.users.filter(u => u.isActive !== false).length; }
  get inactiveUsers()     { return this.users.filter(u => u.isActive === false).length; }
  get verifiedNgos()      { return this.ngos.filter(n => n.isVerified).length; }
  get unverifiedNgos()    { return this.ngos.filter(n => !n.isVerified).length; }
  get activeNgos()        { return this.ngos.filter(n => n.isActive !== false).length; }
  get inactiveNgos()      { return this.ngos.filter(n => n.isActive === false).length; }
  // Rescue: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, RESOLVED, CANCELLED
  get pendingRescues()    { return this.rescues.filter(r => r.status === 'PENDING').length; }
  get assignedRescues()   { return this.rescues.filter(r => r.status === 'ASSIGNED').length; }
  get inProgressRescues() { return this.rescues.filter(r => r.status === 'IN_PROGRESS').length; }
  get completedRescues()  { return this.rescues.filter(r => r.status === 'COMPLETED' || r.status === 'RESOLVED').length; }
  get cancelledRescues()  { return this.rescues.filter(r => r.status === 'CANCELLED').length; }
  get criticalPending()   {
    return this.rescues.filter(r =>
      r.criticality === 'CRITICAL' &&
      (r.status === 'PENDING' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS')
    ).length;
  }
  get activeHospitals()     { return this.hospitals.filter(h => h.isActive !== false).length; }
  get inactiveHospitals()   { return this.hospitals.filter(h => h.isActive === false).length; }
  // Adoption: PENDING, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
  get pendingAdoptions()    { return this.adoptions.filter(a => a.status === 'PENDING').length; }
  get reviewAdoptions()     { return this.adoptions.filter(a => a.status === 'UNDER_REVIEW').length; }
  get approvedAdoptions()   { return this.adoptions.filter(a => a.status === 'APPROVED').length; }
  get rejectedAdoptions()   { return this.adoptions.filter(a => a.status === 'REJECTED').length; }
  get withdrawnAdoptions()  { return this.adoptions.filter(a => a.status === 'WITHDRAWN').length; }

  /* ── Chart data ─────────────────────── */
  get rescuePipeline() {
    // All RescueStatus values: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, RESOLVED, CANCELLED
    const base = [
      { label:'Pending',     count:this.pendingRescues,    color:'#E89340' },
      { label:'Reported',               count:this.assignedRescues,   color:'#4F8FD4' },
      { label:'Assigned & In Progress', count:this.inProgressRescues, color:'#7C62CC' },
      { label:'Resolved',    count:this.completedRescues,  color:'#2EB894' },
    ];
    if (this.cancelledRescues > 0) {
      base.push({ label:'Cancelled', count:this.cancelledRescues, color:'#94A3B8' });
    }
    return base;
  }

  get urgencyBreakdown() {
    return [
      { label:'Critical', count:this.rescues.filter(r=>r.criticality==='CRITICAL').length, color:'#E05858' },
      { label:'High',     count:this.rescues.filter(r=>r.criticality==='HIGH').length,     color:'#D47A30' },
      { label:'Medium',   count:this.rescues.filter(r=>r.criticality==='MEDIUM').length,   color:'#D4B840' },
      { label:'Low',      count:this.rescues.filter(r=>r.criticality==='LOW').length,      color:'#2EB894' },
    ];
  }

  get roleDistribution() {
    return [
      { label:'Regular Users',     color:'#4F8FD4', count:this.users.filter(u=>u.role==='USER').length },
      { label:'NGO Accounts',      color:'#7C62CC', count:this.users.filter(u=>u.role==='NGO').length },
      { label:'Hospital Accounts', color:'#2EB894', count:this.users.filter(u=>u.role==='HOSPITAL').length },
      { label:'Administrators',    color:'#E05858', count:this.users.filter(u=>u.role==='ADMIN').length },
    ];
  }

  get ngoBreakdown() {
    // verifiedNgos + unverifiedNgos = ngos.length (mutually exclusive, no double-count)
    // Inactive is excluded: the /admin/ngos endpoint returns only active NGOs
    return [
      { label:'Verified',   count:this.verifiedNgos,   color:'#2EB894' },
      { label:'Unverified', count:this.unverifiedNgos, color:'#D4B840' },
    ];
  }

  get adoptionSegments() {
    // All AdoptionStatus values: PENDING, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
    const base = [
      { label:'Pending',     count:this.pendingAdoptions,   color:'#E89340' },
      { label:'Under Review',count:this.reviewAdoptions,    color:'#4F8FD4' },
      { label:'Approved',    count:this.approvedAdoptions,  color:'#2EB894' },
      { label:'Rejected',    count:this.rejectedAdoptions,  color:'#E05858' },
    ];
    if (this.withdrawnAdoptions > 0) {
      base.push({ label:'Withdrawn', count:this.withdrawnAdoptions, color:'#94A3B8' });
    }
    return base;
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      users:     this.api.get<any>('/admin/users').pipe(catchError(() => of({ data: [] }))),
      ngos:      this.api.get<any>('/admin/ngos').pipe(catchError(() => of({ data: [] }))),
      rescues:   this.api.get<any>('/admin/rescues').pipe(catchError(() => of({ data: [] }))),
      hospitals: this.api.get<any>('/admin/hospitals').pipe(catchError(() => of({ data: [] }))),
      adoptions: this.api.get<any>('/admin/adoptions').pipe(catchError(() => of({ data: [] }))),
    }).subscribe(results => {
      this.users     = results.users.data     ?? [];
      this.ngos      = results.ngos.data      ?? [];
      this.rescues   = results.rescues.data   ?? [];
      this.hospitals = results.hospitals.data ?? [];
      this.adoptions = results.adoptions.data ?? [];
      this.loading   = false;
    });
  }
}
