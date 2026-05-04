import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { SosService } from '../../core/sos/sos.service';
import { SosReportResponse, NgoAssignment } from '../../core/sos/sos.models';

@Component({
  selector: 'petz-my-reports',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.scss'
})
export class MyReports implements OnInit {
  // NGO view
  openReports: NgoAssignment[] = [];
  assignments: NgoAssignment[] = [];
  filteredAssignments: NgoAssignment[] = [];

  // Reporter view
  myReports: SosReportResponse[] = [];

  loading = true;
  error = '';
  activeFilter = 'ALL';
  activeTab: 'open' | 'assigned' = 'open';
  actionInProgress: string | null = null;
  isNgo = false;

  constructor(private auth: AuthService, private sosService: SosService) {}

  ngOnInit(): void {
    const session = this.auth.session();
    this.isNgo = session?.role === 'NGO_REP' || session?.role === 'ADMIN';

    if (this.isNgo) {
      let done = 0;
      const finish = () => { if (++done === 2) { this.applyFilter(); this.loading = false; } };

      this.sosService.getOpenReports().subscribe({
        next: (list) => { this.openReports = list; finish(); },
        error: () => { this.error = 'Could not load open reports.'; finish(); }
      });
      this.sosService.getNgoAssignments().subscribe({
        next: (list) => { this.assignments = list; finish(); },
        error: () => { this.error = 'Could not load rescue assignments.'; finish(); }
      });
    } else {
      const userId = session?.userId;
      if (!userId) { this.loading = false; return; }
      this.sosService.getMyReports(userId).subscribe({
        next: (list) => { this.myReports = list; this.loading = false; },
        error: () => { this.error = 'Could not load your rescue reports.'; this.loading = false; }
      });
    }
  }

  setTab(t: 'open' | 'assigned'): void { this.activeTab = t; }

  setFilter(f: string): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredAssignments = this.activeFilter === 'ALL'
      ? [...this.assignments]
      : this.assignments.filter(a => a.urgencyLevel === this.activeFilter);
  }

  dismissOpen(r: NgoAssignment): void {
    this.openReports = this.openReports.filter(o => o.sosReportId !== r.sosReportId);
  }

  claim(r: NgoAssignment): void {
    this.actionInProgress = r.sosReportId;
    this.sosService.claimReport(r.sosReportId).subscribe({
      next: (updated) => {
        this.openReports = this.openReports.filter(o => o.sosReportId !== r.sosReportId);
        this.assignments = [updated, ...this.assignments];
        this.applyFilter();
        this.activeTab = 'assigned';
        this.actionInProgress = null;
      },
      error: () => { this.actionInProgress = null; }
    });
  }

  accept(a: NgoAssignment): void {
    if (!a.assignmentId) return;
    this.actionInProgress = a.assignmentId;
    this.sosService.acceptAssignment(a.assignmentId).subscribe({
      next: (updated) => { this.patchAssignment(updated); this.actionInProgress = null; },
      error: () => { this.actionInProgress = null; }
    });
  }

  reject(a: NgoAssignment): void {
    if (!a.assignmentId) return;
    this.actionInProgress = a.assignmentId;
    this.sosService.rejectAssignment(a.assignmentId).subscribe({
      next: (updated) => { this.patchAssignment(updated); this.actionInProgress = null; },
      error: () => { this.actionInProgress = null; }
    });
  }

  private patchAssignment(updated: NgoAssignment): void {
    const idx = this.assignments.findIndex(a => a.assignmentId === updated.assignmentId);
    if (idx > -1) this.assignments[idx] = updated;
    this.applyFilter();
  }

  countFor(level: string): number {
    return this.assignments.filter(a => a.urgencyLevel === level).length;
  }

  urgencyLabel(level: string): string {
    const m: Record<string, string> = {
      CRITICAL: '🚨 Critical', MODERATE: '⚠️ Moderate', LOW: '🐾 Low'
    };
    return m[level] ?? level;
  }

  urgencyClass(level: string): string {
    return ({ CRITICAL: 'critical', MODERATE: 'moderate', LOW: 'low' } as any)[level] ?? '';
  }

  assignmentStatusLabel(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'Awaiting Action', ACCEPTED: 'Accepted · Dispatched',
      DECLINED: 'Rejected', ARRIVED: 'On Site', REASSIGNED: 'Reassigned'
    };
    return m[s] ?? s;
  }

  assignmentStatusClass(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'warn', ACCEPTED: 'active', DECLINED: 'rejected',
      ARRIVED: 'active', REASSIGNED: 'grey'
    };
    return m[s] ?? 'grey';
  }

  // Reporter: status of the SOS report itself
  sosStatusLabel(status: string): string {
    const m: Record<string, string> = {
      REPORTED: 'Submitted — Awaiting Assignment',
      REJECTED: 'Rejected by NGO',
      DISPATCHED: 'NGO Accepted · Help on the way',
      ON_SITE: 'Team On Site',
      TRANSPORTING: 'Animal Being Transported',
      COMPLETE: 'Rescue Complete',
      MISSION_COMPLETE: 'Rescue Complete',
      CLOSED: 'Closed',
      FLAGGED: 'Flagged for Review'
    };
    return m[status] ?? status;
  }

  sosStatusClass(status: string): string {
    const s = status?.toUpperCase();
    if (s === 'COMPLETE' || s === 'MISSION_COMPLETE') return 'ok';
    if (s === 'DISPATCHED' || s === 'ON_SITE' || s === 'TRANSPORTING') return 'active';
    if (s === 'CLOSED' || s === 'REJECTED') return 'rejected';
    return 'warn';
  }

  formatDate(ts: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
