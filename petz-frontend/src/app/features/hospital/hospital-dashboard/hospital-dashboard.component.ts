import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Seg { color: string; dash: string; offset: string; }

@Component({
  standalone: false,
  selector: 'app-hospital-dashboard',
  templateUrl: './hospital-dashboard.component.html',
  styleUrls: ['./hospital-dashboard.component.scss']
})
export class HospitalDashboardComponent implements OnInit {
  hospital: any = null;
  loading = true;

  // Counts — AppointmentStatus: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
  totalCount     = 0;
  todayCount     = 0;
  pendingCount   = 0;
  confirmedCount = 0;
  completedCount = 0;
  cancelledCount = 0;
  noShowCount    = 0;
  doctorCount    = 0;
  scheduledDoctors = 0;
  totalDailySlots  = 0;

  // Charts
  statusSegs: Seg[] = [];
  weekBars: { name: string; count: number; isToday: boolean; pending: number; confirmed: number; completed: number; cancelled: number }[] = [];
  topSpecs: { name: string; count: number }[] = [];
  weekLabel = '';
  todayLabel = '';

  readonly Math = Math;
  private readonly CIRC = 213.63;
  private readonly GAP  = 3;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    forkJoin({
      profile: this.api.get<any>('/hospitals/profile').pipe(catchError(() => of({ data: null }))),
      appts:   this.api.get<any>('/appointments/hospital').pipe(catchError(() => of({ data: [] })))
    }).subscribe(({ profile, appts }) => {
      this.hospital = profile.data;

      const all: any[] = appts.data ?? [];
      this.totalCount     = all.length;
      this.pendingCount   = all.filter(a => a.status === 'PENDING').length;
      this.confirmedCount = all.filter(a => a.status === 'CONFIRMED').length;
      this.completedCount = all.filter(a => a.status === 'COMPLETED').length;
      this.cancelledCount = all.filter(a => a.status === 'CANCELLED').length;
      this.noShowCount    = all.filter(a => a.status === 'NO_SHOW').length;

      const todayStr = new Date().toISOString().split('T')[0];
      this.todayCount = all.filter(a => a.apptDate === todayStr).length;

      this.buildStatusDonut();
      this.buildWeekBars(all);

      const hid = this.hospital?.id;
      if (hid) {
        this.api.get<any>(`/hospitals/public/${hid}/doctors`)
          .pipe(catchError(() => of({ data: [] })))
          .subscribe(r => {
            const docs: any[] = r.data ?? [];
            this.doctorCount = docs.length;
            this.scheduledDoctors = docs.filter(d => d.scheduleStart && d.scheduleEnd).length;
            this.totalDailySlots = docs.reduce((sum, d) => sum + this.slotsPerDay(d), 0);
            this.buildTopSpecs(docs);
            this.loading = false;
          });
      } else {
        this.loading = false;
      }
    });
  }

  buildStatusDonut(): void {
    // All 5 AppointmentStatus values — totalCount must equal sum of all 5
    const segs = [
      { val: this.pendingCount,   color: '#E89340' },
      { val: this.confirmedCount, color: '#4F8FD4' },
      { val: this.completedCount, color: '#2EB894' },
      { val: this.cancelledCount, color: '#E05858' },
      { val: this.noShowCount,    color: '#94A3B8' },
    ];
    this.statusSegs = this.buildSegs(segs, this.totalCount);
  }

  buildSegs(segs: { val: number; color: string }[], total: number): Seg[] {
    if (total === 0) return [];
    const result: Seg[] = [];
    let offset = 0;
    for (const s of segs) {
      if (s.val === 0) continue;
      const frac = s.val / total;
      const filled = frac * this.CIRC - this.GAP;
      result.push({
        color: s.color,
        dash: `${Math.max(filled, 0)} ${this.CIRC - Math.max(filled, 0)}`,
        offset: (-offset).toFixed(2)
      });
      offset += frac * this.CIRC;
    }
    return result;
  }

  buildWeekBars(all: any[]): void {
    const monday = this.getMonday(new Date());
    const endSun = new Date(monday);
    endSun.setDate(monday.getDate() + 6);
    this.weekLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – `
                   + `${endSun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const todayStr = new Date().toISOString().split('T')[0];
    const names = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    this.weekBars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      const dayAppts = all.filter(a => a.apptDate === ds);
      return {
        name: names[i],
        count:     dayAppts.length,
        isToday:   ds === todayStr,
        pending:   dayAppts.filter(a => a.status === 'PENDING').length,
        confirmed: dayAppts.filter(a => a.status === 'CONFIRMED').length,
        completed: dayAppts.filter(a => a.status === 'COMPLETED').length,
        cancelled: dayAppts.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length,
      };
    });
  }

  buildTopSpecs(docs: any[]): void {
    const map: Record<string, number> = {};
    for (const d of docs) {
      const s = d.specialization || 'General';
      map[s] = (map[s] || 0) + 1;
    }
    this.topSpecs = Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }

  getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const m = new Date(d);
    m.setDate(d.getDate() + diff);
    m.setHours(0, 0, 0, 0);
    return m;
  }

  barHeight(count: number): number {
    if (count === 0) return 0;
    const max = Math.max(...this.weekBars.map(b => b.count), 5);
    return Math.max(Math.round((count / max) * 100), 8);
  }

  /** Maximum daily count — floor at 3 so a single appointment never pegs the top */
  get yMax(): number {
    return Math.max(...this.weekBars.map(b => b.count), 3);
  }

  // ── Line chart helpers (viewBox 0 0 300 120) ──
  // X: 20..280 (260px across 6 gaps),  Y: 15..95 (80px tall)
  get weekLinePoints(): { x: number; y: number; count: number; name: string; isToday: boolean }[] {
    const max = this.yMax;
    return this.weekBars.map((b, i) => ({
      x: 20 + i * (260 / 6),
      y: 15 + (1 - b.count / max) * 80,
      count: b.count,
      name:  b.name,
      isToday: b.isToday
    }));
  }

  /** Smooth cubic-bezier line through all points */
  get weekLinePath(): string {
    const pts = this.weekLinePoints;
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const cpX = (p.x + c.x) / 2;
      d += ` C ${cpX.toFixed(1)} ${p.y.toFixed(1)} ${cpX.toFixed(1)} ${c.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    }
    return d;
  }

  /** Same curve closed at the baseline (y=95) to form the gradient fill area */
  get weekAreaPath(): string {
    const pts = this.weekLinePoints;
    if (pts.length < 2) return '';
    const base = 95;
    let d = `M ${pts[0].x.toFixed(1)} ${base} L ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const cpX = (p.x + c.x) / 2;
      d += ` C ${cpX.toFixed(1)} ${p.y.toFixed(1)} ${cpX.toFixed(1)} ${c.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    }
    d += ` L ${pts[pts.length - 1].x.toFixed(1)} ${base} Z`;
    return d;
  }

  /** @deprecated kept only for barHeight calls that may still exist */
  segPx(count: number): number {
    return Math.round((count / this.yMax) * 90);
  }

  pctOf(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }

  gaugeDash(active: number, total: number): string {
    const C = 113.1;
    if (total === 0) return `0 ${C}`;
    const filled = Math.min(active / total, 1) * C;
    return `${filled.toFixed(1)} ${(C - filled).toFixed(1)}`;
  }

  slotsPerDay(d: any): number {
    if (!d.scheduleStart || !d.scheduleEnd || !d.slotDuration) return 0;
    const [sh, sm] = d.scheduleStart.split(':').map(Number);
    const [eh, em] = d.scheduleEnd.split(':').map(Number);
    const total = (eh * 60 + em) - (sh * 60 + sm);
    return total > 0 ? Math.floor(total / d.slotDuration) : 0;
  }
}
