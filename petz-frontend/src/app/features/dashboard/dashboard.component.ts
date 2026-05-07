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
  template: `
    <div class="page-container">

      <!-- ── Greeting ── -->
      <div class="greeting-row">
        <div>
          <h1 class="greeting-text">{{ greeting }}, {{ firstName }}! 🐾</h1>
          <p class="page-subtitle">Here's today's overview of the platform.</p>
        </div>
        <div class="date-badge">
          <mat-icon style="font-size:16px;width:16px;height:16px;color:#FF8C42">calendar_today</mat-icon>
          <span>{{ today }}</span>
        </div>
      </div>

      <!-- ── Emergency Banner ── -->
      <div class="emergency-banner" routerLink="/rescue/report">
        <div class="emergency-left">
          <div class="emergency-icon-wrap">
            <mat-icon class="emergency-icon">crisis_alert</mat-icon>
          </div>
          <div class="emergency-text">
            <span class="emergency-title">Animal in Distress?</span>
            <span class="emergency-sub">Report it immediately — every second counts.</span>
          </div>
        </div>
        <button class="emergency-btn" (click)="$event.stopPropagation()" routerLink="/rescue/report">
          <mat-icon>arrow_forward</mat-icon>
          Report Now
        </button>
      </div>

      <!-- ── Stat cards ── -->
      <div class="stats-grid">

        <div class="stat-card-v2 orange"
             (mouseenter)="hoveredCard='pets'" (mouseleave)="hoveredCard=null">
          <div class="sc-top">
            <div class="sc-info">
              <div class="sc-icon-box"><mat-icon>pets</mat-icon></div>
              <div class="sc-label">My Pets</div>
              <div class="sc-insight">{{ petCard.insight }}</div>
            </div>
            <ng-container *ngTemplateOutlet="donut; context:{card:petCard, empty:'#FF9F5A'}"></ng-container>
          </div>
          <div class="sc-bottom">
            <ng-container *ngTemplateOutlet="legend; context:{card:petCard, key:'pets'}"></ng-container>
          </div>
        </div>

        <div class="stat-card-v2 purple"
             (mouseenter)="hoveredCard='appts'" (mouseleave)="hoveredCard=null">
          <div class="sc-top">
            <div class="sc-info">
              <div class="sc-icon-box"><mat-icon>event</mat-icon></div>
              <div class="sc-label">Appointments</div>
              <div class="sc-insight">{{ apptCard.insight }}</div>
            </div>
            <ng-container *ngTemplateOutlet="donut; context:{card:apptCard, empty:'#B97AFB'}"></ng-container>
          </div>
          <div class="sc-bottom">
            <ng-container *ngTemplateOutlet="legend; context:{card:apptCard, key:'appts'}"></ng-container>
          </div>
        </div>

        <div class="stat-card-v2 pink"
             (mouseenter)="hoveredCard='rescue'" (mouseleave)="hoveredCard=null">
          <div class="sc-top">
            <div class="sc-info">
              <div class="sc-icon-box"><mat-icon>emergency</mat-icon></div>
              <div class="sc-label">Rescue Reports</div>
              <div class="sc-insight">{{ rescueCard.insight }}</div>
            </div>
            <ng-container *ngTemplateOutlet="donut; context:{card:rescueCard, empty:'#F472B6'}"></ng-container>
          </div>
          <div class="sc-bottom">
            <ng-container *ngTemplateOutlet="legend; context:{card:rescueCard, key:'rescue'}"></ng-container>
          </div>
        </div>

        <div class="stat-card-v2 green"
             (mouseenter)="hoveredCard='adopt'" (mouseleave)="hoveredCard=null">
          <div class="sc-top">
            <div class="sc-info">
              <div class="sc-icon-box"><mat-icon>favorite</mat-icon></div>
              <div class="sc-label">Adoptions</div>
              <div class="sc-insight">{{ adoptCard.insight }}</div>
            </div>
            <ng-container *ngTemplateOutlet="donut; context:{card:adoptCard, empty:'#34D399'}"></ng-container>
          </div>
          <div class="sc-bottom">
            <ng-container *ngTemplateOutlet="legend; context:{card:adoptCard, key:'adopt'}"></ng-container>
          </div>
        </div>

      </div>

      <!-- ── Quick actions ── -->
      <div class="section-header"><h2>Quick Actions</h2></div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/rescue">
          <div class="action-icon red"><mat-icon>emergency</mat-icon></div>
          <div>
            <p class="action-title">Report Rescue</p>
            <p class="action-desc">Submit a new animal rescue report</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/adoption/animals">
          <div class="action-icon orange"><mat-icon>favorite</mat-icon></div>
          <div>
            <p class="action-title">Browse Adoptions</p>
            <p class="action-desc">Find animals looking for a home</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/appointments/book">
          <div class="action-icon purple"><mat-icon>event</mat-icon></div>
          <div>
            <p class="action-title">Book Appointment</p>
            <p class="action-desc">Schedule a vet visit for your pet</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/adoption/my">
          <div class="action-icon green"><mat-icon>favorite</mat-icon></div>
          <div>
            <p class="action-title">My Adoptions</p>
            <p class="action-desc">Track your adoption applications</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/appointments">
          <div class="action-icon teal"><mat-icon>calendar_month</mat-icon></div>
          <div>
            <p class="action-title">My Appointments</p>
            <p class="action-desc">View all your scheduled vet visits</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>
      </div>

    </div>

    <!-- ── Donut ring template ── -->
    <ng-template #donut let-card="card" let-empty="empty">
      <div class="sc-ring">
        <svg width="92" height="92" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r="34" fill="none"
                  stroke="rgba(255,255,255,0.18)" stroke-width="10"/>
          @if (card.segs.length === 0) {
            <circle cx="46" cy="46" r="34" fill="none"
                    [attr.stroke]="empty" stroke-width="10" stroke-opacity="0.25"
                    [attr.stroke-dasharray]="circ + ' 0'"
                    transform="rotate(-90 46 46)"/>
          }
          @for (s of card.segs; track $index) {
            <circle cx="46" cy="46" r="34" fill="none"
                    [attr.stroke]="s.color" stroke-width="10"
                    [attr.stroke-dasharray]="s.dash"
                    [attr.stroke-dashoffset]="s.offset"
                    transform="rotate(-90 46 46)"/>
          }
          <text x="46" y="51" text-anchor="middle"
                font-size="21" font-weight="900" fill="white"
                font-family="system-ui,-apple-system,sans-serif">{{ card.total }}</text>
        </svg>
      </div>
    </ng-template>

    <!-- ── Legend template (reused per card) ── -->
    <ng-template #legend let-card="card" let-key="key">
      @for (l of card.legend; track l.label) {
        <div class="leg-item" [class.hovered]="hoveredCard === key">
          <div class="leg-main">
            <span class="leg-dot" [style.background]="l.color"></span>
            <span class="leg-lbl">{{ l.label }}</span>
            <span class="leg-cnt">{{ l.count }}</span>
            <span class="leg-pct">{{ l.pct }}%</span>
          </div>
          <div class="leg-bar-track">
            <div class="leg-bar-fill"
                 [style.background]="l.color"
                 [style.width.%]="hoveredCard === key ? l.pct : 0"></div>
          </div>
        </div>
      }
      @if (card.total === 0) {
        <span class="leg-empty">No data yet</span>
      }
    </ng-template>
  `,
  styles: [`
    /* ── Greeting ── */
    .greeting-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px;
    }
    .greeting-text { font-size: 1.9rem; font-weight: 900; color: #FF8C42; margin: 0 0 4px; }
    .date-badge {
      display: flex; align-items: center; gap: 6px;
      background: #fff; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 8px 14px; font-size: 0.82rem; font-weight: 600;
      color: #4A6478; white-space: nowrap;
    }

    /* ── Emergency Banner ── */
    .emergency-banner {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
      border-radius: 18px; padding: 18px 22px;
      margin-bottom: 24px; cursor: pointer;
      box-shadow: 0 6px 24px rgba(185,28,28,0.35);
      position: relative; overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(185,28,28,0.45); }
      &::before {
        content: '';
        position: absolute; inset: 0;
        background: radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%);
        pointer-events: none;
      }
    }
    .emergency-left { display: flex; align-items: center; gap: 16px; }
    .emergency-icon-wrap {
      width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
      background: rgba(255,255,255,0.18);
      display: flex; align-items: center; justify-content: center;
      position: relative;
      &::after {
        content: '';
        position: absolute; inset: -4px;
        border-radius: 18px;
        border: 2px solid rgba(255,255,255,0.35);
        animation: emergencyPulse 1.8s ease-in-out infinite;
      }
    }
    .emergency-icon { color: #fff; font-size: 26px; width: 26px; height: 26px; }
    .emergency-text { display: flex; flex-direction: column; gap: 3px; }
    .emergency-title { font-size: 1rem; font-weight: 800; color: #fff; }
    .emergency-sub   { font-size: 0.78rem; font-weight: 500; color: rgba(255,255,255,0.78); }
    .emergency-btn {
      display: flex; align-items: center; gap: 6px; flex-shrink: 0;
      background: #fff; color: #B91C1C;
      border: none; border-radius: 12px; padding: 10px 18px;
      font-size: 0.85rem; font-weight: 800; cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      transition: background 0.15s, transform 0.15s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: #FEE2E2; transform: scale(1.04); }
    }
    @keyframes emergencyPulse {
      0%   { opacity: 0.8; transform: scale(1); }
      50%  { opacity: 0.2; transform: scale(1.18); }
      100% { opacity: 0.8; transform: scale(1); }
    }

    /* ── Stats grid ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 20px; margin-bottom: 36px;
      align-items: start; /* rows don't grow when a card's sc-bottom expands */
    }

    /* ── Stat card shell ── */
    .stat-card-v2 {
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      cursor: default;
      position: relative; z-index: 1; /* allow hover z-index elevation */
      &:hover { transform: translateY(-5px); z-index: 10; }
      &.orange:hover { box-shadow: 0 14px 40px rgba(255,140,66,0.35); }
      &.purple:hover { box-shadow: 0 14px 40px rgba(124,58,237,0.35); }
      &.pink:hover   { box-shadow: 0 14px 40px rgba(219,39,119,0.35); }
      &.green:hover  { box-shadow: 0 14px 40px rgba(5,150,105,0.35); }
    }

    /* ── Top gradient half ── */
    .sc-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 14px 16px 20px; min-height: 118px;
    }
    .stat-card-v2.orange .sc-top { background: linear-gradient(135deg,#FFAB5E 0%,#FF8C42 100%); }
    .stat-card-v2.purple .sc-top { background: linear-gradient(135deg,#C084FC 0%,#7C3AED 100%); }
    .stat-card-v2.pink   .sc-top { background: linear-gradient(135deg,#F472B6 0%,#DB2777 100%); }
    .stat-card-v2.green  .sc-top { background: linear-gradient(135deg,#34D399 0%,#059669 100%); }

    .sc-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
    .sc-icon-box {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; margin-bottom: 6px;
      mat-icon { font-size: 19px; width: 19px; height: 19px; color: #fff; }
    }
    .sc-label  { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.06em; }
    .sc-insight {
      font-size: 0.74rem; font-weight: 600; color: rgba(255,255,255,0.68);
      transition: color 0.2s, font-weight 0.2s;
    }
    .stat-card-v2:hover .sc-insight { color: rgba(255,255,255,0.95); font-weight: 700; }

    /* donut ring */
    .sc-ring { flex-shrink: 0; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.12)); }
    .sc-ring svg { transition: transform 0.25s ease; }
    .stat-card-v2:hover .sc-ring svg { transform: scale(1.1); }

    /* ── Bottom legend half ── */
    .sc-bottom {
      background: #fff; padding: 12px 14px 14px;
      display: flex; gap: 6px; flex-wrap: wrap; align-items: flex-start;
      /* Fixed height: prevents the card layout from growing on hover,
         which was causing the card to push down and overlap content below.
         The parent .stat-card-v2 overflow:hidden handles boundary clipping. */
      height: 80px;
      box-sizing: border-box;
    }

    /* ── Legend item ── */
    .leg-item {
      display: flex; flex-direction: column; gap: 0;
      background: #F8FAFC; border: 1px solid #EDF2F7;
      border-radius: 10px; padding: 5px 9px 5px 8px;
      flex: 1; min-width: 68px;
      transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
      &.hovered {
        background: #fff; border-color: #CBD5E1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      }
    }

    .leg-main { display: flex; align-items: center; gap: 5px; }
    .leg-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .leg-lbl  {
      font-size: 0.7rem; font-weight: 600; color: #4A6478;
      flex: 1; min-width: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .leg-cnt {
      font-size: 0.7rem; font-weight: 800; color: #1A3547;
      background: #EDF2F7; border-radius: 999px; padding: 1px 7px;
      flex-shrink: 0;
      transition: opacity 0.22s;
    }
    .leg-item.hovered .leg-cnt { opacity: 0.3; }

    .leg-pct {
      font-size: 0.69rem; font-weight: 800; color: #374151;
      flex-shrink: 0;
      opacity: 0; max-width: 0; overflow: hidden; white-space: nowrap;
      transition: opacity 0.22s 0.08s, max-width 0.22s;
    }
    .leg-item.hovered .leg-pct { opacity: 1; max-width: 38px; }

    /* animated progress bar */
    .leg-bar-track {
      height: 0; overflow: hidden; border-radius: 999px;
      background: #E5E7EB; margin-top: 0;
      transition: height 0.22s ease, margin-top 0.22s ease;
    }
    .leg-item.hovered .leg-bar-track { height: 4px; margin-top: 5px; }

    .leg-bar-fill {
      height: 100%; border-radius: 999px; width: 0%;
      transition: width 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.18s;
    }

    .leg-empty { font-size: 0.74rem; color: #B0C4D4; font-style: italic; padding: 4px 6px; align-self: center; }

    /* ── Section header ── */
    .section-header { display: flex; align-items: center; margin-bottom: 16px; h2 { margin: 0; color: #1A3547; } }

    /* ── Quick actions ── */
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .action-card {
      display: flex; align-items: center; gap: 16px;
      background: #fff; border: 1px solid #E0EBF2;
      border-radius: 16px; padding: 18px 20px; cursor: pointer; transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #FDBF8A; }
    }
    .action-icon {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; color: #fff; }
      &.red    { background: linear-gradient(135deg,#F87171,#DC2626); }
      &.orange { background: linear-gradient(135deg,#FF9F5A,#FF8C42); }
      &.purple { background: linear-gradient(135deg,#B97AFB,#7C3AED); }
      &.green  { background: linear-gradient(135deg,#34D399,#059669); }
      &.teal   { background: linear-gradient(135deg,#22D3EE,#0891B2); }
    }
    .action-title { margin: 0 0 3px; font-weight: 700; font-size: 0.92rem; color: #1A3547; }
    .action-desc  { margin: 0; font-size: 0.78rem; color: #8BA3B5; }
    .action-arrow { margin-left: auto; color: #D6C4BB !important; font-size: 20px !important; }
  `]
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
      const upcoming  = appts.filter(a => a.status === 'SCHEDULED').length;
      const completed = appts.filter(a => a.status === 'COMPLETED').length;
      const cancelled = appts.filter(a => a.status === 'CANCELLED').length;
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
      const pending  = reports.filter(r => r.status === 'PENDING').length;
      const active   = reports.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length;
      const resolved = reports.filter(r => r.status === 'RESOLVED').length;
      const legend = this.withPct([
        { label: 'Pending',  color: '#F59E0B', count: pending  },
        { label: 'Active',   color: '#EC4899', count: active   },
        { label: 'Resolved', color: '#10B981', count: resolved },
      ]);
      this.rescueCard = {
        total:   reports.length,
        segs:    this.buildSegs(legend),
        legend,
        insight: active > 0 ? `${active} active` : resolved > 0 ? 'All resolved' : 'No reports yet',
      };
    });

    // ── Adoptions ──
    this.api.get<any>('/adoption/my-applications').pipe(catchError(() => of({ data: [] }))).subscribe(res => {
      const apps: any[] = res.data ?? [];
      const pending  = apps.filter(a => a.status === 'PENDING').length;
      const review   = apps.filter(a => a.status === 'UNDER_REVIEW').length;
      const approved = apps.filter(a => a.status === 'APPROVED').length;
      const rejected = apps.filter(a => a.status === 'REJECTED').length;
      const raw = [
        { label: 'Pending',   color: '#F59E0B', count: pending  },
        { label: 'In Review', color: '#6366F1', count: review   },
        { label: 'Approved',  color: '#10B981', count: approved },
        { label: 'Rejected',  color: '#EF4444', count: rejected },
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
