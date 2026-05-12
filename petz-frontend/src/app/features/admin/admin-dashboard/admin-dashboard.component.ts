import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

/* ── Medium-bright palette ────────────────────────────────────
   Users     : #4F8FD4  clear blue
   NGOs      : #7C62CC  medium indigo
   Rescues   : #E05858  clear red
   Hospitals : #2EB894  medium teal
   Adoptions : #E89340  warm amber
   ────────────────────────────────────────────────────────── */

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  template: `
    <div class="dash-root">

      <!-- ── Header ───────────────────────────────────────── -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Admin Panel</h1>
          <p class="dash-sub">Platform management and oversight</p>
        </div>
        <div class="admin-badge">
          <mat-icon>verified_user</mat-icon>
          <span>Administrator</span>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Loading platform data…</span>
        </div>
      }

      @if (!loading) {

        <!-- ── Critical Alert ──────────────────────────────── -->
        @if (criticalPending > 0) {
          <div class="alert-bar" routerLink="/admin/rescues">
            <div class="alert-dot"></div>
            <mat-icon class="alert-icon">warning_amber</mat-icon>
            <span><strong>{{ criticalPending }} critical rescue{{ criticalPending > 1 ? 's' : '' }}</strong> need{{ criticalPending === 1 ? 's' : '' }} immediate attention</span>
            <span class="alert-cta">View now <mat-icon style="font-size:13px;width:13px;height:13px;vertical-align:middle">arrow_forward</mat-icon></span>
          </div>
        }

        <!-- ── KPI Strip ───────────────────────────────────── -->
        <div class="kpi-strip">

          <!-- Users -->
          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#6BAEE8,#4F8FD4)">
              <mat-icon>people</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ users.length }}</div>
              <div class="kpi-lbl">Total Users</div>
              <div class="kpi-sub"><span class="dot dg"></span>{{ activeUsers }} active<span class="sep">·</span><span class="dot dr"></span>{{ inactiveUsers }} inactive</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#4F8FD4" [style.width.%]="pct(activeUsers, users.length)"></div></div>
            </div>
          </div>

          <div class="kpi-div"></div>

          <!-- NGOs -->
          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#9B82E0,#7C62CC)">
              <mat-icon>business</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ ngos.length }}</div>
              <div class="kpi-lbl">Registered NGOs</div>
              <div class="kpi-sub"><span class="dot dg"></span>{{ verifiedNgos }} verified<span class="sep">·</span><span class="dot da"></span>{{ unverifiedNgos }} pending</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#7C62CC" [style.width.%]="pct(verifiedNgos, ngos.length)"></div></div>
            </div>
          </div>

          <div class="kpi-div"></div>

          <!-- Rescues -->
          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#E87070,#E05858)">
              <mat-icon>emergency</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ rescues.length }}</div>
              <div class="kpi-lbl">Total Rescues</div>
              <div class="kpi-sub"><span class="dot da"></span>{{ pendingRescues }} pending<span class="sep">·</span><span class="dot dg"></span>{{ completedRescues }} resolved</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#E05858" [style.width.%]="pct(completedRescues, rescues.length)"></div></div>
            </div>
          </div>

          <div class="kpi-div"></div>

          <!-- Hospitals -->
          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#50CCA8,#2EB894)">
              <mat-icon>local_hospital</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ hospitals.length }}</div>
              <div class="kpi-lbl">Hospitals</div>
              <div class="kpi-sub"><span class="dot dg"></span>{{ activeHospitals }} active<span class="sep">·</span><span class="dot dr"></span>{{ inactiveHospitals }} inactive</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#2EB894" [style.width.%]="pct(activeHospitals, hospitals.length)"></div></div>
            </div>
          </div>

          <div class="kpi-div"></div>

          <!-- Adoptions -->
          <div class="kpi-item">
            <div class="kpi-icon-box" style="background:linear-gradient(135deg,#F0A85A,#E89340)">
              <mat-icon>pets</mat-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-num">{{ adoptions.length }}</div>
              <div class="kpi-lbl">Adoptions</div>
              <div class="kpi-sub"><span class="dot da"></span>{{ pendingAdoptions }} pending<span class="sep">·</span><span class="dot dg"></span>{{ approvedAdoptions }} approved</div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#E89340" [style.width.%]="pct(approvedAdoptions, adoptions.length)"></div></div>
            </div>
          </div>

        </div>

        <!-- ── Row 2: Pipeline + Urgency ──────────────────── -->
        <div class="grid-2">

          <div class="panel">
            <div class="panel-head">
              <span class="panel-title"><span class="accent-bar rose-bar"></span>Rescue Pipeline</span>
              <a routerLink="/admin/rescues" class="view-link">See All →</a>
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

          <div class="panel">
            <div class="panel-head">
              <span class="panel-title"><span class="accent-bar rose-bar"></span>Urgency Breakdown</span>
            </div>
            <div class="donut-layout">
              <div class="donut-wrap">
                <svg width="150" height="150" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="34" fill="none" stroke="#EEF1F5" stroke-width="7"/>
                  @for (s of buildSegs(urgencyBreakdown, rescues.length); track $index) {
                    <circle cx="46" cy="46" r="34" fill="none" [attr.stroke]="s.color" stroke-width="7"
                            stroke-linecap="butt" transform="rotate(-90 46 46)"
                            [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"/>
                  }
                </svg>
                <div class="donut-center">
                  <div class="donut-total">{{ rescues.length }}</div>
                  <div class="donut-total-lbl">rescues</div>
                </div>
              </div>
              <div class="donut-legend">
                @for (item of urgencyBreakdown; track item.label) {
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

        </div>

        <!-- ── Row 3: Roles + NGO ──────────────────────────── -->
        <div class="grid-2">

          <div class="panel">
            <div class="panel-head">
              <span class="panel-title"><span class="accent-bar slate-bar"></span>User Roles</span>
              <a routerLink="/admin/users" class="view-link">Manage →</a>
            </div>
            <div class="donut-layout">
              <div class="donut-wrap">
                <svg width="150" height="150" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="34" fill="none" stroke="#EEF1F5" stroke-width="7"/>
                  @for (s of buildSegs(roleDistribution, users.length); track $index) {
                    <circle cx="46" cy="46" r="34" fill="none" [attr.stroke]="s.color" stroke-width="7"
                            stroke-linecap="butt" transform="rotate(-90 46 46)"
                            [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"/>
                  }
                </svg>
                <div class="donut-center">
                  <div class="donut-total">{{ users.length }}</div>
                  <div class="donut-total-lbl">users</div>
                </div>
              </div>
              <div class="donut-legend">
                @for (item of roleDistribution; track item.label) {
                  <div class="leg-row">
                    <span class="leg-dot" [style.background]="item.color"></span>
                    <span class="leg-name">{{ item.label }}</span>
                    <span class="leg-count">{{ item.count }}</span>
                    <span class="leg-pct">{{ pct(item.count, users.length) }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <span class="panel-title"><span class="accent-bar lavender-bar"></span>NGO Health</span>
              <a routerLink="/admin/ngos" class="view-link">Manage →</a>
            </div>
            <div class="donut-layout">
              <div class="donut-wrap">
                <svg width="150" height="150" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="34" fill="none" stroke="#EEF1F5" stroke-width="7"/>
                  @for (s of buildSegs(ngoBreakdown, ngos.length); track $index) {
                    <circle cx="46" cy="46" r="34" fill="none" [attr.stroke]="s.color" stroke-width="7"
                            stroke-linecap="butt" transform="rotate(-90 46 46)"
                            [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"/>
                  }
                </svg>
                <div class="donut-center">
                  <div class="donut-total">{{ ngos.length }}</div>
                  <div class="donut-total-lbl">NGOs</div>
                </div>
              </div>
              <div class="donut-legend">
                @for (item of ngoBreakdown; track item.label) {
                  <div class="leg-row">
                    <span class="leg-dot" [style.background]="item.color"></span>
                    <span class="leg-name">{{ item.label }}</span>
                    <span class="leg-count">{{ item.count }}</span>
                    <span class="leg-pct">{{ pct(item.count, ngos.length) }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>

        <!-- ── Row 4: Adoptions ────────────────────────────── -->
        <div class="panel" style="margin-bottom:28px">
          <div class="panel-head">
            <span class="panel-title"><span class="accent-bar steel-bar"></span>Adoption Pipeline</span>
          </div>
          <div class="donut-layout">
            <div class="donut-wrap">
              <svg width="150" height="150" viewBox="0 0 92 92">
                <circle cx="46" cy="46" r="34" fill="none" stroke="#EEF1F5" stroke-width="7"/>
                @for (s of buildSegs(adoptionSegments, adoptions.length); track $index) {
                  <circle cx="46" cy="46" r="34" fill="none" [attr.stroke]="s.color" stroke-width="7"
                          stroke-linecap="butt" transform="rotate(-90 46 46)"
                          [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"/>
                }
              </svg>
              <div class="donut-center">
                <div class="donut-total">{{ adoptions.length }}</div>
                <div class="donut-total-lbl">total</div>
              </div>
            </div>
            <div class="donut-legend donut-legend-horiz">
              @for (item of adoptionSegments; track item.label) {
                <div class="leg-row leg-row-wide">
                  <span class="leg-dot" [style.background]="item.color"></span>
                  <span class="leg-name">{{ item.label }}</span>
                  <span class="leg-count">{{ item.count }}</span>
                  <span class="leg-pct">{{ pct(item.count, adoptions.length) }}%</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── Navigation Cards ────────────────────────────── -->
        <div class="section-head-row">
          <h2 class="section-h2">Platform Management</h2>
        </div>

        <div class="nav-grid">

          <div class="nav-card" routerLink="/admin/users">
            <div class="nav-stripe" style="background:#4F8FD4"></div>
            <div class="nav-icon" style="background:#4F8FD4"><mat-icon>people</mat-icon></div>
            <div class="nav-body">
              <div class="nav-title">User Management</div>
              <div class="nav-desc">View, activate or deactivate user accounts</div>
              <div class="nav-chips">
                <span class="nchip sage-chip">{{ activeUsers }} active</span>
                <span class="nchip rose-chip">{{ inactiveUsers }} inactive</span>
              </div>
            </div>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>

          <div class="nav-card" routerLink="/admin/ngos">
            <div class="nav-stripe" style="background:#7C62CC"></div>
            <div class="nav-icon" style="background:#7C62CC"><mat-icon>business</mat-icon></div>
            <div class="nav-body">
              <div class="nav-title">NGO Management</div>
              <div class="nav-desc">Create and manage rescue organisations</div>
              <div class="nav-chips">
                <span class="nchip sage-chip">{{ verifiedNgos }} verified</span>
                <span class="nchip sand-chip">{{ unverifiedNgos }} pending</span>
              </div>
            </div>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>

          <div class="nav-card" routerLink="/admin/rescues">
            <div class="nav-stripe" style="background:#E05858"></div>
            <div class="nav-icon" style="background:#E05858"><mat-icon>emergency</mat-icon></div>
            <div class="nav-body">
              <div class="nav-title">Rescue Oversight</div>
              <div class="nav-desc">Monitor all platform rescue reports</div>
              <div class="nav-chips">
                <span class="nchip sand-chip">{{ pendingRescues }} pending</span>
                @if (criticalPending > 0) {
                  <span class="nchip rose-chip">{{ criticalPending }} critical</span>
                }
              </div>
            </div>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>

          <div class="nav-card" routerLink="/admin/hospitals">
            <div class="nav-stripe" style="background:#2EB894"></div>
            <div class="nav-icon" style="background:#2EB894"><mat-icon>local_hospital</mat-icon></div>
            <div class="nav-body">
              <div class="nav-title">Hospital Management</div>
              <div class="nav-desc">View and manage registered hospitals</div>
              <div class="nav-chips">
                <span class="nchip sage-chip">{{ activeHospitals }} active</span>
                @if (inactiveHospitals > 0) {
                  <span class="nchip rose-chip">{{ inactiveHospitals }} inactive</span>
                }
              </div>
            </div>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>

        </div>

      }
    </div>
  `,
  styles: [`
    .dash-root { padding:0; }
    .dash-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
    .dash-title { font-size:1.6rem; font-weight:900; color:#1E2D3D; margin:0; letter-spacing:-0.02em; }
    .dash-sub   { font-size:0.82rem; color:#94A3B8; margin:3px 0 0; }

    .admin-badge {
      display:flex; align-items:center; gap:6px;
      background:#EBE6F8; color:#5A3FB0;
      border-radius:999px; padding:7px 16px; font-size:0.75rem; font-weight:700;
      mat-icon { font-size:15px; width:15px; height:15px; }
    }

    /* ── Alert ─────────────────────────── */
    .alert-bar {
      display:flex; align-items:center; gap:10px;
      background: linear-gradient(135deg, #6B1A1A 0%, #C03030 100%);
      color:#FFF0F0; border-radius:14px; padding:13px 20px; margin-bottom:20px;
      cursor:pointer; font-size:0.83rem; font-weight:600;
      box-shadow:0 4px 16px rgba(224,88,88,0.28);
    }
    .alert-dot  { width:7px; height:7px; border-radius:50%; background:#F5E8E8; flex-shrink:0; animation:blink 1.4s ease-in-out infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .alert-icon { font-size:18px !important; width:18px !important; height:18px !important; opacity:0.85; }
    .alert-cta  { margin-left:auto; font-size:0.73rem; opacity:0.75; white-space:nowrap; }

    /* ── KPI Strip ─────────────────────── */
    .kpi-strip {
      display:flex; align-items:center; background:#fff; border-radius:20px;
      box-shadow:0 1px 12px rgba(30,45,61,0.06); padding:18px 24px; margin-bottom:20px;
      gap:0; flex-wrap:wrap;
    }
    .kpi-item {
      flex:1; min-width:130px; display:flex; align-items:center; gap:12px;
      padding:4px 14px; border-radius:12px; cursor:default; transition:background 0.2s;
      &:first-child { padding-left:0; }
      &:last-child  { padding-right:0; }
      &:hover { background:#F8F9FB; }
    }
    .kpi-div { width:1px; height:40px; background:#E8EDF3; flex-shrink:0; }

    .kpi-icon-box {
      width:46px; height:46px; border-radius:14px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
      mat-icon { font-size:22px; width:22px; height:22px; color:#fff; }
    }
    .kpi-text  { flex:1; min-width:0; }
    .kpi-num   { font-size:1.55rem; font-weight:900; color:#1E2D3D; line-height:1; letter-spacing:-0.03em; }
    .kpi-lbl   { font-size:0.6rem; color:#94A3B8; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; margin:3px 0 4px; }
    .kpi-sub   { display:flex; align-items:center; gap:4px; font-size:0.67rem; font-weight:600; color:#64748B; flex-wrap:wrap; }
    .kpi-bar-track {
      height:3px; background:#EEF1F5; border-radius:999px; margin-top:6px; overflow:hidden;
    }
    .kpi-bar-fill {
      height:100%; border-radius:999px; transition:width 0.6s cubic-bezier(0.4,0,0.2,1);
      min-width:3px;
    }

    .dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; display:inline-block; }
    .dg  { background:#2EB894; }
    .dr  { background:#E05858; }
    .da  { background:#E89340; }

    .sep { color:#D8E2EA; margin:0 2px; }

    /* ── Panels ─────────────────────────── */
    .grid-2 {
      display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;
      @media(max-width:860px){ grid-template-columns:1fr; }
    }
    .panel { background:#fff; border-radius:20px; box-shadow:0 1px 12px rgba(30,45,61,0.06); padding:22px 24px; }
    .panel-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .panel-title { font-size:0.88rem; font-weight:800; color:#1E2D3D; display:flex; align-items:center; gap:8px; }

    .accent-bar    { width:3px; height:14px; border-radius:2px; flex-shrink:0; }
    .rose-bar      { background:#E05858; }
    .slate-bar     { background:#4F8FD4; }
    .lavender-bar  { background:#7C62CC; }
    .steel-bar     { background:#E89340; }

    .view-link { font-size:0.72rem; font-weight:700; color:#4F8FD4; text-decoration:none; cursor:pointer; &:hover{color:#3A72B0;} }

    /* ── Donut layout ───────────────────── */
    .donut-layout { display:flex; align-items:center; gap:24px; }
    .donut-wrap {
      position:relative; flex-shrink:0; width:150px; height:150px;
      transition:transform 0.2s; &:hover { transform:scale(1.03); }
    }
    .donut-center {
      position:absolute; inset:0; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:1px; pointer-events:none;
    }
    .donut-total     { font-size:1.75rem; font-weight:900; color:#1E2D3D; line-height:1; letter-spacing:-0.03em; }
    .donut-total-lbl { font-size:0.6rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.07em; }

    /* ── Legend ─────────────────────────── */
    .donut-legend { flex:1; display:flex; flex-direction:column; gap:8px; }
    .donut-legend-horiz { flex-direction:row; flex-wrap:wrap; gap:10px 24px; align-items:center; }
    .leg-row {
      display:flex; align-items:center; gap:8px; padding:5px 8px;
      border-radius:8px; transition:background 0.15s; cursor:default;
      &:hover { background:#F8F9FB; }
    }
    .leg-row-wide { min-width:130px; }
    .leg-dot   { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
    .leg-name  { flex:1; font-size:0.78rem; font-weight:600; color:#64748B; }
    .leg-count { font-size:0.85rem; font-weight:800; color:#1E2D3D; min-width:20px; text-align:right; }
    .leg-pct   { font-size:0.7rem; font-weight:600; color:#A8B8C8; min-width:34px; text-align:right; }

    /* ── Nav cards ──────────────────────── */
    .section-head-row { margin-bottom:14px; }
    .section-h2 { font-size:0.95rem; font-weight:800; color:#1E2D3D; margin:0; letter-spacing:-0.01em; }

    .nav-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
    .nav-card {
      display:flex; align-items:center; gap:16px; background:#fff; border-radius:18px;
      box-shadow:0 1px 10px rgba(30,45,61,0.06); padding:18px 18px 18px 0;
      cursor:pointer; position:relative; overflow:hidden; transition:box-shadow 0.22s, transform 0.22s;
      &:hover {
        box-shadow:0 6px 22px rgba(30,45,61,0.1); transform:translateY(-2px);
        .nav-stripe { width:5px; }
        .nav-icon   { filter:brightness(1.1); transform:scale(1.07); }
        .nav-arrow  { transform:translateX(4px); color:#4F8FD4 !important; }

      }
    }
    .nav-stripe { width:3px; height:100%; position:absolute; left:0; top:0; transition:width 0.2s; }
    .nav-icon {
      width:44px; height:44px; border-radius:13px; flex-shrink:0; margin-left:18px;
      display:flex; align-items:center; justify-content:center; transition:transform 0.22s, filter 0.22s;
      mat-icon { font-size:20px; width:20px; height:20px; color:#fff; }
    }
    .nav-body  { flex:1; }
    .nav-title { font-weight:800; font-size:0.88rem; color:#1E2D3D; margin-bottom:2px; }
    .nav-desc  { font-size:0.73rem; color:#94A3B8; margin-bottom:8px; line-height:1.4; }
    .nav-chips { display:flex; gap:6px; flex-wrap:wrap; }
    .nav-arrow { color:#CBD8E4 !important; font-size:20px !important; flex-shrink:0; transition:transform 0.22s, color 0.22s; }

    .nchip     { font-size:0.63rem; font-weight:700; padding:3px 8px; border-radius:999px; text-transform:uppercase; letter-spacing:0.04em; }
    .sage-chip { background:#D8F5EE; color:#1A7A5E; }
    .rose-chip { background:#FCE8E8; color:#B82828; }
    .sand-chip { background:#FEF0DC; color:#A06020; }
  `]
})
export class AdminDashboardComponent implements OnInit {

  loading = true;
  users: any[]     = [];
  ngos: any[]      = [];
  rescues: any[]   = [];
  hospitals: any[] = [];
  adoptions: any[] = [];

  readonly CIRC = 213.63;

  gaugeDash(active: number, total: number): string {
    const C = 113.1; // 2 * π * 18
    if (!total) return `0 ${C}`;
    return `${(active / total) * C} ${C}`;
  }

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

  /* ── Counts ─────────────────────────── */
  get activeUsers()       { return this.users.filter(u => u.isActive !== false).length; }
  get inactiveUsers()     { return this.users.filter(u => u.isActive === false).length; }
  get verifiedNgos()      { return this.ngos.filter(n => n.isVerified).length; }
  get unverifiedNgos()    { return this.ngos.filter(n => !n.isVerified).length; }
  get activeNgos()        { return this.ngos.filter(n => n.isActive !== false).length; }
  get inactiveNgos()      { return this.ngos.filter(n => n.isActive === false).length; }
  // Rescue: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, RESOLVED, CANCELLED
  get pendingRescues()    { return this.rescues.filter(r => r.status === 'PENDING').length; }
  get assignedRescues()   { return this.rescues.filter(r => r.status === 'ASSIGNED').length; }
  get inProgressRescues() { return this.rescues.filter(r => r.status === 'IN_PROGRESS').length; }
  get completedRescues()  { return this.rescues.filter(r => r.status === 'COMPLETED' || r.status === 'RESOLVED').length; }
  get cancelledRescues()  { return this.rescues.filter(r => r.status === 'CANCELLED').length; }
  get criticalPending()   {
    return this.rescues.filter(r =>
      r.criticality === 'CRITICAL' &&
      (r.status === 'PENDING' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS')
    ).length;
  }
  get activeHospitals()     { return this.hospitals.filter(h => h.isActive !== false).length; }
  get inactiveHospitals()   { return this.hospitals.filter(h => h.isActive === false).length; }
  // Adoption: PENDING, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
  get pendingAdoptions()    { return this.adoptions.filter(a => a.status === 'PENDING').length; }
  get reviewAdoptions()     { return this.adoptions.filter(a => a.status === 'UNDER_REVIEW').length; }
  get approvedAdoptions()   { return this.adoptions.filter(a => a.status === 'APPROVED').length; }
  get rejectedAdoptions()   { return this.adoptions.filter(a => a.status === 'REJECTED').length; }
  get withdrawnAdoptions()  { return this.adoptions.filter(a => a.status === 'WITHDRAWN').length; }

  /* ── Chart data ─────────────────────── */
  get rescuePipeline() {
    // All RescueStatus values: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, RESOLVED, CANCELLED
    const base = [
      { label:'Pending',     count:this.pendingRescues,    color:'#E89340' },
      { label:'Reported',               count:this.assignedRescues,   color:'#4F8FD4' },
      { label:'Assigned & In Progress', count:this.inProgressRescues, color:'#7C62CC' },
      { label:'Resolved',    count:this.completedRescues,  color:'#2EB894' },
    ];
    if (this.cancelledRescues > 0) {
      base.push({ label:'Cancelled', count:this.cancelledRescues, color:'#94A3B8' });
    }
    return base;
  }

  get urgencyBreakdown() {
    return [
      { label:'Critical', count:this.rescues.filter(r=>r.criticality==='CRITICAL').length, color:'#E05858' },
      { label:'High',     count:this.rescues.filter(r=>r.criticality==='HIGH').length,     color:'#D47A30' },
      { label:'Medium',   count:this.rescues.filter(r=>r.criticality==='MEDIUM').length,   color:'#D4B840' },
      { label:'Low',      count:this.rescues.filter(r=>r.criticality==='LOW').length,      color:'#2EB894' },
    ];
  }

  get roleDistribution() {
    return [
      { label:'Regular Users',     color:'#4F8FD4', count:this.users.filter(u=>u.role==='USER').length },
      { label:'NGO Accounts',      color:'#7C62CC', count:this.users.filter(u=>u.role==='NGO').length },
      { label:'Hospital Accounts', color:'#2EB894', count:this.users.filter(u=>u.role==='HOSPITAL').length },
      { label:'Administrators',    color:'#E05858', count:this.users.filter(u=>u.role==='ADMIN').length },
    ];
  }

  get ngoBreakdown() {
    // verifiedNgos + unverifiedNgos = ngos.length (mutually exclusive, no double-count)
    // Inactive is excluded: the /admin/ngos endpoint returns only active NGOs
    return [
      { label:'Verified',   count:this.verifiedNgos,   color:'#2EB894' },
      { label:'Unverified', count:this.unverifiedNgos, color:'#D4B840' },
    ];
  }

  get adoptionSegments() {
    // All AdoptionStatus values: PENDING, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
    const base = [
      { label:'Pending',     count:this.pendingAdoptions,   color:'#E89340' },
      { label:'Under Review',count:this.reviewAdoptions,    color:'#4F8FD4' },
      { label:'Approved',    count:this.approvedAdoptions,  color:'#2EB894' },
      { label:'Rejected',    count:this.rejectedAdoptions,  color:'#E05858' },
    ];
    if (this.withdrawnAdoptions > 0) {
      base.push({ label:'Withdrawn', count:this.withdrawnAdoptions, color:'#94A3B8' });
    }
    return base;
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      users:     this.api.get<any>('/admin/users').pipe(catchError(() => of({ data: [] }))),
      ngos:      this.api.get<any>('/admin/ngos').pipe(catchError(() => of({ data: [] }))),
      rescues:   this.api.get<any>('/admin/rescues').pipe(catchError(() => of({ data: [] }))),
      hospitals: this.api.get<any>('/admin/hospitals').pipe(catchError(() => of({ data: [] }))),
      adoptions: this.api.get<any>('/admin/adoptions').pipe(catchError(() => of({ data: [] }))),
    }).subscribe(results => {
      this.users     = results.users.data     ?? [];
      this.ngos      = results.ngos.data      ?? [];
      this.rescues   = results.rescues.data   ?? [];
      this.hospitals = results.hospitals.data ?? [];
      this.adoptions = results.adoptions.data ?? [];
      this.loading   = false;
    });
  }
}
