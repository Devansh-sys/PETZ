import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Navbar } from '../../shared/navbar/navbar';
import { SosService } from '../../core/sos/sos.service';
import { TrackingService } from '../../core/rescue/tracking.service';
import {
  MissionSummaryResponse,
  RescueMissionResponse,
  ReportStatus,
  SosReportResponse
} from '../../core/sos/sos.models';

const POLL_INTERVAL_MS = 10_000;

interface TimelineStep {
  status: ReportStatus;
  label: string;
  emoji: string;
  at: string | undefined;
  done: boolean;
  active: boolean;
}

const STAGE_ORDER: ReportStatus[] = [
  'REPORTED',
  'DISPATCHED',
  'ON_SITE',
  'TRANSPORTING',
  'COMPLETE'
];

@Component({
  selector: 'petz-sos-status',
  imports: [Navbar, RouterLink],
  templateUrl: './sos-status.html',
  styleUrl: './sos-status.scss'
})
export class SosStatus implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sos = inject(SosService);
  private tracking = inject(TrackingService);

  reportId = signal('');
  report = signal<SosReportResponse | null>(null);
  mission = signal<RescueMissionResponse | null>(null);
  summary = signal<MissionSummaryResponse | null>(null);

  loading = signal(true);
  error = signal<string | null>(null);
  lastPolledAt = signal<Date | null>(null);

  private pollTimer?: number;

  readonly currentStatus = computed<ReportStatus>(() =>
    this.mission()?.rescueStatus ?? this.report()?.currentStatus ?? 'REPORTED'
  );

  readonly isClosed = computed(() =>
    ['COMPLETE', 'MISSION_COMPLETE', 'CLOSED'].includes(this.currentStatus())
  );

  readonly steps = computed<TimelineStep[]>(() => {
    const current = this.currentStatus();
    const m = this.mission();
    const r = this.report();
    const currentIdx = STAGE_ORDER.indexOf(current);
    const effectiveIdx = currentIdx === -1 ? STAGE_ORDER.length : currentIdx;
    return STAGE_ORDER.map((status, idx) => ({
      status,
      label: this.label(status),
      emoji: this.emoji(status),
      at: this.timestampFor(status, m, r),
      done: idx < effectiveIdx,
      active: idx === effectiveIdx
    }));
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/sos/report']); return; }
    this.reportId.set(id);
    this.refresh(true);
    this.pollTimer = window.setInterval(() => this.refresh(false), POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
  }

  refresh(initial: boolean): void {
    if (initial) this.loading.set(true);
    forkJoin({
      report: this.sos.getReport(this.reportId()),
      mission: this.tracking.getMissionByReport(this.reportId())
    }).subscribe({
      next: ({ report, mission }) => {
        this.report.set(report);
        this.mission.set(mission);
        this.lastPolledAt.set(new Date());
        if (initial) this.loading.set(false);
        if (mission && ['COMPLETE', 'MISSION_COMPLETE', 'CLOSED'].includes(mission.rescueStatus)) {
          this.loadSummary(mission.id);
          clearInterval(this.pollTimer);
        }
      },
      error: err => {
        if (initial) {
          this.error.set(err.error?.message ?? 'Could not load case status.');
          this.loading.set(false);
        }
      }
    });
  }

  private loadSummary(missionId: string): void {
    this.tracking.getSummary(missionId).subscribe(s => this.summary.set(s));
  }

  caseCode(): string {
    const id = this.reportId();
    return id ? id.slice(0, 8).toUpperCase() : '—';
  }

  formatTime(ts?: string): string {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return ts; }
  }

  formatPolled(): string {
    const t = this.lastPolledAt();
    if (!t) return '';
    return t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  private label(s: ReportStatus): string {
    switch (s) {
      case 'REPORTED':     return 'SOS received';
      case 'DISPATCHED':   return 'Rescuer dispatched';
      case 'ON_SITE':      return 'Rescuer on site';
      case 'TRANSPORTING': return 'Transporting to hospital';
      case 'COMPLETE':     return 'Rescue complete';
      default:             return s;
    }
  }

  private emoji(s: ReportStatus): string {
    switch (s) {
      case 'REPORTED':     return '📞';
      case 'DISPATCHED':   return '🏍️';
      case 'ON_SITE':      return '📍';
      case 'TRANSPORTING': return '🚑';
      case 'COMPLETE':     return '✅';
      default:             return '•';
    }
  }

  private timestampFor(
    s: ReportStatus,
    m: RescueMissionResponse | null,
    r: SosReportResponse | null
  ): string | undefined {
    switch (s) {
      case 'REPORTED':     return r?.reportedAt;
      case 'DISPATCHED':   return m?.dispatchedAt;
      case 'ON_SITE':      return m?.onSiteAt;
      case 'TRANSPORTING': return m?.transportingAt;
      case 'COMPLETE':     return m?.completedAt;
      default:             return undefined;
    }
  }
}
