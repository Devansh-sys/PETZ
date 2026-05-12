import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { catchError, of } from 'rxjs';

interface Seg      { dash: string; offset: string; color: string; }
interface LegItem  { label: string; color: string; count: number; pct: number; }
interface CardData { total: number; segs: Seg[]; legend: LegItem[]; insight: string; }

const CIRC = +(2 * Math.PI * 34).toFixed(2); // 213.63

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  readonly circ = CIRC;

  firstName    = '';
  greeting     = '';
  today        = '';
  hoveredCard: string | null = null;

  petCard:    CardData = this.empty();
  apptCard:   CardData = this.empty();
  rescueCard: CardData = this.empty();
  adoptCard:  CardData = this.empty();

  constructor(private auth: AuthService, private api: ApiService) {}

  private empty(): CardData { return { total: 0, segs: [], legend: [], insight: '—' }; }

  ngOnInit(): void {
    const user = this.auth.currentUser$.value;
    this.firstName = (user?.name ?? 'User').split(' ')[0];
    this.greeting  = this.getGreeting();
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.loadData();
  }

  private loadData(): void {

    // ── My Pets ──
    this.api.get<any>('/pets/my').pipe(catchError(() => of({ data: [] }))).subscribe(res => {
      const pets: any[] = res.data ?? [];
      const dogs  = pets.filter(p => p.species?.toLowerCase() === 'dog').length;
      const cats  = pets.filter(p => p.species?.toLowerCase() === 'cat').length;
      const birds = pets.filter(p => p.species?.toLowerCase() === 'bird').length;
      const other = pets.length - dogs - cats - birds;
      const raw = [
        { label: 'Dogs',  color: '#F97316', count: dogs  },
        { label: 'Cats',  color: '#A855F7', count: cats  },
        { label: 'Birds', color: '#3B82F6', count: birds },
        { label: 'Other', color: '#94A3B8', count: other },
      ].filter(l => l.count > 0);
      const legend = this.withPct(raw.length ? raw : [
        { label: 'Dogs',  color: '#F97316', count: 0 },
        { label: 'Cats',  color: '#A855F7', count: 0 },
        { label: 'Other', color: '#94A3B8', count: 0 },
      ]);
      const top = [...legend].sort((a, b) => b.count - a.count)[0];
      this.petCard = {
        total:   pets.length,
        segs:    this.buildSegs(legend),
        legend,
        insight: top?.count > 0 ? `Mostly ${top.label}` : 'No pets added yet',
      };
    });

    // ── Appointments ──
    this.api.get<any>('/appointments/my').pipe(catchError(() => of({ data: [] }))).subscribe(res => {
      const appts: any[] = res.data ?? [];
      const upcoming  = appts.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
      const completed = appts.filter(a => a.status === 'COMPLETED').length;
      const cancelled = appts.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length;
      const legend = this.withPct([
        { label: 'Upcoming',  color: '#6366F1', count: upcoming  },
        { label: 'Done',      color: '#10B981', count: completed },
        { label: 'Cancelled', color: '#EF4444', count: cancelled },
      ]);
      this.apptCard = {
        total:   appts.length,
        segs:    this.buildSegs(legend),
        legend,
        insight: upcoming > 0 ? `${upcoming} upcoming` : completed > 0 ? 'All completed' : 'No appointments',
      };
    });

    // ── Rescue Reports ──
    this.api.get<any>('/rescue/my').pipe(catchError(() => of({ data: [] }))).subscribe(res => {
      const reports: any[] = res.data ?? [];
      const pending    = reports.filter(r => r.status === 'PENDING').length;
      const reported   = reports.filter(r => r.status === 'ASSIGNED').length;
      const inProgress = reports.filter(r => r.status === 'IN_PROGRESS').length;
      const active     = reported + inProgress;
      const resolved   = reports.filter(r => r.status === 'RESOLVED' || r.status === 'COMPLETED').length;
      const cancelled  = reports.filter(r => r.status === 'CANCELLED').length;
      const raw = [
        { label: 'Pending',               color: '#F59E0B', count: pending    },
        { label: 'Reported',              color: '#EC4899', count: reported   },
        { label: 'Assigned & In Progress',color: '#8B5CF6', count: inProgress },
        { label: 'Resolved',              color: '#10B981', count: resolved   },
        ...(cancelled > 0 ? [{ label: 'Cancelled', color: '#94A3B8', count: cancelled }] : []),
      ];
      const legend = this.withPct(raw);
      this.rescueCard = {
        total:   reports.length,
        segs:    this.buildSegs(legend),
        legend,
        insight: active > 0 ? `${active} active` : resolved > 0 ? 'All resolved' : pending > 0 ? `${pending} pending` : 'No reports yet',
      };
    });

    // ── Adoptions ──
    this.api.get<any>('/adoption/my-applications').pipe(catchError(() => of({ data: [] }))).subscribe(res => {
      const apps: any[] = res.data ?? [];
      const pending   = apps.filter(a => a.status === 'PENDING').length;
      const review    = apps.filter(a => a.status === 'UNDER_REVIEW').length;
      const approved  = apps.filter(a => a.status === 'APPROVED').length;
      const rejected  = apps.filter(a => a.status === 'REJECTED').length;
      const withdrawn = apps.filter(a => a.status === 'WITHDRAWN').length;
      const raw = [
        { label: 'Pending',   color: '#F59E0B', count: pending   },
        { label: 'In Review', color: '#6366F1', count: review    },
        { label: 'Approved',  color: '#10B981', count: approved  },
        { label: 'Rejected',  color: '#EF4444', count: rejected  },
        ...(withdrawn > 0 ? [{ label: 'Withdrawn', color: '#94A3B8', count: withdrawn }] : []),
      ].filter(l => l.count > 0);
      const legend = this.withPct(raw.length ? raw : [
        { label: 'Pending',   color: '#F59E0B', count: 0 },
        { label: 'In Review', color: '#6366F1', count: 0 },
        { label: 'Approved',  color: '#10B981', count: 0 },
      ]);
      this.adoptCard = {
        total:   apps.length,
        segs:    this.buildSegs(legend),
        legend,
        insight: approved > 0 ? `${approved} approved!` :
                 (pending + review) > 0 ? `${pending + review} in progress` : 'No applications',
      };
    });
  }

  private withPct(items: Omit<LegItem, 'pct'>[]): LegItem[] {
    const total = items.reduce((s, i) => s + i.count, 0);
    return items.map(i => ({ ...i, pct: total > 0 ? Math.round((i.count / total) * 100) : 0 }));
  }

  private buildSegs(items: LegItem[]): Seg[] {
    const total = items.reduce((s, i) => s + i.count, 0);
    if (!total) return [];
    const active = items.filter(i => i.count > 0);
    if (active.length === 1) return [{ dash: `${CIRC} 0`, offset: '0', color: active[0].color }];
    const GAP = 5;
    let acc = 0;
    return active.map(i => {
      const len = Math.max((i.count / total) * CIRC - GAP, 1);
      const seg: Seg = { dash: `${len} ${CIRC}`, offset: `${-acc}`, color: i.color };
      acc += len + GAP;
      return seg;
    });
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
