import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { NgoDispatchService } from '../../core/ngo/ngo-dispatch.service';
import {
  RescueMissionResponse,
  SosReportResponse,
  UrgencyLevel
} from '../../core/sos/sos.models';

interface QueueItem {
  mission: RescueMissionResponse;
  report: SosReportResponse | null;
}

const REFRESH_MS = 15_000;

@Component({
  selector: 'petz-ngo-queue',
  imports: [Navbar],
  templateUrl: './ngo-queue.html',
  styleUrl: './ngo-queue.scss'
})
export class NgoQueue implements OnInit, OnDestroy {
  private dispatch = inject(NgoDispatchService);
  private auth = inject(AuthService);
  private router = inject(Router);

  items = signal<QueueItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filter = signal<'ALL' | UrgencyLevel>('ALL');
  lastRefreshed = signal<Date | null>(null);

  private timer?: number;

  readonly visible = computed(() => {
    const f = this.filter();
    if (f === 'ALL') return this.items();
    return this.items().filter(i => i.report?.urgencyLevel === f);
  });

  readonly counts = computed(() => {
    const list = this.items();
    return {
      all: list.length,
      CRITICAL: list.filter(i => i.report?.urgencyLevel === 'CRITICAL').length,
      MODERATE: list.filter(i => i.report?.urgencyLevel === 'MODERATE').length,
      LOW: list.filter(i => i.report?.urgencyLevel === 'LOW').length
    };
  });

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/sos/auth']);
      return;
    }
    this.refresh(true);
    this.timer = window.setInterval(() => this.refresh(false), REFRESH_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  refresh(initial: boolean): void {
    if (initial) this.loading.set(true);
    this.dispatch.listMissionsByStatus('REPORTED').subscribe({
      next: missions => {
        if (!missions.length) {
          this.items.set([]);
          this.lastRefreshed.set(new Date());
          if (initial) this.loading.set(false);
          return;
        }
        const reportCalls = missions.map(m =>
          this.dispatch.getReport(m.sosReportId).pipe(catchError(() => of(null)))
        );
        forkJoin(reportCalls).subscribe(reports => {
          const list: QueueItem[] = missions.map((m, i) => ({ mission: m, report: reports[i] }));
          list.sort((a, b) => {
            const rank = (u?: UrgencyLevel) => u === 'CRITICAL' ? 0 : u === 'MODERATE' ? 1 : 2;
            const byUrgency = rank(a.report?.urgencyLevel) - rank(b.report?.urgencyLevel);
            if (byUrgency !== 0) return byUrgency;
            return (a.report?.reportedAt ?? '').localeCompare(b.report?.reportedAt ?? '');
          });
          this.items.set(list);
          this.lastRefreshed.set(new Date());
          if (initial) this.loading.set(false);
        });
      },
      error: err => {
        if (initial) {
          this.error.set(err.error?.message ?? 'Could not load pending cases.');
          this.loading.set(false);
        }
      }
    });
  }

  timeAgo(ts?: string): string {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 0) return 'just now';
    const m = Math.floor(diff / 60_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  formatPolled(): string {
    const t = this.lastRefreshed();
    return t ? t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
  }

  open(item: QueueItem): void {
    this.router.navigate(['/ngo/missions', item.mission.id]);
  }

  distanceHint(item: QueueItem): string {
    const r = item.report;
    if (!r) return '';
    return `${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}`;
  }
}
