import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Appt {
  id: number;
  userId: number;
  petId: number;
  hospitalId: number;
  doctorId: number;
  apptDate: string;
  apptTime: string;
  reason: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  hospitalName: string;
  hospitalCity: string;
  hospitalAddress: string;
  hospitalPhone: string;
  doctorName: string;
  doctorSpecialization: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface WeekDay {
  date: Date;
  label: string;
  dayNum: string;
  dayName: string;
  count: number;
}

@Component({
  standalone: false,
  selector: 'app-hospital-appointments',
  template: `
    <!-- Popup overlay -->
    @if (selected) {
      <div class="overlay" (click)="selected = null">
        <div class="popup" (click)="$event.stopPropagation()">

          <!-- Popup Header -->
          <div class="popup-hdr" [ngClass]="'hdr-' + selected.status.toLowerCase()">
            <div class="popup-hdr-inner">
              <div class="popup-avatar">
                <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                  <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)"/>
                  <path d="M20 10 C15 10 11 14 11 19 C11 24 15 27 20 27 C25 27 29 24 29 19 C29 14 25 10 20 10Z" fill="rgba(255,255,255,0.8)"/>
                  <path d="M10 38 C10 31 14 28 20 28 C26 28 30 31 30 38" fill="rgba(255,255,255,0.5)"/>
                </svg>
              </div>
              <div>
                <div class="popup-name">{{ selected.userName || 'Unknown Owner' }}</div>
                <div class="popup-sub">{{ selected.apptDate | date:'EEEE, MMMM d, y' }} · {{ formatTime(selected.apptTime) }}</div>
              </div>
            </div>
            <button class="popup-close" (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Status pill -->
          <div style="padding:16px 22px 0">
            <span class="status-chip chip-{{ selected.status.toLowerCase() }}">{{ selected.status }}</span>
          </div>

          <!-- Popup body -->
          <div class="popup-body">

            <!-- Pet section -->
            <div class="popup-section">
              <div class="section-label">
                <mat-icon class="sec-icon pet-ic">pets</mat-icon> Pet Details
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="dk">Name</span>
                  <span class="dv">{{ selected.petName || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Species</span>
                  <span class="dv">{{ selected.petSpecies || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Breed</span>
                  <span class="dv">{{ selected.petBreed || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Doctor section -->
            <div class="popup-section">
              <div class="section-label">
                <mat-icon class="sec-icon doc-ic">medical_services</mat-icon> Assigned Doctor
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="dk">Doctor</span>
                  <span class="dv">{{ selected.doctorName || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Specialization</span>
                  <span class="dv">{{ selected.doctorSpecialization || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Owner Contact section -->
            <div class="popup-section">
              <div class="section-label">
                <mat-icon class="sec-icon own-ic">person</mat-icon> Owner Contact
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="dk">Name</span>
                  <span class="dv">{{ selected.userName || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Email</span>
                  <span class="dv email-val">{{ selected.userEmail || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Phone</span>
                  <span class="dv">{{ selected.userPhone || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Reason block -->
            <div class="popup-section">
              <div class="section-label">
                <mat-icon class="sec-icon rsn-ic">notes</mat-icon> Reason for Visit
              </div>
              <div class="reason-box">{{ selected.reason || 'General Checkup' }}</div>
            </div>

            <!-- Notes block -->
            @if (selected.notes) {
              <div class="popup-section">
                <div class="section-label">
                  <mat-icon class="sec-icon nts-ic">edit_note</mat-icon> Notes
                </div>
                <div class="reason-box notes-box">{{ selected.notes }}</div>
              </div>
            }

          </div>

          <!-- Popup actions -->
          <div class="popup-actions">
            @if (selected.status === 'PENDING') {
              <button mat-raised-button class="action-confirm" (click)="updateStatus(selected, 'CONFIRMED')">
                <mat-icon>check_circle</mat-icon> Confirm Appointment
              </button>
            }
            @if (selected.status === 'CONFIRMED' && isPast(selected.apptDate)) {
              <button mat-raised-button class="action-complete" (click)="updateStatus(selected, 'COMPLETED')">
                <mat-icon>done_all</mat-icon> Mark Completed
              </button>
            }
            @if (selected.status === 'CONFIRMED' && !isPast(selected.apptDate)) {
              <div class="future-note">
                <mat-icon>schedule</mat-icon>
                Can only be marked complete on or after the appointment date
              </div>
            }
            @if (selected.status === 'PENDING' || selected.status === 'CONFIRMED') {
              <button mat-stroked-button class="action-cancel" (click)="updateStatus(selected, 'CANCELLED')">
                <mat-icon>cancel</mat-icon> Cancel
              </button>
            }
            <button mat-stroked-button class="action-close" (click)="selected = null">Close</button>
          </div>
        </div>
      </div>
    }

    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/hospital" class="back-btn" title="Back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Appointments</h1>
            <p>Manage incoming and scheduled vet appointments</p>
          </div>
        </div>
        <div class="header-right">
          <div class="view-toggle">
            <button class="vt-btn" [class.active]="viewMode==='week'" (click)="switchView('week')">
              <mat-icon>date_range</mat-icon> Week
            </button>
            <button class="vt-btn" [class.active]="viewMode==='all'" (click)="switchView('all')">
              <mat-icon>list_alt</mat-icon> All Time
            </button>
          </div>
          <div class="total-badge">
            <mat-icon>event</mat-icon>
            <span>{{ viewMode === 'week' ? weekTotal() + ' this week' : allAppts.length + ' total' }}</span>
          </div>
        </div>
      </div>

      <!-- Stat strip -->
      <div class="stat-strip">
        <div class="stat-item" (click)="filterStatus=''; applyFilters()" [class.active]="filterStatus===''">
          <div class="stat-val">{{ viewMode === 'week' ? weekTotal() : allAppts.length }}</div>
          <div class="stat-label">All</div>
          <div class="stat-bar" style="background:#4F8FD4"></div>
        </div>
        <div class="stat-item" (click)="filterStatus='PENDING'; applyFilters()" [class.active]="filterStatus==='PENDING'">
          <div class="stat-val" style="color:#E89340">{{ countBy('PENDING') }}</div>
          <div class="stat-label">Pending</div>
          <div class="stat-bar" style="background:#E89340"></div>
        </div>
        <div class="stat-item" (click)="filterStatus='CONFIRMED'; applyFilters()" [class.active]="filterStatus==='CONFIRMED'">
          <div class="stat-val" style="color:#4F8FD4">{{ countBy('CONFIRMED') }}</div>
          <div class="stat-label">Confirmed</div>
          <div class="stat-bar" style="background:#4F8FD4"></div>
        </div>
        <div class="stat-item" (click)="filterStatus='COMPLETED'; applyFilters()" [class.active]="filterStatus==='COMPLETED'">
          <div class="stat-val" style="color:#2EB894">{{ countBy('COMPLETED') }}</div>
          <div class="stat-label">Completed</div>
          <div class="stat-bar" style="background:#2EB894"></div>
        </div>
        <div class="stat-item" (click)="filterStatus='CANCELLED'; applyFilters()" [class.active]="filterStatus==='CANCELLED'">
          <div class="stat-val" style="color:#E05858">{{ countBy('CANCELLED') }}</div>
          <div class="stat-label">Cancelled</div>
          <div class="stat-bar" style="background:#E05858"></div>
        </div>
      </div>

      <!-- Week Strip (visible in week mode only) -->
      @if (viewMode === 'week') {
      <div class="week-strip-card">
        <div class="week-nav">
          <button mat-icon-button class="nav-btn" (click)="prevWeek()" title="Previous week">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="week-label">{{ weekRangeLabel() }}</span>
          <button mat-icon-button class="nav-btn" (click)="nextWeek()" title="Next week">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
        <div class="week-days">
          <div class="week-all-btn" [class.active]="!selectedDate" (click)="clearDateFilter()">
            <mat-icon class="week-all-icon">calendar_view_week</mat-icon>
            <div class="wd-name">This Week</div>
            <div class="wd-count">{{ weekTotal() }}</div>
          </div>
          @for (day of weekDays; track day.label) {
            <div class="week-day-cell"
                 [class.selected]="isSelectedDay(day.date)"
                 [class.today]="isToday(day.date)"
                 [class.has-appts]="day.count > 0"
                 (click)="selectDay(day.date)">
              <div class="wd-name">{{ day.dayName }}</div>
              <div class="wd-num">{{ day.dayNum }}</div>
              @if (day.count > 0) {
                <div class="wd-count">{{ day.count }}</div>
              } @else {
                <div class="wd-empty">·</div>
              }
            </div>
          }
        </div>
      </div>
      } <!-- end @if viewMode === 'week' -->

      <!-- Filter bar -->
      <div class="filter-bar">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input class="search-input" placeholder="Search by pet, owner, doctor, reason…"
                 [(ngModel)]="searchQ" (ngModelChange)="applyFilters()">
          @if (searchQ) {
            <button class="clear-btn" (click)="searchQ=''; applyFilters()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
        <div class="filter-selects">
          <label class="select-wrap">
            <span class="sel-label">Status</span>
            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label class="select-wrap">
            <span class="sel-label">Sort</span>
            <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
              <option value="date-asc">Date ↑</option>
              <option value="date-desc">Date ↓</option>
              <option value="pending-first">Pending first</option>
              <option value="status">By status</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading appointments...</span>
        </div>
      }

      <!-- Empty -->
      @if (!loading && filtered.length === 0) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon"><mat-icon>event_busy</mat-icon></div>
            <h3>No appointments</h3>
            <p>{{ allAppts.length === 0 ? 'No appointments have been booked yet.' : 'No appointments match the current filters.' }}</p>
            @if (allAppts.length > 0) {
              <button mat-stroked-button (click)="clearFilters()" style="margin-top:8px">Clear Filters</button>
            }
          </div>
        </div>
      }

      <!-- Appointments list -->
      @if (!loading && filtered.length > 0) {
        <div class="appt-list">
          @for (a of filtered; track a.id) {
            <div class="appt-row" [class.row-pending]="a.status==='PENDING'"
                 (click)="selected = a">
              <!-- Date block -->
              <div class="appt-date-blk">
                <div class="date-num">{{ getDay(a.apptDate) }}</div>
                <div class="date-mon">{{ getMonth(a.apptDate) }}</div>
                <div class="date-time">{{ formatTime(a.apptTime) }}</div>
              </div>

              <!-- Main info -->
              <div class="appt-main">
                <div class="appt-top">
                  <div class="appt-reason">{{ a.reason || 'General Checkup' }}</div>
                  <span class="status-chip chip-{{ a.status.toLowerCase() }}">{{ a.status }}</span>
                </div>
                <div class="appt-meta-row">
                  <span class="meta-pill pet-pill">
                    <mat-icon>pets</mat-icon>
                    {{ a.petName || 'Unknown Pet' }}
                    @if (a.petSpecies) { · {{ a.petSpecies }} }
                  </span>
                  <span class="meta-pill owner-pill">
                    <mat-icon>person</mat-icon>
                    {{ a.userName || 'Unknown Owner' }}
                  </span>
                  <span class="meta-pill doc-pill">
                    <mat-icon>medical_services</mat-icon>
                    Dr. {{ a.doctorName || 'TBD' }}
                  </span>
                </div>
              </div>

              <!-- Quick actions -->
              <div class="appt-quick" (click)="$event.stopPropagation()">
                @if (a.status === 'PENDING') {
                  <button mat-icon-button class="q-confirm" title="Confirm" (click)="updateStatus(a,'CONFIRMED')">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                }
                @if (a.status === 'CONFIRMED' && isPast(a.apptDate)) {
                  <button mat-icon-button class="q-complete" title="Mark complete" (click)="updateStatus(a,'COMPLETED')">
                    <mat-icon>done_all</mat-icon>
                  </button>
                }
                @if (a.status === 'CONFIRMED' && !isPast(a.apptDate)) {
                  <button mat-icon-button class="q-future" title="Appointment not yet due" disabled>
                    <mat-icon>schedule</mat-icon>
                  </button>
                }
                <button mat-icon-button class="q-detail" title="View details" (click)="selected = a">
                  <mat-icon>open_in_new</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Overlay & Popup ── */
    .overlay {
      position: fixed; inset: 0; background: rgba(15,30,45,0.55);
      backdrop-filter: blur(3px); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.18s ease;
    }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    .popup {
      background: #fff; border-radius: 20px;
      width: 520px; max-width: 96vw; max-height: 88vh;
      overflow-y: auto; box-shadow: 0 24px 64px rgba(15,30,45,0.25);
      animation: slideUp 0.22s ease;
    }
    @keyframes slideUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }

    .popup-hdr {
      border-radius: 20px 20px 0 0; padding: 22px 22px 18px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .hdr-pending  { background: linear-gradient(135deg, #7B4A10 0%, #C07030 100%); }
    .hdr-confirmed { background: linear-gradient(135deg, #1A3B7A 0%, #2E6CC8 100%); }
    .hdr-completed { background: linear-gradient(135deg, #0A4A35 0%, #1A8A68 100%); }
    .hdr-cancelled { background: linear-gradient(135deg, #5A1A1A 0%, #A03030 100%); }

    .popup-hdr-inner { display: flex; align-items: center; gap: 14px; }
    .popup-avatar {
      width: 50px; height: 50px; border-radius: 14px;
      background: rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center;
      flex-shrink: 0;
    }
    .popup-name { font-size: 1.05rem; font-weight: 800; color: #fff; line-height: 1.2; }
    .popup-sub  { font-size: 0.75rem; color: rgba(255,255,255,0.75); margin-top: 2px; }
    .popup-close {
      background: rgba(255,255,255,0.15) !important; border: none !important;
      color: #fff !important; border-radius: 10px !important;
      width: 34px !important; height: 34px !important; flex-shrink: 0;
      &:hover { background: rgba(255,255,255,0.25) !important; }
      mat-icon { font-size: 18px; width:18px; height:18px; }
    }

    .popup-body { padding: 4px 22px 8px; }
    .popup-section { margin-bottom: 18px; }
    .section-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
      color: #8BA3B5; margin-bottom: 10px;
    }
    .sec-icon { font-size: 14px; width:14px; height:14px; }
    .pet-ic  { color: #2EB894; }
    .doc-ic  { color: #4F8FD4; }
    .own-ic  { color: #7C62CC; }
    .rsn-ic  { color: #E89340; }
    .nts-ic  { color: #4A6478; }

    .detail-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .detail-item {
      background: #F8FAFB; border-radius: 10px; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 3px;
    }
    .dk { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #8BA3B5; }
    .dv { font-size: 0.82rem; font-weight: 700; color: #1A3547; }
    .email-val { font-size: 0.72rem; word-break: break-all; }

    .reason-box {
      background: #F8FAFB; border-radius: 10px; padding: 12px 14px;
      font-size: 0.85rem; color: #1A3547; line-height: 1.55;
    }
    .notes-box { border-left: 3px solid #E89340; }

    .popup-actions {
      padding: 14px 22px 20px; display: flex; gap: 8px; flex-wrap: wrap;
      border-top: 1px solid #F0F4F8;
    }
    .action-confirm {
      background: linear-gradient(135deg, #1A7A5E, #2EB894) !important;
      color: #fff !important; border-radius: 10px !important; font-weight: 700 !important;
      mat-icon { margin-right: 6px; font-size: 16px; width:16px; height:16px; }
    }
    .action-complete {
      background: linear-gradient(135deg, #1A3B7A, #4F8FD4) !important;
      color: #fff !important; border-radius: 10px !important; font-weight: 700 !important;
      mat-icon { margin-right: 6px; font-size: 16px; width:16px; height:16px; }
    }
    .action-cancel {
      border-color: #FECACA !important; color: #E05858 !important;
      border-radius: 10px !important; font-weight: 600 !important;
      mat-icon { margin-right: 4px; font-size: 15px; width:15px; height:15px; }
      &:hover { background: #FEF2F2 !important; }
    }
    .action-close {
      border-color: #E0EBF2 !important; color: #8BA3B5 !important;
      border-radius: 10px !important; margin-left: auto;
      &:hover { border-color: #4F8FD4 !important; color: #4F8FD4 !important; }
    }

    /* ── Status chips ── */
    .status-chip {
      display: inline-block; font-size: 0.68rem; font-weight: 800;
      padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .chip-pending   { background: #FEF0DC; color: #A06020; }
    .chip-confirmed { background: #DBEAFE; color: #1D4ED8; }
    .chip-completed { background: #D1FAE5; color: #065F46; }
    .chip-cancelled { background: #FEE2E2; color: #991B1B; }

    /* ── Header right group ── */
    .header-right {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end;
    }

    /* ── View mode toggle ── */
    .view-toggle {
      display: flex; align-items: center;
      background: #F0F4F8; border-radius: 10px; padding: 3px; gap: 2px;
    }
    .vt-btn {
      display: flex; align-items: center; gap: 5px;
      border: none; background: transparent; cursor: pointer;
      font-size: 0.75rem; font-weight: 700; color: #8BA3B5;
      padding: 5px 12px; border-radius: 8px; transition: all 0.15s ease;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover:not(.active) { color: #4F8FD4; background: rgba(79,143,212,0.08); }
      &.active { background: #fff; color: #4F8FD4; box-shadow: 0 1px 4px rgba(26,53,71,0.1); }
    }

    /* ── Back btn ── */
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #E0EBF2 !important; color: #4A6478 !important; flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }
    .total-badge {
      display: flex; align-items: center; gap: 6px;
      background: #EDE9FE; color: #5B21B6;
      border-radius: 999px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* ── Stat strip ── */
    .stat-strip {
      display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;
    }
    .stat-item {
      flex: 1; min-width: 90px; background: #fff;
      border: 1px solid #E0EBF2; border-radius: 14px;
      padding: 14px 16px 10px; cursor: pointer; position: relative; overflow: hidden;
      transition: all 0.18s ease;
      &:hover { border-color: #4F8FD4; box-shadow: 0 4px 16px rgba(79,143,212,0.12); }
      &.active { border-color: #4F8FD4; background: #F0F6FF; }
    }
    .stat-val  { font-size: 1.5rem; font-weight: 900; color: #1A3547; line-height: 1; }
    .stat-label { font-size: 0.7rem; font-weight: 600; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
    .stat-bar  { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; opacity: 0.5; }
    .stat-item.active .stat-bar { opacity: 1; }

    /* ── Week strip ── */
    .week-strip-card {
      background: #fff; border: 1px solid #E0EBF2; border-radius: 16px;
      padding: 14px 16px; margin-bottom: 18px;
      box-shadow: 0 2px 8px rgba(26,53,71,0.05);
    }
    .week-nav {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      margin-bottom: 12px;
    }
    .nav-btn {
      width: 32px !important; height: 32px !important; border-radius: 8px !important;
      color: #4A6478 !important;
      &:hover { background: #F0F6FF !important; color: #4F8FD4 !important; }
    }
    .week-label { font-size: 0.8rem; font-weight: 700; color: #1A3547; min-width: 200px; text-align: center; }
    .week-days {
      display: flex; gap: 6px; overflow-x: auto;
      &::-webkit-scrollbar { height: 3px; }
      &::-webkit-scrollbar-thumb { background: #E0EBF2; border-radius: 999px; }
    }
    .week-all-btn, .week-day-cell {
      flex: 1; min-width: 52px;
      display: flex; flex-direction: column; align-items: center;
      padding: 8px 6px; border-radius: 12px; cursor: pointer;
      border: 1.5px solid transparent; transition: all 0.15s ease;
    }
    .week-all-btn {
      background: #F8FAFB; border-color: #E0EBF2;
      &.active {
        background: #4F8FD4; border-color: #4F8FD4;
        .week-all-icon, .wd-name, .wd-count { color: #fff !important; }
        .wd-count { background: rgba(255,255,255,0.25) !important; }
      }
      &:hover:not(.active) { border-color: #4F8FD4; }
    }
    .week-all-icon {
      font-size: 22px; width: 22px; height: 22px;
      color: #4F8FD4; margin-bottom: 4px;
    }
    .week-day-cell {
      background: #F8FAFB; border-color: #F8FAFB;
      &:hover:not(.selected) { border-color: #E0EBF2; background: #F0F6FF; }
      &.selected { background: #4F8FD4; border-color: #4F8FD4; .wd-num,.wd-name,.wd-count { color: #fff !important; } }
      &.today:not(.selected) { border-color: #4F8FD4; .wd-num { color: #4F8FD4; } }
      &.has-appts:not(.selected) { .wd-count { background: #E89340; color: #fff; } }
    }
    .wd-name { font-size: 0.6rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .wd-num  { font-size: 1rem; font-weight: 800; color: #1A3547; line-height: 1; margin-bottom: 6px; }
    .wd-count {
      font-size: 0.65rem; font-weight: 700;
      background: #E8F1F8; color: #4F8FD4;
      border-radius: 999px; padding: 1px 7px; min-width: 18px; text-align: center;
    }
    .wd-empty { font-size: 0.9rem; color: #E0EBF2; }

    /* ── Filter bar ── */
    .filter-bar {
      display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;
    }
    .search-wrap {
      flex: 1; min-width: 200px;
      display: flex; align-items: center; gap: 8px;
      background: #fff; border: 1.5px solid #E0EBF2; border-radius: 12px;
      padding: 0 12px; height: 40px;
      &:focus-within { border-color: #4F8FD4; }
    }
    .search-icon { font-size: 18px; width:18px; height:18px; color: #8BA3B5; flex-shrink:0; }
    .search-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 0.83rem; color: #1A3547;
      &::placeholder { color: #B0C4D4; }
    }
    .clear-btn {
      background: none; border: none; cursor: pointer; color: #8BA3B5; padding: 0; display:flex;
      mat-icon { font-size: 16px; width:16px; height:16px; }
      &:hover { color: #E05858; }
    }
    .filter-selects { display: flex; gap: 10px; flex-wrap: wrap; }
    .select-wrap {
      display: flex; flex-direction: column; gap: 2px;
      background: #fff; border: 1.5px solid #E0EBF2; border-radius: 12px;
      padding: 4px 12px 6px; cursor: pointer; transition: border-color 0.15s;
      &:focus-within { border-color: #4F8FD4; }
    }
    .sel-label { font-size: 0.6rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; }
    .select-wrap select {
      border: none; outline: none; background: transparent;
      font-size: 0.82rem; font-weight: 600; color: #1A3547; cursor: pointer; min-width: 110px;
    }

    /* ── Appointment list rows ── */
    .appt-list { display: flex; flex-direction: column; gap: 10px; }
    .appt-row {
      background: #fff; border: 1.5px solid #E0EBF2; border-radius: 14px;
      display: flex; align-items: center; gap: 16px;
      padding: 14px 16px; cursor: pointer; transition: all 0.18s ease;
      &:hover { border-color: #4F8FD4; box-shadow: 0 4px 16px rgba(79,143,212,0.1); transform: translateX(2px); }
    }
    .row-pending { border-left: 4px solid #E89340; }

    .appt-date-blk {
      display: flex; flex-direction: column; align-items: center;
      background: #F0F6FF; border-radius: 12px; padding: 8px 12px;
      min-width: 56px; flex-shrink: 0;
    }
    .date-num { font-size: 1.3rem; font-weight: 900; color: #4F8FD4; line-height: 1; }
    .date-mon { font-size: 0.6rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1px; }
    .date-time { font-size: 0.68rem; font-weight: 600; color: #7C62CC; margin-top: 4px; }

    .appt-main { flex: 1; min-width: 0; }
    .appt-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
    .appt-reason { font-size: 0.88rem; font-weight: 700; color: #1A3547; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .meta-pill {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 0.72rem; font-weight: 600; border-radius: 999px; padding: 3px 9px;
      mat-icon { font-size: 12px; width:12px; height:12px; }
    }
    .pet-pill   { background: #D1FAE5; color: #065F46; }
    .owner-pill { background: #EDE9FE; color: #5B21B6; }
    .doc-pill   { background: #DBEAFE; color: #1D4ED8; }

    .appt-quick { display: flex; gap: 4px; flex-shrink: 0; }
    .q-confirm { color: #2EB894 !important; &:hover { background: #D1FAE5 !important; } }
    .q-complete { color: #4F8FD4 !important; &:hover { background: #DBEAFE !important; } }
    .q-future   { color: #D1D5DB !important; cursor: not-allowed !important; }
    .q-detail   { color: #8BA3B5 !important; &:hover { background: #F0F6FF !important; color: #4F8FD4 !important; } }

    .future-note {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 600; color: #8BA3B5;
      background: #F8FAFB; border-radius: 10px;
      padding: 8px 12px; width: 100%;
      mat-icon { font-size: 15px; width: 15px; height: 15px; color: #B0C4D4; flex-shrink: 0; }
    }
  `]
})
export class HospitalAppointmentsComponent implements OnInit {
  allAppts: Appt[] = [];
  filtered: Appt[] = [];
  selected: Appt | null = null;
  loading = true;

  searchQ = '';
  filterStatus = '';
  sortBy = 'date-asc';
  viewMode: 'week' | 'all' = 'week';

  // Week strip
  weekStart: Date = this.getMonday(new Date());
  weekDays: WeekDay[] = [];
  selectedDate: Date | null = null;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.buildWeek();
    this.api.get<any>('/appointments/hospital').subscribe({
      next: res => {
        this.allAppts = res.data ?? [];
        this.buildWeek();
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Week strip helpers ──
  getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const m = new Date(d);
    m.setDate(d.getDate() + diff);
    m.setHours(0, 0, 0, 0);
    return m;
  }

  buildWeek(): void {
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(this.weekStart.getDate() + i);
      const ds = this.toDateStr(d);
      const count = this.allAppts.filter(a => a.apptDate === ds).length;
      return {
        date: d,
        label: ds,
        dayNum: d.getDate().toString().padStart(2, '0'),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      };
    });
  }

  weekRangeLabel(): string {
    const end = new Date(this.weekStart);
    end.setDate(this.weekStart.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${this.weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  }

  weekTotal(): number {
    const start = this.toDateStr(this.weekStart);
    const end = new Date(this.weekStart); end.setDate(this.weekStart.getDate() + 6);
    const endStr = this.toDateStr(end);
    return this.allAppts.filter(a => a.apptDate >= start && a.apptDate <= endStr).length;
  }

  prevWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.selectedDate = null; // reset day selection when navigating weeks
    this.buildWeek();
    this.applyFilters();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.selectedDate = null; // reset day selection when navigating weeks
    this.buildWeek();
    this.applyFilters();
  }

  selectDay(d: Date): void {
    this.selectedDate = this.isSelectedDay(d) ? null : d;
    this.applyFilters();
  }

  clearDateFilter(): void {
    this.selectedDate = null;
    this.applyFilters();
  }

  isSelectedDay(d: Date): boolean {
    return !!this.selectedDate && this.toDateStr(d) === this.toDateStr(this.selectedDate);
  }

  isToday(d: Date): boolean {
    return this.toDateStr(d) === this.toDateStr(new Date());
  }

  toDateStr(d: Date): string {
    // Use local date components — .toISOString() returns UTC which shifts the date
    // for users in timezones ahead of UTC (e.g. IST UTC+5:30 midnight → previous UTC day)
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  // ── Filters ──
  applyFilters(): void {
    const q = this.searchQ.toLowerCase();
    const ds = this.selectedDate ? this.toDateStr(this.selectedDate) : null;

    // Compute week boundaries (used only in 'week' mode)
    const weekStartStr = this.toDateStr(this.weekStart);
    const weekEndDate = new Date(this.weekStart);
    weekEndDate.setDate(this.weekStart.getDate() + 6);
    const weekEndStr = this.toDateStr(weekEndDate);

    let list = this.allAppts.filter(a => {
      const matchSearch = !q || [a.petName, a.userName, a.doctorName, a.reason, a.petSpecies, a.userEmail]
        .some(v => v?.toLowerCase().includes(q));
      const matchStatus = !this.filterStatus || a.status === this.filterStatus;
      let matchDate: boolean;
      if (ds) {
        // A specific day is selected — always filter to that day regardless of mode
        matchDate = a.apptDate === ds;
      } else if (this.viewMode === 'week') {
        // Week mode, no specific day → constrain to the displayed week
        matchDate = a.apptDate >= weekStartStr && a.apptDate <= weekEndStr;
      } else {
        // All-time mode, no specific day → no date constraint
        matchDate = true;
      }
      return matchSearch && matchStatus && matchDate;
    });

    const statusOrder: Record<string, number> = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 };
    list = list.sort((a, b) => {
      if (this.sortBy === 'date-asc')      return a.apptDate.localeCompare(b.apptDate) || a.apptTime.localeCompare(b.apptTime);
      if (this.sortBy === 'date-desc')     return b.apptDate.localeCompare(a.apptDate) || b.apptTime.localeCompare(a.apptTime);
      if (this.sortBy === 'pending-first') return (a.status === 'PENDING' ? -1 : 1) - (b.status === 'PENDING' ? -1 : 1);
      if (this.sortBy === 'status')        return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      return 0;
    });

    this.filtered = list;
  }

  clearFilters(): void {
    this.searchQ = '';
    this.filterStatus = '';
    this.sortBy = 'date-asc';
    this.selectedDate = null;
    this.applyFilters();
  }

  switchView(mode: 'week' | 'all'): void {
    this.viewMode = mode;
    this.selectedDate = null; // clear any pinned day when switching modes
    this.applyFilters();
  }

  // ── Stat helpers ──
  countBy(status: string): number {
    if (this.viewMode === 'all') {
      return this.allAppts.filter(a => a.status === status).length;
    }
    // Week mode — count within the currently displayed week
    const start = this.toDateStr(this.weekStart);
    const endDate = new Date(this.weekStart);
    endDate.setDate(this.weekStart.getDate() + 6);
    const end = this.toDateStr(endDate);
    return this.allAppts.filter(a => a.status === status && a.apptDate >= start && a.apptDate <= end).length;
  }

  // ── Date / time formatting ──
  getDay(date: string): string {
    if (!date) return '—';
    return new Date(date + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  getMonth(date: string): string {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
  }

  formatTime(time: string): string {
    if (!time) return '—';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  // ── Date guard — returns true if appointment date is today or in the past ──
  isPast(apptDate: string): boolean {
    if (!apptDate) return false;
    const today = this.toDateStr(new Date());
    return apptDate <= today;
  }

  // ── Status update ──
  updateStatus(a: Appt, status: string): void {
    this.api.patch<any>(`/appointments/${a.id}/status`, { status }).subscribe({
      next: () => {
        a.status = status;
        this.buildWeek();
        this.applyFilters();
        this.snack.open(`Appointment ${status.toLowerCase()}.`, '', { duration: 2000 });
      },
      error: () => this.snack.open('Failed to update status.', '', { duration: 2500 })
    });
  }
}
