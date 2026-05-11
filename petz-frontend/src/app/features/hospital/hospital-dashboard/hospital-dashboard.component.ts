import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Seg { color: string; dash: string; offset: string; }

@Component({
  standalone: false,
  selector: 'app-hospital-dashboard',
  template: `
    <div class="page-container">

      <!-- ── Header ── -->
      <div class="page-header" style="margin-bottom:20px">
        <div class="page-header-left">
          <h1 style="margin-bottom:2px">Hospital Dashboard</h1>
          <p style="margin:0">
            @if (hospital?.name) {
              <span style="color:#2EB894;font-weight:700">{{ hospital.name }}</span>
              &nbsp;·&nbsp;
            }
            Welcome back — here's your operation overview
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="today-badge">
            <mat-icon>today</mat-icon>
            <span>{{ todayLabel }}</span>
          </div>
        </div>
      </div>

      <!-- ── Pending alert bar ── -->
      @if (!loading && pendingCount > 0) {
        <div class="alert-bar" routerLink="/hospital/appointments" style="cursor:pointer">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="blink-dot"></span>
            <strong>{{ pendingCount }} appointment{{ pendingCount > 1 ? 's' : '' }} awaiting confirmation</strong>
            <span style="opacity:0.75;font-size:0.82rem">— review and confirm to notify pet owners</span>
          </div>
          <mat-icon style="opacity:0.8">arrow_forward</mat-icon>
        </div>
      }

      <!-- ── Profile card ── -->
      @if (hospital) {
        <div class="profile-card">
          <div class="profile-left-stripe"></div>
          <div class="profile-logo">
            @if (hospital.logoUrl) {
              <img [src]="hospital.logoUrl" [alt]="hospital.name">
            } @else {
              <mat-icon>local_hospital</mat-icon>
            }
          </div>
          <div class="profile-info">
            <div class="profile-name">{{ hospital.name }}</div>
            <div class="profile-meta">
              @if (hospital.address || hospital.city) {
                <span class="meta-item">
                  <mat-icon>place</mat-icon>
                  {{ hospital.address }}{{ hospital.city ? ', ' + hospital.city : '' }}
                </span>
              }
              @if (hospital.phone) {
                <span class="meta-item">
                  <mat-icon>phone</mat-icon>{{ hospital.phone }}
                </span>
              }
              @if (hospital.email) {
                <span class="meta-item">
                  <mat-icon>email</mat-icon>{{ hospital.email }}
                </span>
              }
            </div>
          </div>
          <div class="profile-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;vertical-align:middle;margin-right:3px">verified</mat-icon>
            Registered
          </div>
        </div>
      }

      <!-- ── KPI strip ── -->
      <div class="kpi-strip">

        <div class="kpi-item">
          <div class="kpi-icon-box" style="background:linear-gradient(135deg,#6BAEE8,#4F8FD4)">
            <mat-icon>today</mat-icon>
          </div>
          <div class="kpi-text">
            <div class="kpi-val" style="color:#4F8FD4">{{ todayCount }}</div>
            <div class="kpi-label">Today</div>
            <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#4F8FD4" [style.width.%]="pctOf(todayCount, totalCount)"></div></div>
          </div>
        </div>

        <div class="kpi-item">
          <div class="kpi-icon-box" style="background:linear-gradient(135deg,#50CCA8,#2EB894)">
            <mat-icon>medical_services</mat-icon>
          </div>
          <div class="kpi-text">
            <div class="kpi-val" style="color:#2EB894">{{ doctorCount }}</div>
            <div class="kpi-label">Doctors</div>
            <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#2EB894;width:100%"></div></div>
          </div>
        </div>

        <div class="kpi-item">
          <div class="kpi-icon-box" style="background:linear-gradient(135deg,#F0A85A,#E89340)">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="kpi-text">
            <div class="kpi-val" style="color:#E89340">{{ pendingCount }}</div>
            <div class="kpi-label">Pending</div>
            <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#E89340" [style.width.%]="pctOf(pendingCount, totalCount)"></div></div>
          </div>
        </div>

        <div class="kpi-item">
          <div class="kpi-icon-box" style="background:linear-gradient(135deg,#9B82E0,#7C62CC)">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="kpi-text">
            <div class="kpi-val" style="color:#7C62CC">{{ completedCount }}</div>
            <div class="kpi-label">Completed</div>
            <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#7C62CC" [style.width.%]="pctOf(completedCount, totalCount)"></div></div>
          </div>
        </div>

        <div class="kpi-divider"></div>

        <div class="kpi-item">
          <div class="kpi-icon-box" style="background:linear-gradient(135deg,#E87070,#E05858)">
            <mat-icon>cancel</mat-icon>
          </div>
          <div class="kpi-text">
            <div class="kpi-val" style="color:#E05858">{{ cancelledCount }}</div>
            <div class="kpi-label">Cancelled</div>
            <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#E05858" [style.width.%]="pctOf(cancelledCount, totalCount)"></div></div>
          </div>
        </div>

        <div class="kpi-item">
          <div class="kpi-icon-box" style="background:linear-gradient(135deg,#4A7CC4,#1A3547)">
            <mat-icon>event_note</mat-icon>
          </div>
          <div class="kpi-text">
            <div class="kpi-val" style="color:#1A3547">{{ totalCount }}</div>
            <div class="kpi-label">Total</div>
            <div class="kpi-bar-track"><div class="kpi-bar-fill" style="background:#1A3547;width:100%"></div></div>
          </div>
        </div>

      </div>

      <!-- ── Charts row ── -->
      <div class="charts-row">

        <!-- Appointment Status Donut -->
        <div class="chart-panel">
          <div class="panel-title">Appointment Status</div>
          @if (loading) {
            <div class="chart-loading"><mat-spinner diameter="28"></mat-spinner></div>
          } @else if (totalCount === 0) {
            <div class="chart-empty">No appointments yet</div>
          } @else {
            <div class="donut-wrap">
              <svg width="160" height="160" viewBox="0 0 160 160">
                @for (seg of statusSegs; track $index) {
                  <circle cx="80" cy="80" r="34" fill="none"
                          [attr.stroke]="seg.color" stroke-width="22"
                          [attr.stroke-dasharray]="seg.dash"
                          [attr.stroke-dashoffset]="seg.offset"
                          transform="rotate(-90 80 80)"/>
                }
                <text x="80" y="76" text-anchor="middle" font-size="22" font-weight="900" fill="#1A3547">{{ totalCount }}</text>
                <text x="80" y="92" text-anchor="middle" font-size="10" font-weight="600" fill="#8BA3B5">TOTAL</text>
              </svg>
              <div class="donut-legend">
                <div class="legend-item">
                  <span class="leg-dot" style="background:#E89340"></span>
                  <span class="leg-label">Pending</span>
                  <span class="leg-val">{{ pendingCount }}</span>
                </div>
                <div class="legend-item">
                  <span class="leg-dot" style="background:#4F8FD4"></span>
                  <span class="leg-label">Confirmed</span>
                  <span class="leg-val">{{ confirmedCount }}</span>
                </div>
                <div class="legend-item">
                  <span class="leg-dot" style="background:#2EB894"></span>
                  <span class="leg-label">Completed</span>
                  <span class="leg-val">{{ completedCount }}</span>
                </div>
                <div class="legend-item">
                  <span class="leg-dot" style="background:#E05858"></span>
                  <span class="leg-label">Cancelled</span>
                  <span class="leg-val">{{ cancelledCount }}</span>
                </div>
                @if (noShowCount > 0) {
                  <div class="legend-item">
                    <span class="leg-dot" style="background:#94A3B8"></span>
                    <span class="leg-label">No Show</span>
                    <span class="leg-val">{{ noShowCount }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Weekly Breakdown — smooth line chart -->
        <div class="chart-panel">
          <div class="panel-title">
            This Week
            <span class="panel-sub">{{ weekLabel }}</span>
          </div>
          @if (loading) {
            <div class="chart-loading"><mat-spinner diameter="28"></mat-spinner></div>
          } @else if (totalCount === 0) {
            <div class="chart-empty">No appointments this week</div>
          } @else {
            <svg class="line-chart-svg" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="lcAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="#4F8FD4" stop-opacity="0.22"/>
                  <stop offset="100%" stop-color="#4F8FD4" stop-opacity="0.01"/>
                </linearGradient>
              </defs>

              <!-- Horizontal gridlines -->
              <line x1="20" y1="15"  x2="280" y2="15"  stroke="#EEF1F5" stroke-width="1"/>
              <line x1="20" y1="55"  x2="280" y2="55"  stroke="#EEF1F5" stroke-width="1"/>
              <line x1="20" y1="95"  x2="280" y2="95"  stroke="#EEF1F5" stroke-width="1"/>

              <!-- Area fill under the line -->
              <path [attr.d]="weekAreaPath" fill="url(#lcAreaGrad)"/>

              <!-- The line itself -->
              <path [attr.d]="weekLinePath"
                    fill="none" stroke="#4F8FD4" stroke-width="2.2"
                    stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Data points, count labels, day labels -->
              @for (pt of weekLinePoints; track pt.name) {

                <!-- Count label above each point (skip zeros) -->
                @if (pt.count > 0) {
                  <text [attr.x]="pt.x" [attr.y]="pt.y - 7"
                        text-anchor="middle" font-size="8" font-weight="700"
                        [attr.fill]="pt.isToday ? '#4F8FD4' : '#4A6478'">{{ pt.count }}</text>
                }

                <!-- Regular point: white fill, blue stroke -->
                @if (!pt.isToday) {
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y"
                          r="3.5" fill="#fff" stroke="#4F8FD4" stroke-width="2"/>
                }

                <!-- Today: solid filled bullseye -->
                @if (pt.isToday) {
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="6" fill="#4F8FD4" opacity="0.18"/>
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4"  fill="#4F8FD4"/>
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="1.8" fill="#fff"/>
                }

                <!-- Day label at bottom -->
                <text [attr.x]="pt.x" y="113"
                      text-anchor="middle" font-size="7.5" font-weight="700"
                      [attr.fill]="pt.isToday ? '#4F8FD4' : '#B0C4D4'"
                      style="text-transform:uppercase;letter-spacing:0.04em">{{ pt.name }}</text>
              }
            </svg>
          }
        </div>

        <!-- Doctor capacity panel -->
        <div class="chart-panel">
          <div class="panel-title">Doctor Capacity</div>
          @if (loading) {
            <div class="chart-loading"><mat-spinner diameter="28"></mat-spinner></div>
          } @else if (doctorCount === 0) {
            <div class="chart-empty">No doctors added</div>
          } @else {
            <div class="doctor-capacity">
              <div class="cap-stat">
                <div class="cap-big" style="color:#2EB894">{{ scheduledDoctors }}</div>
                <div class="cap-lbl">Scheduled</div>
              </div>
              <div class="cap-divider"></div>
              <div class="cap-stat">
                <div class="cap-big" style="color:#E89340">{{ doctorCount - scheduledDoctors }}</div>
                <div class="cap-lbl">No Schedule</div>
              </div>
              <div class="cap-divider"></div>
              <div class="cap-stat">
                <div class="cap-big" style="color:#4F8FD4">{{ totalDailySlots }}</div>
                <div class="cap-lbl">Slots/Day</div>
              </div>
            </div>
            <div class="spec-list">
              @for (spec of topSpecs; track spec.name) {
                <div class="spec-row">
                  <span class="spec-name">{{ spec.name }}</span>
                  <span class="spec-count">{{ spec.count }} dr{{ spec.count > 1 ? 's' : '' }}</span>
                </div>
              }
            </div>
          }
        </div>

      </div>

      <!-- ── Nav cards ── -->
      <div class="nav-grid">

        <div class="nav-card" routerLink="/hospital/appointments">
          <div class="nav-stripe" style="background:linear-gradient(180deg,#4F8FD4,#7C62CC)"></div>
          <div class="nav-icon-wrap" style="background:linear-gradient(135deg,#1A3B7A,#4F8FD4)">
            <mat-icon>event</mat-icon>
          </div>
          <div class="nav-body">
            <div class="nav-title">Appointments</div>
            <div class="nav-desc">View and manage all scheduled visits</div>
          </div>
          <div class="nav-right">
            @if (pendingCount > 0) {
              <span class="nav-chip amber">{{ pendingCount }} pending</span>
            }
            @if (todayCount > 0) {
              <span class="nav-chip blue">{{ todayCount }} today</span>
            }
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>
        </div>

        <div class="nav-card" routerLink="/hospital/doctors">
          <div class="nav-stripe" style="background:linear-gradient(180deg,#2EB894,#4F8FD4)"></div>
          <div class="nav-icon-wrap" style="background:linear-gradient(135deg,#0A5840,#2EB894)">
            <mat-icon>medical_services</mat-icon>
          </div>
          <div class="nav-body">
            <div class="nav-title">Manage Doctors</div>
            <div class="nav-desc">Add, view and manage medical staff</div>
          </div>
          <div class="nav-right">
            @if (doctorCount > 0) {
              <span class="nav-chip teal">{{ doctorCount }} doctor{{ doctorCount !== 1 ? 's' : '' }}</span>
            }
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    /* ── Today badge ── */
    .today-badge {
      display: flex; align-items: center; gap: 6px;
      background: #EDE9FE; color: #5B21B6;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width:16px; height:16px; }
    }

    /* ── Alert bar ── */
    .alert-bar {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(135deg, #1A3B7A 0%, #2E6CC8 100%);
      border-radius: 14px; padding: 12px 18px; margin-bottom: 18px;
      color: #fff; font-size: 0.83rem;
      box-shadow: 0 4px 16px rgba(30,60,200,0.2);
      mat-icon { font-size: 18px; width:18px; height:18px; }
    }
    .blink-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #fff; flex-shrink: 0;
      animation: blink 1.4s ease-in-out infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* ── Profile card ── */
    .profile-card {
      display: flex; align-items: center; gap: 18px;
      background: #fff; border: 1px solid #E0EBF2; border-radius: 20px;
      padding: 20px 24px; margin-bottom: 22px; position: relative; overflow: hidden;
      box-shadow: 0 4px 16px rgba(26,53,71,0.07);
    }
    .profile-left-stripe {
      position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      background: linear-gradient(180deg, #2EB894, #4F8FD4);
    }
    .profile-logo {
      width: 60px; height: 60px; border-radius: 16px; flex-shrink: 0;
      background: linear-gradient(135deg, #0A5840, #2EB894);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      box-shadow: 0 4px 12px rgba(46,184,148,0.3);
      img { width:100%; height:100%; object-fit:cover; }
      mat-icon { color:#fff; font-size:28px; width:28px; height:28px; }
    }
    .profile-info { flex: 1; }
    .profile-name { font-weight: 900; font-size: 1.05rem; color: #1A3547; margin-bottom: 6px; }
    .profile-meta { display: flex; gap: 16px; flex-wrap: wrap; }
    .meta-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.78rem; color: #4A6478; font-weight: 500;
      mat-icon { font-size: 13px; width:13px; height:13px; color: #2EB894; }
    }
    .profile-badge {
      background: #D1FAE5; color: #065F46;
      font-size: 0.72rem; font-weight: 800; border-radius: 999px; padding: 5px 12px;
      flex-shrink: 0;
    }

    /* ── KPI strip ── */
    .kpi-strip {
      display: flex; align-items: center; gap: 0;
      background: #fff; border: 1px solid #E0EBF2; border-radius: 16px;
      padding: 16px 12px; margin-bottom: 22px;
      box-shadow: 0 2px 8px rgba(26,53,71,0.05);
      flex-wrap: wrap;
    }
    .kpi-item {
      flex: 1; min-width: 90px;
      display: flex; align-items: center; gap: 10px;
      padding: 4px 10px;
    }
    .kpi-icon-box {
      width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.14);
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: #fff; }
    }
    .kpi-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .kpi-val  { font-size: 1.2rem; font-weight: 900; line-height: 1; }
    .kpi-label{ font-size: 0.65rem; font-weight: 600; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }
    .kpi-bar-track {
      height: 3px; background: #EEF1F5; border-radius: 999px; margin-top: 5px; overflow: hidden;
    }
    .kpi-bar-fill {
      height: 100%; border-radius: 999px; min-width: 3px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kpi-divider {
      width: 1px; height: 44px; background: #E0EBF2; flex-shrink: 0; margin: 0 4px;
    }

    /* ── Charts row ── */
    .charts-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 22px;
    }
    @media (max-width: 820px) { .charts-row { grid-template-columns: 1fr; } }

    .chart-panel {
      background: #fff; border: 1px solid #E0EBF2; border-radius: 16px;
      padding: 18px 18px 16px;
      box-shadow: 0 2px 8px rgba(26,53,71,0.05);
    }
    .panel-title {
      font-size: 0.78rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.07em; color: #1A3547; margin-bottom: 14px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .panel-sub { font-size: 0.68rem; color: #8BA3B5; font-weight: 600; letter-spacing: 0; text-transform: none; }
    .chart-loading { display: flex; justify-content: center; padding: 30px 0; }
    .chart-empty { text-align: center; color: #B0C4D4; font-size: 0.82rem; padding: 30px 0; }

    /* Donut */
    .donut-wrap { display: flex; align-items: center; gap: 16px; }
    .donut-legend { display: flex; flex-direction: column; gap: 7px; flex: 1; }
    .legend-item { display: flex; align-items: center; gap: 7px; }
    .leg-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
    .leg-label { font-size: 0.75rem; color: #4A6478; font-weight: 600; flex: 1; }
    .leg-val { font-size: 0.82rem; font-weight: 800; color: #1A3547; }

    /* ── Line chart ── */
    .line-chart-svg {
      width: 100%; display: block;
      overflow: visible; /* so count labels above top gridline aren't clipped */
    }

    /* Doctor capacity */
    .doctor-capacity {
      display: flex; align-items: center; gap: 0;
      background: #F8FAFB; border-radius: 12px; padding: 14px 10px; margin-bottom: 14px;
    }
    .cap-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .cap-big  { font-size: 1.5rem; font-weight: 900; line-height: 1; }
    .cap-lbl  { font-size: 0.65rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.05em; }
    .cap-divider { width: 1px; height: 36px; background: #E0EBF2; flex-shrink: 0; }

    .spec-list { display: flex; flex-direction: column; gap: 6px; }
    .spec-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 10px; background: #F8FAFB; border-radius: 8px;
    }
    .spec-name { font-size: 0.78rem; font-weight: 600; color: #1A3547; }
    .spec-count {
      font-size: 0.68rem; font-weight: 700; background: #EDE9FE; color: #5B21B6;
      border-radius: 999px; padding: 2px 8px;
    }

    /* ── Nav cards ── */
    .nav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 560px) { .nav-grid { grid-template-columns: 1fr; } }

    .nav-card {
      display: flex; align-items: center; gap: 14px;
      background: #fff; border: 1.5px solid #E0EBF2; border-radius: 18px;
      padding: 16px 18px; cursor: pointer; position: relative; overflow: hidden;
      transition: all 0.2s ease; text-decoration: none;
      &:hover {
        border-color: transparent; box-shadow: 0 8px 28px rgba(26,53,71,0.13);
        transform: translateY(-2px);
        .nav-stripe { width: 5px; }
        .nav-arrow { transform: translateX(4px); }
      }
    }
    .nav-stripe {
      position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
      transition: width 0.2s ease; border-radius: 18px 0 0 18px;
    }
    .nav-icon-wrap {
      width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #fff; font-size: 22px; width:22px; height:22px; }
    }
    .nav-body { flex: 1; }
    .nav-title { font-weight: 800; font-size: 0.95rem; color: #1A3547; margin-bottom: 3px; }
    .nav-desc  { font-size: 0.75rem; color: #8BA3B5; font-weight: 500; }
    .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .nav-chip {
      font-size: 0.68rem; font-weight: 700; border-radius: 999px; padding: 3px 10px;
    }
    .nav-chip.amber { background: #FEF0DC; color: #A06020; }
    .nav-chip.blue  { background: #DBEAFE; color: #1D4ED8; }
    .nav-chip.teal  { background: #D1FAE5; color: #065F46; }
    .nav-arrow {
      color: #C8DCE8; font-size: 20px; width:20px; height:20px;
      transition: transform 0.2s ease;
    }
  `]
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
