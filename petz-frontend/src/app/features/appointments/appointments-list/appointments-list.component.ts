import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  standalone: false,
  selector: 'app-appointments-list',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center">
          <button mat-icon-button routerLink="/dashboard"
                  style="background:#fff;border:1px solid #F0E0D6;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
          </button>
          <div>
            <h1>My Appointments</h1>
            <p>Track all your scheduled vet visits</p>
          </div>
        </div>
        <div class="page-header-actions">
          <button mat-raised-button color="primary" routerLink="/appointments/book">
            <mat-icon>add</mat-icon> Book Appointment
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Fetching appointments...</span>
        </div>
      }

      @if (!loading) {
        <!-- Empty -->
        @if (appointments.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon">
                <mat-icon>event_busy</mat-icon>
              </div>
              <h3>No appointments</h3>
              <p>You haven't booked any vet visits yet. Schedule one for your pet today.</p>
              <button mat-raised-button color="primary" routerLink="/appointments/book" style="margin-top:8px">
                <mat-icon>add</mat-icon> Book Now
              </button>
            </div>
          </div>
        }

        @if (appointments.length > 0) {

          <!-- Stat strip -->
          <div class="stat-strip">
            <div class="stat-pill">
              <span class="stat-num">{{ appointments.length }}</span>
              <span class="stat-lbl">Total</span>
            </div>
            <div class="stat-pill stat-upcoming">
              <span class="stat-num">{{ upcomingCount }}</span>
              <span class="stat-lbl">Upcoming</span>
            </div>
            <div class="stat-pill stat-completed">
              <span class="stat-num">{{ completedCount }}</span>
              <span class="stat-lbl">Completed</span>
            </div>
          </div>

          <!-- Week Strip -->
          <div class="week-strip-card">

            <!-- All-appointments toggle — distinct from day cells -->
            <div class="week-all-row">
              <button class="all-btn" [class.all-btn-active]="!selectedDate"
                      (click)="selectedDate = null; applyFilters()">
                <mat-icon>event_note</mat-icon>
                All Appointments
                <span class="all-count">{{ appointments.length }}</span>
              </button>
              <span class="week-label">
                Week of {{ weekDays[0]?.num }} – {{ weekDays[6]?.num }}
                {{ weekDays[6]?.label }}
              </span>
            </div>

            <!-- 7-day strip -->
            <div class="week-nav">
              <button class="week-nav-btn" (click)="changeWeek(-1)">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <div class="week-days">
                @for (d of weekDays; track d.key) {
                  <div class="day-cell"
                       [class.day-selected]="selectedDate === d.key"
                       [class.day-today]="d.isToday"
                       (click)="selectDay(d.key)">
                    <span class="day-lbl">{{ d.label }}</span>
                    <span class="day-num">{{ d.num }}</span>
                    @if (d.hasAppts) { <span class="day-dot"></span> }
                    @else { <span class="day-dot-empty"></span> }
                  </div>
                }
              </div>
              <button class="week-nav-btn" (click)="changeWeek(1)">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

          </div>

          <!-- Filter Bar -->
          <div class="filter-bar-card">
            <div class="search-wrap">
              <mat-icon class="search-icon">search</mat-icon>
              <input class="search-input" [(ngModel)]="filter.search" (ngModelChange)="applyFilters()"
                     placeholder="Search by reason, hospital, doctor…">
            </div>
            <div class="select-group">
              <label class="select-label">Status</label>
              <select class="fsel" [(ngModel)]="filter.status" (ngModelChange)="applyFilters()">
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div class="select-group">
              <label class="select-label">Sort</label>
              <select class="fsel" [(ngModel)]="filter.sort" (ngModelChange)="applyFilters()">
                <option value="upcoming">Upcoming First</option>
                <option value="newest">Newest Booked</option>
                <option value="oldest">Oldest Booked</option>
              </select>
            </div>
            @if (hasActiveFilters) {
              <button class="clear-btn" (click)="clearFilters()">
                <mat-icon>close</mat-icon> Clear
              </button>
            }
          </div>

          <!-- Results count -->
          <div class="results-count">Showing {{ filtered.length }} of {{ appointments.length }} appointments</div>

          <!-- Appointments list -->
          <div class="card-flat">
            @for (a of filtered; track a.id) {
              <div class="appt-row" (click)="selected = a" style="cursor:pointer">
                <div class="appt-date-badge">
                  <div class="appt-day">{{ getDay(a.apptDate) }}</div>
                  <div class="appt-month">{{ getMonth(a.apptDate) }}</div>
                </div>

                <div class="appt-details">
                  <div class="appt-title">{{ a.reason || 'General Checkup' }}</div>
                  <div class="appt-sub">
                    <mat-icon>schedule</mat-icon>
                    {{ a.apptTime || '—' }}
                  </div>
                </div>

                <div class="appt-right">
                  <span class="chip" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
                  @if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
                    <button mat-icon-button class="cancel-btn"
                            (click)="cancel(a.id); $event.stopPropagation()" title="Cancel appointment">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  }
                </div>
              </div>
            }
            @if (filtered.length === 0) {
              <div style="padding:32px;text-align:center;color:#8BA3B5;font-size:0.88rem">
                No appointments match your filters.
              </div>
            }
          </div>
        }
      }

    </div>

    <!-- Detail Modal -->
    @if (selected) {
      <div class="modal-backdrop" (click)="selected = null">
        <div class="modal-card" (click)="$event.stopPropagation()">

          <div class="modal-header">
            <div>
              <div class="modal-title">Appointment Details</div>
              <div class="modal-sub">{{ formatFullDate(selected.apptDate) }}</div>
            </div>
            <button mat-icon-button (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="modal-body">

            <div class="detail-row">
              <mat-icon class="detail-icon">event</mat-icon>
              <div>
                <div class="detail-label">Date</div>
                <div class="detail-value">{{ formatFullDate(selected.apptDate) }}</div>
              </div>
            </div>

            <div class="detail-row">
              <mat-icon class="detail-icon">schedule</mat-icon>
              <div>
                <div class="detail-label">Time</div>
                <div class="detail-value">{{ formatTime(selected.apptTime) }}</div>
              </div>
            </div>

            <div class="detail-row">
              <mat-icon class="detail-icon">info</mat-icon>
              <div>
                <div class="detail-label">Status</div>
                <span class="chip" [ngClass]="selected.status.toLowerCase()">{{ selected.status }}</span>
              </div>
            </div>

            @if (selected.hospitalName) {
              <div class="detail-row">
                <mat-icon class="detail-icon">local_hospital</mat-icon>
                <div>
                  <div class="detail-label">Hospital</div>
                  <div class="detail-value">{{ selected.hospitalName }}</div>
                  @if (selected.hospitalCity || selected.hospitalAddress) {
                    <div class="detail-meta">{{ selected.hospitalAddress }}{{ selected.hospitalCity ? ', ' + selected.hospitalCity : '' }}</div>
                  }
                </div>
              </div>
            }

            @if (selected.doctorName) {
              <div class="detail-row">
                <mat-icon class="detail-icon">person</mat-icon>
                <div>
                  <div class="detail-label">Doctor</div>
                  <div class="detail-value">Dr. {{ selected.doctorName }}</div>
                  @if (selected.doctorSpecialization) {
                    <div class="detail-meta">{{ selected.doctorSpecialization }}</div>
                  }
                </div>
              </div>
            }

            @if (selected.petName) {
              <div class="detail-row">
                <mat-icon class="detail-icon">pets</mat-icon>
                <div>
                  <div class="detail-label">Pet</div>
                  <div class="detail-value">{{ selected.petName }}</div>
                  @if (selected.petBreed || selected.petSpecies) {
                    <div class="detail-meta">{{ selected.petBreed || selected.petSpecies }}</div>
                  }
                </div>
              </div>
            }

            <div class="detail-row">
              <mat-icon class="detail-icon">medical_services</mat-icon>
              <div>
                <div class="detail-label">Reason for Visit</div>
                <div class="detail-value">{{ selected.reason || 'General Checkup' }}</div>
              </div>
            </div>

            @if (selected.notes) {
              <div class="detail-row">
                <mat-icon class="detail-icon">notes</mat-icon>
                <div>
                  <div class="detail-label">Notes</div>
                  <div class="detail-value">{{ selected.notes }}</div>
                </div>
              </div>
            }

            @if (selected.createdAt) {
              <div class="detail-row">
                <mat-icon class="detail-icon">history</mat-icon>
                <div>
                  <div class="detail-label">Booked On</div>
                  <div class="detail-value">{{ formatFullDate(selected.createdAt) }}</div>
                </div>
              </div>
            }

          </div>

          @if (selected.status === 'PENDING' || selected.status === 'CONFIRMED') {
            <div class="modal-footer">
              <button mat-stroked-button class="cancel-appt-btn"
                      (click)="cancel(selected.id); selected = null">
                <mat-icon>cancel</mat-icon> Cancel Appointment
              </button>
            </div>
          }

        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Stat strip ── */
    .stat-strip {
      display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px;
    }
    .stat-pill {
      display: flex; align-items: center; gap: 6px;
      background: #F9FBFB; border: 1px solid #E0EBF2;
      border-radius: 999px; padding: 5px 14px;
      font-size: 0.76rem; font-weight: 600; color: #4A6478;
    }
    .stat-num { font-weight: 900; font-size: 0.95rem; color: #1A3547; }
    .stat-lbl { font-size: 0.74rem; color: #8BA3B5; }
    .stat-upcoming { background: #FFF3E8; border-color: #FDBF8A; .stat-num { color: #FF8C42; } }
    .stat-completed { background: #D1FAE5; border-color: #A7F3D0; .stat-num { color: #065F46; } }

    /* ── Week strip ── */
    .week-strip-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 8px rgba(26,53,71,0.06);
      padding: 14px 16px; margin-bottom: 14px;
    }

    /* All-button row */
    .week-all-row {
      display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
    }
    .all-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #F8FAFB; border: 1.5px solid #E0EBF2; border-radius: 10px;
      padding: 6px 14px; font-size: 0.8rem; font-weight: 700; color: #4A6478;
      cursor: pointer; font-family: inherit; transition: all 0.15s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { border-color: #FF8C42; color: #FF8C42; }
    }
    .all-btn-active {
      background: #FFF3E8; border-color: #FF8C42; color: #FF8C42;
      .all-count { background: #FF8C42; color: #fff; }
    }
    .all-count {
      background: #E0EBF2; color: #4A6478; border-radius: 999px;
      padding: 1px 8px; font-size: 0.72rem; font-weight: 900;
      transition: all 0.15s;
    }
    .week-label {
      margin-left: auto; font-size: 0.72rem; color: #94A3B8; font-weight: 600;
    }

    /* Day strip */
    .week-nav { display: flex; align-items: center; gap: 6px; }
    .week-nav-btn {
      width: 32px; height: 32px; border: 1px solid #E0EBF2; border-radius: 10px;
      background: #F8FAFB; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #4A6478; }
      &:hover { border-color: #FF8C42; }
    }
    .week-days { display: flex; gap: 5px; flex: 1; }
    .day-cell {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 8px 4px; border-radius: 12px; cursor: pointer;
      background: #F8FAFB; border: 1px solid #E0EBF2;
      transition: all 0.15s;
      &:hover { border-color: #FF8C42; }
    }
    .day-selected { background: #FF8C42 !important; border-color: #FF8C42 !important;
      .day-lbl, .day-num { color: #fff !important; }
      .day-dot { background: #fff !important; }
    }
    .day-today { border-color: #FF8C42; }
    .day-lbl { font-size: 0.58rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.04em; }
    .day-num { font-size: 0.88rem; font-weight: 900; color: #1A3547; line-height: 1; }
    .day-dot { width: 5px; height: 5px; border-radius: 50%; background: #FF8C42; margin-top: 2px; }
    .day-dot-empty { width: 5px; height: 5px; margin-top: 2px; }

    /* ── Filter bar ── */
    .filter-bar-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 8px rgba(26,53,71,0.06);
      padding: 14px 18px; display: flex; gap: 10px; align-items: flex-end;
      margin-bottom: 10px; flex-wrap: wrap;
    }
    .search-wrap {
      position: relative; flex: 1; min-width: 160px;
    }
    .search-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      font-size: 16px; width: 16px; height: 16px; color: #94A3B8;
    }
    .search-input {
      width: 100%; height: 36px; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 0 12px 0 34px; font-size: 0.82rem; background: #F8FAFB;
      color: #1A3547; outline: none; box-sizing: border-box;
      font-family: inherit;
      &::placeholder { color: #94A3B8; }
      &:focus { border-color: #FF8C42; }
    }
    .select-group { display: flex; flex-direction: column; gap: 3px; }
    .select-label { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
    .fsel {
      height: 36px; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 0 10px; font-size: 0.82rem; color: #1A3547;
      background: #F8FAFB; outline: none; cursor: pointer;
      font-family: inherit;
      &:focus { border-color: #FF8C42; }
    }
    .clear-btn {
      display: flex; align-items: center; gap: 4px;
      height: 36px; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 0 12px; background: #F8FAFB; color: #64748B;
      font-size: 0.78rem; font-weight: 600; cursor: pointer;
      font-family: inherit;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { border-color: #E05858; color: #E05858; }
    }

    .results-count {
      font-size: 0.78rem; color: #8BA3B5; font-weight: 600; margin-bottom: 10px;
    }

    /* ── Appointment rows ── */
    .appt-row {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 16px 22px;
      border-bottom: 1px solid #FAF0EB;
      transition: background 0.15s;
      &:last-child { border-bottom: none; }
      &:hover { background: #FFF7ED; }
    }
    .appt-date-badge {
      min-width: 54px;
      text-align: center;
      background: #FFEDD5;
      border-radius: 14px;
      padding: 8px 6px;
    }
    .appt-day   { font-size: 1.4rem; font-weight: 900; color: #FF8C42; line-height: 1; }
    .appt-month { font-size: 0.62rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
    .appt-details {
      flex: 1;
      min-width: 0;
    }
    .appt-title { font-weight: 700; font-size: 0.9rem; color: #1A3547; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-sub {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.77rem; color: #8BA3B5; font-weight: 500;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .appt-right {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    .cancel-btn {
      width: 32px !important; height: 32px !important; border-radius: 8px !important;
      color: #8BA3B5 !important;
      &:hover { color: #DC2626 !important; background: #FEE2E2 !important; }
      mat-icon { font-size: 16px; }
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .modal-card {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      overflow: hidden;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(24px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .modal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 22px 22px 16px;
      border-bottom: 1px solid #FAF0EB;
      background: linear-gradient(135deg, #FFF7ED 0%, #fff 100%);
    }
    .modal-title { font-size: 1.1rem; font-weight: 800; color: #1A3547; }
    .modal-sub   { font-size: 0.78rem; color: #8BA3B5; margin-top: 2px; }

    .modal-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 16px; }

    .detail-row {
      display: flex; align-items: flex-start; gap: 14px;
    }
    .detail-icon {
      color: #FF8C42; font-size: 20px; width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0;
    }
    .detail-label { font-size: 0.72rem; font-weight: 600; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
    .detail-value { font-size: 0.92rem; font-weight: 600; color: #1A3547; }
    .detail-meta  { font-size: 0.78rem; color: #8BA3B5; margin-top: 2px; }

    .modal-footer {
      padding: 14px 22px 20px;
      border-top: 1px solid #FAF0EB;
    }
    .cancel-appt-btn {
      width: 100%; border-color: #DC2626 !important; color: #DC2626 !important; border-radius: 10px !important;
      &:hover { background: #FEE2E2 !important; }
    }
  `]
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  filtered: Appointment[] = [];
  loading = true;
  cols = ['date', 'time', 'reason', 'status', 'actions'];
  selected: Appointment | null = null;

  filter = { search: '', status: '', sort: 'upcoming' };
  selectedDate: string | null = null;
  weekOffset = 0;
  weekDays: { label: string; num: string; key: string; isToday: boolean; hasAppts: boolean }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments/my').subscribe({
      next: res => {
        this.appointments = res.data ?? [];
        this.loading = false;
        this.buildWeek();
        this.applyFilters();
      },
      error: () => { this.loading = false; }
    });
  }

  buildWeek(): void {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const startOfWeek = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon
    startOfWeek.setDate(today.getDate() - dayOfWeek + this.weekOffset * 7);

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: String(d.getDate()).padStart(2, '0'),
        key,
        isToday: key === todayKey,
        hasAppts: this.appointments.some(a => a.apptDate === key)
      };
    });
  }

  changeWeek(dir: number): void {
    this.weekOffset += dir;
    this.buildWeek();
  }

  selectDay(key: string): void {
    this.selectedDate = this.selectedDate === key ? null : key;
    this.applyFilters();
  }

  applyFilters(): void {
    let r = [...this.appointments];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(a =>
      (a.reason || '').toLowerCase().includes(q) ||
      (a.hospitalName || '').toLowerCase().includes(q) ||
      (a.doctorName || '').toLowerCase().includes(q)
    );
    if (this.filter.status) r = r.filter(a => a.status === this.filter.status);
    if (this.selectedDate) r = r.filter(a => a.apptDate === this.selectedDate);
    if (this.filter.sort === 'upcoming') {
      r.sort((a, b) => (a.apptDate + a.apptTime).localeCompare(b.apptDate + b.apptTime));
    } else if (this.filter.sort === 'newest') {
      r.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else {
      r.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', sort: 'upcoming' };
    this.selectedDate = null;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filter.search || this.filter.status || this.selectedDate || this.filter.sort !== 'upcoming');
  }

  get upcomingCount(): number {
    return this.appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status === 'COMPLETED').length;
  }

  getDay(date: string): string {
    if (!date) return '—';
    return new Date(date + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  getMonth(date: string): string {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
  }

  cancel(id: number): void {
    if (!confirm('Cancel this appointment?')) return;
    this.api.delete<any>(`/appointments/${id}`).subscribe(() => {
      const a = this.appointments.find(x => x.id === id);
      if (a) a.status = 'CANCELLED';
      this.buildWeek();
      this.applyFilters();
    });
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr;
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}
