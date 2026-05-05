import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Navbar } from '../../shared/navbar/navbar';
import { SosService } from '../../core/sos/sos.service';
import { TrackingService } from '../../core/rescue/tracking.service';
import { RescueMissionResponse, SosReportResponse, UrgencyLevel } from '../../core/sos/sos.models';

@Component({
  selector: 'petz-sos-report-confirmed',
  imports: [Navbar, RouterLink],
  templateUrl: './sos-report-confirmed.html',
  styleUrl: './sos-report-confirmed.scss'
})
export class SosReportConfirmed implements OnInit {
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private sos      = inject(SosService);
  private tracking = inject(TrackingService);

  report  = signal<SosReportResponse | null>(null);
  mission = signal<RescueMissionResponse | null>(null);
  loading = signal(false);
  error   = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/sos/report']); return; }

    this.loading.set(true);
    forkJoin({
      report:  this.sos.getReport(id),
      mission: this.tracking.getMissionByReport(id)
    }).subscribe({
      next: ({ report, mission }) => {
        this.report.set(report);
        this.mission.set(mission);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Could not load report.');
        this.loading.set(false);
      }
    });
  }

  /** Dynamic heading based on what's actually happened */
  headingText(): string {
    const m = this.mission();
    if (!m) return 'SOS Received.';
    if (m.currentAssignmentStatus === 'ACCEPTED' || m.currentAssignmentStatus === 'ARRIVED') return 'Help is on the way.';
    if (m.currentAssignmentStatus === 'PENDING') return 'Request sent to NGO.';
    return 'SOS Received.';
  }

  subText(): string {
    const m = this.mission();
    const code = `<strong>#${this.caseCode()}</strong>`;
    if (!m?.assignedNgoName) return `Case ${code} is live. Finding the nearest verified partner…`;
    if (m.currentAssignmentStatus === 'PENDING')
      return `Case ${code} is live. Waiting for <strong>${m.assignedNgoName}</strong> to accept.`;
    if (m.currentAssignmentStatus === 'ACCEPTED' || m.currentAssignmentStatus === 'ARRIVED')
      return `Case ${code} is live. <strong>${m.assignedNgoName}</strong> has confirmed and is on the way.`;
    return `Case ${code} is live. The nearest verified partner is being notified.`;
  }

  assignmentStateLabel(): string {
    const status = this.mission()?.currentAssignmentStatus;
    switch (status) {
      case 'PENDING':  return 'Request sent — awaiting response';
      case 'ACCEPTED': return 'Accepted ✓ — Help is on the way';
      case 'ARRIVED':  return 'Rescuer on scene ✓';
      default:         return 'Assigned NGO';
    }
  }

  urgencyLabel(u: UrgencyLevel | undefined): string {
    switch (u) {
      case 'CRITICAL': return '🚨 Critical';
      case 'MODERATE': return '⚠️ Moderate';
      case 'LOW':      return '🐾 Low';
      default: return '';
    }
  }

  caseCode(): string {
    const id = this.report()?.id ?? '';
    return id ? id.slice(0, 8).toUpperCase() : '—';
  }
}
