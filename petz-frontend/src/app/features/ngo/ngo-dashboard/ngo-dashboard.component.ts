import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-ngo-dashboard',
  template: `
    <div class="dash-root">

      <!-- ── Header ─────────────────────────────────────────── -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">NGO Dashboard</h1>
          <p class="dash-sub">Manage your rescue operations and adoption listings</p>
        </div>
        @if (ngo) {
          <div class="ngo-badge" [class.verified]="ngo.isVerified" [class.unverified]="!ngo.isVerified">
            <mat-icon>{{ ngo.isVerified ? 'verified' : 'schedule' }}</mat-icon>
            <span>{{ ngo.isVerified ? 'Verified NGO' : 'Pending Verification' }}</span>
          </div>
        }
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Loading dashboard…</span>
        </div>
      }

      @if (!loading) {

        <!-- ── Critical Alert ──────────────────────────────── -->
        @if (criticalRescues > 0) {
          <div class="alert-bar" routerLink="/ngo/rescues">
            <div class="alert-dot"></div>
            <mat-icon class="alert-icon">warning_amber</mat-icon>
            <span><strong>{{ criticalRescues }} critical rescue{{ criticalRescues > 1 ? 's' : '' }}</strong> need{{ criticalRescues === 1 ? 's' : '' }} immediate attention</span>
            <span class="alert-cta">View Queue <mat-icon style="font-size:13px;width:13px;height:13px;vertical-align:middle">arrow_forward</mat-icon></span>
          </div>
        }

        <!-- ── NGO Profile Card ────────────────────────────── -->
        @if (ngo) {
          <div class="profile-card">
            <div class="profile-avatar">
              @if (ngo.logoUrl) {
                <img [src]="ngo.logoUrl" [alt]="ngo.name" class="profile-logo">
              } @else {
                <mat-icon>business</mat-icon>
              }
            </div>
            <div class="profile-info">
              <div class="profile-name">{{ ngo.name }}</div>
              <div class="profile-meta">
                @if (ngo.city)    { <span><mat-icon>place</mat-icon>{{ ngo.city }}</span> }
                @if (ngo.phone)   { <span><mat-icon>phone</mat-icon>{{ ngo.phone }}</span> }
                @if (ngo.email)   { <span><mat-icon>email</mat-icon>{{ ngo.email }}</span> }
                @if (ngo.address) { <span><mat-icon>home</mat-icon>{{ ngo.address }}</span> }
              </div>
            </div>
            <div class="profile-right">
              @if (ngo.isVerified) {
                <div class="verify-pill verified-pill">
                  <mat-icon>verified</mat-icon> VERIFIED
                </div>
              } @else {
                <div class="verify-pill pending-pill">
                  <mat-icon>schedule</mat-icon> PENDING
                </div>
              }
            </div>
          </div>
        }

        <!-- ── KPI Strip ───────────────────────────────────── -->
        <div class="kpi-strip">

          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#F0A85A,#E89340)">
              <mat-icon>pets</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ animals.length }}</div>
              <div class="kpi-lbl">Animals Listed</div>
              <div class="kpi-sub"><span class="dot da"></span>{{ animals.length }} available</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#E89340;width:100%"></div></div>
            </div>
          </div>

          <div class="kpi-div"></div>

          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#E87070,#E05858)">
              <mat-icon>emergency</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ rescues.length }}</div>
              <div class="kpi-lbl">Total Rescues</div>
              <div class="kpi-sub"><span class="dot dr"></span>{{ activeRescues }} active<span class="sep">·</span><span class="dot dg"></span>{{ completedRescues }} done</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#E05858" [style.width.%]="pct(activeRescues, rescues.length)"></div></div>
            </div>
          </div>

          <div class="kpi-div"></div>

          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#9B82E0,#7C62CC)">
              <mat-icon>assignment</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ applications.length }}</div>
              <div class="kpi-lbl">Applications</div>
              <div class="kpi-sub"><span class="dot dp"></span>{{ pendingApps }} pending<span class="sep">·</span><span class="dot dg"></span>{{ approvedApps }} approved</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#7C62CC" [style.width.%]="pct(pendingApps, applications.length)"></div></div>
            </div>
          </div>

          <div class="kpi-div"></div>

          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#50CCA8,#2EB894)">
              <mat-icon>done_all</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ completedRescues }}</div>
              <div class="kpi-lbl">Completed Rescues</div>
              <div class="kpi-sub"><span class="dot dg"></span>{{ pct(completedRescues, rescues.length) }}% success rate</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#2EB894" [style.width.%]="pct(completedRescues, rescues.length)"></div></div>
            </div>
          </div>

        </div>

        <!-- ── Row: Rescue Pipeline + Application Status ────── -->
        <div class="grid-2">

          <!-- Rescue Pipeline Donut -->
          <div class="panel">
            <div class="panel-head">
              <span class="panel-title"><span class="accent-bar red-bar"></span>Rescue Pipeline</span>
              <a routerLink="/ngo/rescues" class="view-link">See Queue →</a>
            </div>
            <div class="donut-layout">
              <div class="donut-wrap">
                <svg width="150" height="150" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="34" fill="none" stroke="#EEF1F5" stroke-width="7"/>
                  @for (s of buildSegs(rescuePipeline, rescues.length); track $index) {
                    <circle cx="46" cy="46" r="34" fill="none" [attr.stroke]="s.color" stroke-width="7"
                            stroke-linecap="butt" transform="rotate(-90 46 46)"
                            [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"/>
                  }
                </svg>
                <div class="donut-center">
                  <div class="donut-total">{{ rescues.length }}</div>
                  <div class="donut-total-lbl">total</div>
                </div>
              </div>
              <div class="donut-legend">
                @for (item of rescuePipeline; track item.label) {
                  <div class="leg-row">
                    <span class="leg-dot" [style.background]="item.color"></span>
                    <span class="leg-name">{{ item.label }}</span>
                    <span class="leg-count">{{ item.count }}</span>
                    <span class="leg-pct">{{ pct(item.count, rescues.length) }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Application Status Donut -->
          <div class="panel">
            <div class="panel-head">
              <span class="panel-title"><span class="accent-bar purple-bar"></span>Application Status</span>
              <a routerLink="/ngo/applications" class="view-link">Review →</a>
            </div>
            <div class="donut-layout">
              <div class="donut-wrap">
                <svg width="150" height="150" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="34" fill="none" stroke="#EEF1F5" stroke-width="7"/>
                  @for (s of buildSegs(appBreakdown, applications.length); track $index) {
                    <circle cx="46" cy="46" r="34" fill="none" [attr.stroke]="s.color" stroke-width="7"
                            stroke-linecap="butt" transform="rotate(-90 46 46)"
                            [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"/>
                  }
                </svg>
                <div class="donut-center">
                  <div class="donut-total">{{ applications.length }}</div>
                  <div class="donut-total-lbl">total</div>
                </div>
              </div>
              <div class="donut-legend">
                @for (item of appBreakdown; track item.label) {
                  <div class="leg-row">
                    <span class="leg-dot" [style.background]="item.color"></span>
                    <span class="leg-name">{{ item.label }}</span>
                    <span class="leg-count">{{ item.count }}</span>
                    <span class="leg-pct">{{ pct(item.count, applications.length) }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>

        <!-- ── Quick Actions ───────────────────────────────── -->
        <div class="section-head-row">
          <h2 class="section-h2">Quick Actions</h2>
        </div>

        <div class="nav-grid">

          <div class="nav-card" routerLink="/ngo/animals">
            <div class="nav-stripe" style="background:#E89340"></div>
            <div class="nav-icon" style="background:#E89340"><mat-icon>pets</mat-icon></div>
            <div class="nav-body">
              <div class="nav-title">Manage Animals</div>
              <div class="nav-desc">List and update animals for adoption</div>
              <div class="nav-chips">
                <span class="nchip amber-chip">{{ animals.length }} listed</span>
              </div>
            </div>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>

          <div class="nav-card" routerLink="/ngo/rescues">
            <div class="nav-stripe" style="background:#E05858"></div>
            <div class="nav-icon" style="background:#E05858"><mat-icon>emergency</mat-icon></div>
            <div class="nav-body">
              <div class="nav-title">Rescue Queue</div>
              <div class="nav-desc">View and handle incoming rescue reports</div>
              <div class="nav-chips">
                <span class="nchip rose-chip">{{ activeRescues }} active</span>
                @if (criticalRescues > 0) {
                  <span class="nchip crit-chip">{{ criticalRescues }} critical</span>
                }
              </div>
            </div>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>

          <div class="nav-card" routerLink="/ngo/applications">
            <div class="nav-stripe" style="background:#7C62CC"></div>
            <div class="nav-icon" style="background:#7C62CC"><mat-icon>assignment</mat-icon></div>
            <div class="nav-body">
              <div class="nav-title">Adoption Applications</div>
              <div class="nav-desc">Review and approve adoption requests</div>
              <div class="nav-chips">
                <span class="nchip purple-chip">{{ pendingApps }} pending</span>
                <span class="nchip sage-chip">{{ approvedApps }} approved</span>
              </div>
            </div>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>

        </div>

      }
    </div>
  `,
  styles: [`
    /* ── Layout ───────────────────────────────────────── */
    .dash-root   { padding: 0; }
    .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
    .dash-title  { font-size: 1.6rem; font-weight: 900; color: #1E2D3D; margin: 0; letter-spacing: -0.02em; }
    .dash-sub    { font-size: 0.82rem; color: #94A3B8; margin: 3px 0 0; }

    .ngo-badge {
      display: flex; align-items: center; gap: 6px;
      border-radius: 999px; padding: 7px 16px; font-size: 0.75rem; font-weight: 700;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }
    .verified   { background: #D8F5EE; color: #1A7A5E; }
    .unverified { background: #FEF9C3; color: #854D0E; }

    .loading-state { display: flex; align-items: center; gap: 12px; padding: 40px 0; color: #94A3B8; font-size: 0.85rem; }

    /* ── Alert Bar ────────────────────────────────────── */
    .alert-bar {
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #6B1A1A 0%, #C03030 100%);
      color: #FFF0F0; border-radius: 14px; padding: 13px 20px; margin-bottom: 20px;
      cursor: pointer; font-size: 0.83rem; font-weight: 600;
      box-shadow: 0 4px 16px rgba(224,88,88,0.28);
    }
    .alert-dot  { width: 7px; height: 7px; border-radius: 50%; background: #FFF0F0; flex-shrink: 0; animation: blink 1.4s ease-in-out infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .alert-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; opacity: 0.85; }
    .alert-cta  { margin-left: auto; font-size: 0.73rem; opacity: 0.75; white-space: nowrap; }

    /* ── NGO Profile Card ─────────────────────────────── */
    .profile-card {
      display: flex; align-items: center; gap: 18px;
      background: #fff; border-radius: 20px;
      box-shadow: 0 1px 12px rgba(26,53,71,0.07);
      padding: 20px 24px; margin-bottom: 20px;
      border-left: 4px solid #E89340;
    }
    .profile-avatar {
      width: 64px; height: 64px; border-radius: 18px; flex-shrink: 0;
      background: linear-gradient(135deg, #FF9F5A, #E89340);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      box-shadow: 0 4px 14px rgba(232,147,64,0.35);
      mat-icon { color: #fff; font-size: 30px; width: 30px; height: 30px; }
    }
    .profile-logo { width: 100%; height: 100%; object-fit: cover; }
    .profile-info { flex: 1; }
    .profile-name { font-weight: 900; font-size: 1.1rem; color: #1A3547; margin-bottom: 8px; letter-spacing: -0.01em; }
    .profile-meta {
      display: flex; gap: 14px; flex-wrap: wrap;
      span { display: flex; align-items: center; gap: 3px; font-size: 0.78rem; color: #4A6478; }
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: #E89340; }
    }
    .profile-right { flex-shrink: 0; }
    .verify-pill {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 14px; border-radius: 999px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.07em;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .verified-pill { background: #D8F5EE; color: #1A7A5E; }
    .pending-pill  { background: #FEF9C3; color: #854D0E; }

    /* ── KPI Strip ────────────────────────────────────── */
    .kpi-strip {
      display: flex; align-items: center; background: #fff; border-radius: 20px;
      box-shadow: 0 1px 12px rgba(30,45,61,0.06); padding: 18px 24px; margin-bottom: 20px;
      gap: 0; flex-wrap: wrap;
    }
    .kpi-item {
      flex: 1; min-width: 130px; display: flex; align-items: center; gap: 12px;
      padding: 4px 14px; border-radius: 12px; cursor: default; transition: background 0.2s;
      &:first-child { padding-left: 0; }
      &:last-child  { padding-right: 0; }
      &:hover { background: #F8F9FB; }
    }
    .kpi-div { width: 1px; height: 40px; background: #E8EDF3; flex-shrink: 0; }

    .kpi-icon-box {
      width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      mat-icon { font-size: 22px; width: 22px; height: 22px; color: #fff; }
    }
    .kpi-text  { flex: 1; min-width: 0; }
    .kpi-num   { font-size: 1.55rem; font-weight: 900; color: #1E2D3D; line-height: 1; letter-spacing: -0.03em; }
    .kpi-lbl   { font-size: 0.6rem; color: #94A3B8; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin: 3px 0 4px; }
    .kpi-sub   { display: flex; align-items: center; gap: 4px; font-size: 0.67rem; font-weight: 600; color: #64748B; flex-wrap: wrap; }
    .kpi-bar-track {
      height: 3px; background: #EEF1F5; border-radius: 999px; margin-top: 6px; overflow: hidden;
    }
    .kpi-bar-fill {
      height: 100%; border-radius: 999px; min-width: 3px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
    .dg  { background: #2EB894; }
    .dr  { background: #E05858; }
    .da  { background: #E89340; }
    .dp  { background: #7C62CC; }
    .sep { color: #D8E2EA; margin: 0 2px; }

    /* ── Panels ───────────────────────────────────────── */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; @media(max-width:860px){ grid-template-columns:1fr; } }
    .panel  { background: #fff; border-radius: 20px; box-shadow: 0 1px 12px rgba(30,45,61,0.06); padding: 22px 24px; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .panel-title { font-size: 0.88rem; font-weight: 800; color: #1E2D3D; display: flex; align-items: center; gap: 8px; }

    .accent-bar   { width: 3px; height: 14px; border-radius: 2px; flex-shrink: 0; }
    .red-bar      { background: #E05858; }
    .purple-bar   { background: #7C62CC; }

    .view-link { font-size: 0.72rem; font-weight: 700; color: #4F8FD4; text-decoration: none; cursor: pointer; &:hover { color: #3A72B0; } }

    /* ── Donut ────────────────────────────────────────── */
    .donut-layout { display: flex; align-items: center; gap: 24px; }
    .donut-wrap   { position: relative; flex-shrink: 0; width: 150px; height: 150px; transition: transform 0.2s; &:hover { transform: scale(1.03); } }
    .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; pointer-events: none; }
    .donut-total     { font-size: 1.75rem; font-weight: 900; color: #1E2D3D; line-height: 1; letter-spacing: -0.03em; }
    .donut-total-lbl { font-size: 0.6rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.07em; }

    .donut-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .leg-row  { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 8px; transition: background 0.15s; cursor: default; &:hover { background: #F8F9FB; } }
    .leg-dot  { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
    .leg-name { flex: 1; font-size: 0.78rem; font-weight: 600; color: #64748B; }
    .leg-count{ font-size: 0.85rem; font-weight: 800; color: #1E2D3D; min-width: 20px; text-align: right; }
    .leg-pct  { font-size: 0.7rem; font-weight: 600; color: #A8B8C8; min-width: 34px; text-align: right; }

    /* ── Nav Cards ────────────────────────────────────── */
    .section-head-row { margin-bottom: 14px; }
    .section-h2 { font-size: 0.95rem; font-weight: 800; color: #1E2D3D; margin: 0; letter-spacing: -0.01em; }

    .nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; padding-bottom: 8px; }
    .nav-card {
      display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 18px;
      box-shadow: 0 1px 10px rgba(30,45,61,0.06); padding: 18px 18px 18px 0;
      cursor: pointer; position: relative; overflow: hidden; transition: box-shadow 0.22s, transform 0.22s;
      &:hover {
        box-shadow: 0 6px 22px rgba(30,45,61,0.1); transform: translateY(-2px);
        .nav-stripe { width: 5px; }
        .nav-icon   { filter: brightness(1.1); transform: scale(1.07); }
        .nav-arrow  { transform: translateX(4px); color: #4F8FD4 !important; }
      }
    }
    .nav-stripe { width: 3px; height: 100%; position: absolute; left: 0; top: 0; transition: width 0.2s; }
    .nav-icon   { width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0; margin-left: 18px; display: flex; align-items: center; justify-content: center; transition: transform 0.22s, filter 0.22s; mat-icon { font-size: 20px; width: 20px; height: 20px; color: #fff; } }
    .nav-body  { flex: 1; }
    .nav-title { font-weight: 800; font-size: 0.88rem; color: #1E2D3D; margin-bottom: 2px; }
    .nav-desc  { font-size: 0.73rem; color: #94A3B8; margin-bottom: 8px; line-height: 1.4; }
    .nav-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .nav-arrow { color: #CBD8E4 !important; font-size: 20px !important; flex-shrink: 0; transition: transform 0.22s, color 0.22s; }

    .nchip       { font-size: 0.63rem; font-weight: 700; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em; }
    .amber-chip  { background: #FFF0DC; color: #A06020; }
    .rose-chip   { background: #FCE8E8; color: #B82828; }
    .crit-chip   { background: #FEE2E2; color: #991B1B; }
    .purple-chip { background: #EDE9FE; color: #5B21B6; }
    .sage-chip   { background: #D8F5EE; color: #1A7A5E; }
  `]
})
export class NgoDashboardComponent implements OnInit {
  ngo:          any   = null;
  animals:      any[] = [];
  rescues:      any[] = [];
  applications: any[] = [];
  loading = true;

  readonly CIRC = 213.63;

  /* ── Computed counts ──────────────────────────────── */
  // Rescue: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, RESOLVED, CANCELLED
  get pendingRescues()   { return this.rescues.filter(r => r.status === 'PENDING').length; }
  get activeRescues()    { return this.rescues.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length; }
  get completedRescues() { return this.rescues.filter(r => r.status === 'COMPLETED' || r.status === 'RESOLVED').length; }
  get cancelledRescues() { return this.rescues.filter(r => r.status === 'CANCELLED').length; }
  get criticalRescues()  { return this.rescues.filter(r => r.criticality === 'CRITICAL' && (r.status === 'PENDING' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS')).length; }
  // Adoption: PENDING, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
  get pendingApps()      { return this.applications.filter(a => a.status === 'PENDING').length; }
  get reviewApps()       { return this.applications.filter(a => a.status === 'UNDER_REVIEW').length; }
  get approvedApps()     { return this.applications.filter(a => a.status === 'APPROVED').length; }
  get rejectedApps()     { return this.applications.filter(a => a.status === 'REJECTED').length; }
  get withdrawnApps()    { return this.applications.filter(a => a.status === 'WITHDRAWN').length; }

  /* ── Chart data ───────────────────────────────────── */
  get rescuePipeline() {
    const base = [
      { label: 'Pending',     count: this.pendingRescues,                                              color: '#E89340' },
      { label: 'Assigned',    count: this.rescues.filter(r => r.status === 'ASSIGNED').length,         color: '#4F8FD4' },
      { label: 'In Progress', count: this.rescues.filter(r => r.status === 'IN_PROGRESS').length,      color: '#7C62CC' },
      { label: 'Resolved',    count: this.completedRescues,                                             color: '#2EB894' },
    ];
    // Show Cancelled only if data exists — avoids cluttering legend when 0
    if (this.cancelledRescues > 0) {
      base.push({ label: 'Cancelled', count: this.cancelledRescues, color: '#94A3B8' });
    }
    return base;
  }

  get appBreakdown() {
    const base = [
      { label: 'Pending',   count: this.pendingApps,  color: '#7C62CC' },
      { label: 'In Review', count: this.reviewApps,   color: '#4F8FD4' },
      { label: 'Approved',  count: this.approvedApps, color: '#2EB894' },
      { label: 'Rejected',  count: this.rejectedApps, color: '#E05858' },
    ];
    if (this.withdrawnApps > 0) {
      base.push({ label: 'Withdrawn', count: this.withdrawnApps, color: '#94A3B8' });
    }
    return base;
  }

  /* ── SVG helpers ──────────────────────────────────── */
  gaugeDash(active: number, total: number): string {
    const C = 113.1;
    if (!total) return `0 ${C}`;
    return `${(active / total) * C} ${C}`;
  }

  gaugeFull(): string { return `${113.1} 0`; }

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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      ngo:          this.api.get<any>('/ngo/profile').pipe(catchError(() => of({ data: null }))),
      animals:      this.api.get<any>('/adoption/ngo/animals').pipe(catchError(() => of({ data: [] }))),
      rescues:      this.api.get<any>('/rescue/ngo').pipe(catchError(() => of({ data: [] }))),
      applications: this.api.get<any>('/adoption/ngo/applications').pipe(catchError(() => of({ data: [] }))),
    }).subscribe(results => {
      this.ngo          = results.ngo.data          ?? null;
      this.animals      = results.animals.data      ?? [];
      this.rescues      = results.rescues.data      ?? [];
      this.applications = results.applications.data ?? [];
      this.loading      = false;
    });
  }
}
