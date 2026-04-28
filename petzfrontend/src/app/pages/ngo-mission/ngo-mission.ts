import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { GeoService } from '../../core/geo/geo.service';
import { NgoDispatchService, RescueStatusUpdateRequest } from '../../core/ngo/ngo-dispatch.service';
import { OnSiteService } from '../../core/rescue/onsite.service';
import {
  AssessmentDecision,
  HandoverResponse,
  NearbyHospitalResponse,
  NavigationDTO,
  OnSiteAssessmentResponse,
  RescueMissionResponse,
  ReportStatus,
  SosReportResponse
} from '../../core/sos/sos.models';

type Phase =
  | 'LOADING'
  | 'REPORTED'
  | 'AWAITING_ARRIVAL'
  | 'ASSESSMENT'
  | 'HOSPITAL_SELECTION'
  | 'HOSPITAL_ALERTED'
  | 'RELEASE_CONFIRMATION'
  | 'CANNOT_LOCATE'
  | 'CLOSED';

@Component({
  selector: 'petz-ngo-mission',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './ngo-mission.html',
  styleUrl: './ngo-mission.scss'
})
export class NgoMission implements OnInit {
  missionId = '';
  mission: RescueMissionResponse | null = null;
  report: SosReportResponse | null = null;
  assessment: OnSiteAssessmentResponse | null = null;
  hospitals: NearbyHospitalResponse[] = [];
  selectedHospitalId = '';

  // Navigation (AWAITING_ARRIVAL phase)
  navigation: NavigationDTO | null = null;
  loadingNav = false;

  // Handover (HOSPITAL_ALERTED phase)
  handover: HandoverResponse | null = null;

  loading = true;
  error = '';
  busy = false;

  // REPORTED phase inputs
  etaInput = 15;

  // ASSESSMENT phase inputs
  animalCondition = '';
  injuryDescription = '';
  decision: AssessmentDecision | null = null;
  decisionJustification = '';

  // RELEASE phase input
  releaseNotes = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dispatch: NgoDispatchService,
    private onsite: OnSiteService,
    private geo: GeoService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/ngo/queue']); return; }
    if (!this.auth.isAuthenticated()) { this.router.navigate(['/sos/auth']); return; }
    this.missionId = id;
    this.loadAll();
  }

  // ── Getters (replaces computed signals) ──────────────────────────

  get status(): ReportStatus {
    return this.mission?.rescueStatus ?? 'REPORTED';
  }

  get phase(): Phase {
    if (this.loading) return 'LOADING';
    const s = this.status;
    if (s === 'REPORTED') return 'REPORTED';
    if (s === 'DISPATCHED') return 'AWAITING_ARRIVAL';
    if (s === 'ON_SITE') return 'ASSESSMENT';
    if (s === 'TRANSPORTING') {
      if (this.assessment?.decision === 'TRANSPORT_TO_HOSPITAL') {
        return this.selectedHospitalId ? 'HOSPITAL_ALERTED' : 'HOSPITAL_SELECTION';
      }
      return 'HOSPITAL_SELECTION';
    }
    if (['COMPLETE', 'MISSION_COMPLETE', 'CLOSED'].includes(s)) {
      if (this.assessment?.decision === 'RELEASE') return 'RELEASE_CONFIRMATION';
      if (this.assessment?.decision === 'CANNOT_LOCATE') return 'CANNOT_LOCATE';
      return 'CLOSED';
    }
    return 'CLOSED';
  }

  get canSubmitAssessment(): boolean {
    return !!this.decision &&
      this.animalCondition.trim().length > 0 &&
      this.decisionJustification.trim().length > 0 &&
      !this.busy;
  }

  // ── Data loading ──────────────────────────────────────────────────

  loadAll(): void {
    this.loading = true;
    this.dispatch.getMission(this.missionId).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.dispatch.getReport(mission.sosReportId).subscribe({
          next: (report) => {
            this.report = report;
            this.loading = false;
            if (mission.rescueStatus === 'TRANSPORTING' && this.hospitals.length === 0) {
              this.loadHospitals();
            }
          },
          error: () => { this.loading = false; }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message ?? 'Could not load mission.';
        this.loading = false;
      }
    });
  }

  loadHospitals(): void {
    if (!this.report) return;
    this.onsite.getNearbyHospitals(this.report.id).subscribe({
      next: (list) => { this.hospitals = list; },
      error: () => { /* non-fatal */ }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────

  loadNavigation(): void {
    this.loadingNav = true;
    this.dispatch.getNavigation(this.missionId).subscribe({
      next: (nav) => { this.navigation = nav; this.loadingNav = false; },
      error: () => { this.loadingNav = false; this.error = 'Could not load navigation details.'; }
    });
  }

  // ── Phase actions ─────────────────────────────────────────────────

  acceptDispatch(): void {
    const session = this.auth.session();
    if (!session || this.busy) return;
    this.busy = true;
    this.error = '';
    this.dispatch.updateStatus(this.missionId, {
      newStatus: 'DISPATCHED',
      assignedNgoUserId: session.userId,
      etaMinutes: this.etaInput
    }).subscribe({
      next: (m) => { this.mission = m; this.busy = false; },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        this.error = err.error?.message ?? 'Could not accept mission.';
      }
    });
  }

  async markArrival(): Promise<void> {
    const session = this.auth.session();
    if (!session || !this.report || this.busy) return;
    this.busy = true;
    this.error = '';
    try {
      const pos = await this.geo.getCurrentPosition();
      this.onsite.markArrival(this.report.id, {
        volunteerId: session.userId,
        currentLatitude: +pos.latitude.toFixed(6),
        currentLongitude: +pos.longitude.toFixed(6)
      }).subscribe({
        next: () => { this.loadAll(); this.busy = false; },
        error: (err: HttpErrorResponse) => {
          this.busy = false;
          this.error = err.error?.message ?? 'Could not mark arrival. Are you within 200 m of the SOS location?';
        }
      });
    } catch (e: any) {
      this.busy = false;
      this.error = e?.message ?? 'Could not get your current location.';
    }
  }

  submitAssessment(): void {
    const session = this.auth.session();
    if (!session || !this.report || !this.decision || !this.canSubmitAssessment) return;
    this.busy = true;
    this.error = '';
    this.onsite.submitAssessment(this.report.id, {
      volunteerId: session.userId,
      animalCondition: this.animalCondition.trim(),
      injuryDescription: this.injuryDescription.trim() || undefined,
      decision: this.decision,
      decisionJustification: this.decisionJustification.trim()
    }).subscribe({
      next: (res) => {
        this.assessment = res;
        this.busy = false;
        this.loadAll();
        if (this.decision === 'TRANSPORT_TO_HOSPITAL') this.loadHospitals();
      },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        this.error = err.error?.message ?? 'Could not submit assessment.';
      }
    });
  }

  alertAndSelectHospital(h: NearbyHospitalResponse): void {
    if (!this.report || this.busy) return;
    this.busy = true;
    this.error = '';
    this.onsite.alertHospital(this.report.id, h.hospitalId).subscribe({
      next: () => { this.selectedHospitalId = h.hospitalId; this.busy = false; },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        this.error = err.error?.message ?? 'Could not alert the hospital.';
      }
    });
  }

  recordHandover(): void {
    if (!this.report || this.busy) return;
    this.busy = true;
    this.error = '';
    this.onsite.recordHandover(this.report.id, this.selectedHospitalId).subscribe({
      next: (h) => { this.handover = h; this.busy = false; },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        this.error = err.error?.message ?? 'Could not record handover.';
      }
    });
  }

  completeTransport(): void {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.dispatch.updateStatus(this.missionId, { newStatus: 'COMPLETE' }).subscribe({
      next: (m) => { this.mission = m; this.busy = false; },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        this.error = err.error?.message ?? 'Could not complete mission.';
      }
    });
  }

  submitRelease(): void {
    const session = this.auth.session();
    if (!session || !this.report || this.busy) return;
    this.busy = true;
    this.error = '';
    this.onsite.confirmRelease(this.report.id, this.releaseNotes.trim(), session.userId).subscribe({
      next: () => { this.busy = false; this.loadAll(); },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        if (err.status === 404 || err.status === 405) {
          this.loadAll();
        } else {
          this.error = err.error?.message ?? 'Could not submit release confirmation.';
        }
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────

  openMaps(): void {
    if (!this.report) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${this.report.latitude},${this.report.longitude}`,
      '_blank', 'noopener'
    );
  }

  caseCode(): string {
    return this.mission?.sosReportId.slice(0, 8).toUpperCase() ?? '—';
  }

  formatTime(ts?: string): string {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return ts; }
  }

  urgencyLabel(): string {
    switch (this.report?.urgencyLevel) {
      case 'CRITICAL': return '🚨 Critical';
      case 'MODERATE': return '⚠️ Moderate';
      case 'LOW':      return '🐾 Low';
      default: return '';
    }
  }

  statusLabel(s: ReportStatus): string {
    switch (s) {
      case 'REPORTED':     return 'SOS received';
      case 'DISPATCHED':   return 'Dispatched';
      case 'ON_SITE':      return 'On site';
      case 'TRANSPORTING': return 'Transporting';
      case 'COMPLETE':     return 'Complete';
      default: return s;
    }
  }
}
