import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { SosService } from '../../core/sos/sos.service';
import { NgoAssignment, SosReportResponse } from '../../core/sos/sos.models';

@Component({
  selector: 'petz-my-reports',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.scss'
})
export class MyReports implements OnInit {

  // NGO view
  assignments: NgoAssignment[] = [];        // rescues assigned to THIS NGO by admin
  filteredAssignments: NgoAssignment[] = [];

  // Reporter view
  myReports: SosReportResponse[] = [];

  isNgo = false;
  loading = true;
  error = '';
  activeFilter = 'ALL';
  actionInProgress: string | null = null;

  constructor(private auth: AuthService, private sosService: SosService) {}

  ngOnInit(): void {
    const session = this.auth.session();
    const role = session?.role ?? '';
    this.isNgo = role === 'NGO_REP' || role === 'NGO';

    if (this.isNgo) {
      this.sosService.getNgoAssignments().subscribe({
        next: (list) => { this.assignments = list; this.applyFilter(); this.loading = false; },
        error: () => { this.error = 'Could not load assignments.'; this.loading = false; }
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

  setFilter(f: string): void { this.activeFilter = f; this.applyFilter(); }

  private applyFilter(): void {
    this.filteredAssignments = this.activeFilter === 'ALL'
      ? [...this.assignments]
      : this.assignments.filter(a => a.urgencyLevel === this.activeFilter);
  }

  // NGO accepts an admin-assigned rescue (PENDING → ACCEPTED)
  accept(a: NgoAssignment): void {
    if (!a.assignmentId) return;
    this.actionInProgress = a.assignmentId;
    this.sosService.acceptAssignment(a.assignmentId).subscribe({
      next: (updated) => { this.patchAssignment(updated); this.actionInProgress = null; },
      error: () => { this.actionInProgress = null; }
    });
  }

  // NGO rejects an admin-assigned rescue (PENDING → DECLINED)
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
    return ({ CRITICAL: 'critical', MODERATE: 'moderate', LOW: 'low' } as Record<string, string>)[level] ?? '';
  }

  assignmentStatusLabel(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'Awaiting Action',
      ACCEPTED: 'Accepted · Dispatched',
      DECLINED: 'Rejected',
      ARRIVED: 'On Site',
      REASSIGNED: 'Reassigned'
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

  sosStatusLabel(status: string): string {
    const m: Record<string, string> = {
      REPORTED: 'Submitted — Awaiting Assignment',
      ASSIGNED: 'NGO Notified — Awaiting Response',
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

  formatDate(ts: string | undefined): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
