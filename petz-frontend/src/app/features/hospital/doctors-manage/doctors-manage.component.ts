import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  scheduleStart: string;
  scheduleEnd: string;
  slotDuration: number;
}

@Component({
  standalone: false,
  selector: 'app-doctors-manage',
  template: `
    <!-- ── Detail Popup ── -->
    @if (selected) {
      <div class="overlay" (click)="selected = null">
        <div class="popup" (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="popup-hdr">
            <div class="popup-hdr-inner">
              <div class="popup-avatar">{{ selected.name?.charAt(0) || 'D' }}</div>
              <div>
                <div class="popup-name">Dr. {{ selected.name }}</div>
                <div class="popup-spec">{{ selected.specialization || 'General Practice' }}</div>
              </div>
            </div>
            <button class="popup-close" (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="popup-body">

            <!-- Schedule section -->
            <div class="popup-section">
              <div class="section-label">
                <mat-icon class="sec-icon" style="color:#4F8FD4">schedule</mat-icon> Working Schedule
              </div>
              <div class="detail-grid-3">
                <div class="detail-item">
                  <span class="dk">Start Time</span>
                  <span class="dv">{{ formatTime(selected.scheduleStart) }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">End Time</span>
                  <span class="dv">{{ formatTime(selected.scheduleEnd) }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Slot Duration</span>
                  <span class="dv">{{ selected.slotDuration || '—' }} min</span>
                </div>
              </div>
            </div>

            <!-- Computed stats section -->
            <div class="popup-section">
              <div class="section-label">
                <mat-icon class="sec-icon" style="color:#2EB894">bar_chart</mat-icon> Daily Capacity
              </div>
              <div class="detail-grid-3">
                <div class="detail-item">
                  <span class="dk">Slots / Day</span>
                  <span class="dv" style="color:#4F8FD4">{{ slotsPerDay(selected) }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Hours / Day</span>
                  <span class="dv" style="color:#2EB894">{{ hoursPerDay(selected) }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">Specialization</span>
                  <span class="dv" style="color:#7C62CC;font-size:0.75rem">{{ selected.specialization || 'General' }}</span>
                </div>
              </div>
            </div>

            <!-- Schedule visual bar -->
            @if (selected.scheduleStart && selected.scheduleEnd) {
              <div class="popup-section">
                <div class="section-label">
                  <mat-icon class="sec-icon" style="color:#E89340">timeline</mat-icon> Day Timeline
                </div>
                <div class="timeline-wrap">
                  <span class="tl-label">{{ formatTime(selected.scheduleStart) }}</span>
                  <div class="tl-track">
                    <div class="tl-fill" [style.left]="timelineLeft(selected) + '%'"
                         [style.width]="timelineWidth(selected) + '%'">
                      <span class="tl-inner">{{ slotsPerDay(selected) }} slots</span>
                    </div>
                  </div>
                  <span class="tl-label">{{ formatTime(selected.scheduleEnd) }}</span>
                </div>
              </div>
            }

          </div>

          <!-- Actions -->
          <div class="popup-actions">
            <button mat-raised-button class="action-delete"
                    (click)="deleteDoctor(selected.id); selected = null">
              <mat-icon>delete_outline</mat-icon> Remove Doctor
            </button>
            <button mat-stroked-button class="action-close" (click)="selected = null">Close</button>
          </div>
        </div>
      </div>
    }

    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/hospital" class="back-btn" title="Back to Hospital Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Manage Doctors</h1>
            <p>Add and manage your hospital's medical staff</p>
          </div>
        </div>
        <div class="page-header-actions">
          <button mat-raised-button color="primary" (click)="showForm = !showForm">
            <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
            {{ showForm ? 'Cancel' : 'Add Doctor' }}
          </button>
        </div>
      </div>

      <!-- Stat strip -->
      <div class="stat-strip">
        <div class="stat-item">
          <div class="stat-val">{{ doctors.length }}</div>
          <div class="stat-label">Total Doctors</div>
          <div class="stat-bar" style="background:#4F8FD4"></div>
        </div>
        <div class="stat-item">
          <div class="stat-val" style="color:#7C62CC">{{ uniqueSpecs() }}</div>
          <div class="stat-label">Specializations</div>
          <div class="stat-bar" style="background:#7C62CC"></div>
        </div>
        <div class="stat-item">
          <div class="stat-val" style="color:#2EB894">{{ scheduledCount() }}</div>
          <div class="stat-label">With Schedule</div>
          <div class="stat-bar" style="background:#2EB894"></div>
        </div>
        <div class="stat-item">
          <div class="stat-val" style="color:#E89340">{{ totalDailySlots() }}</div>
          <div class="stat-label">Slots / Day</div>
          <div class="stat-bar" style="background:#E89340"></div>
        </div>
      </div>

      <!-- Add Doctor form -->
      @if (showForm) {
        <div class="card" style="padding:28px;margin-bottom:24px">
          <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#8BA3B5;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #E0EBF2">
            New Doctor Details
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Full Name *</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">person</mat-icon>
                <input matInput [(ngModel)]="newDoc.name" placeholder="Dr. Jane Smith">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Specialization</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">medical_services</mat-icon>
                <input matInput [(ngModel)]="newDoc.specialization" placeholder="e.g. Surgery, Dermatology">
              </mat-form-field>
            </div>
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Schedule Start</label>
              <div class="time-picker">
                <mat-icon class="time-ico">schedule</mat-icon>
                <select class="tp-sel tp-hour" [(ngModel)]="startHour" (ngModelChange)="updateTimes()">
                  @for (h of hours; track h) { <option [value]="h">{{ h }}</option> }
                </select>
                <span class="tp-sep">:</span>
                <select class="tp-sel tp-min" [(ngModel)]="startMin" (ngModelChange)="updateTimes()">
                  @for (m of minutes; track m) { <option [value]="m">{{ m }}</option> }
                </select>
                <select class="tp-sel tp-ampm" [(ngModel)]="startAmPm" (ngModelChange)="updateTimes()">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Schedule End</label>
              <div class="time-picker">
                <mat-icon class="time-ico">schedule</mat-icon>
                <select class="tp-sel tp-hour" [(ngModel)]="endHour" (ngModelChange)="updateTimes()">
                  @for (h of hours; track h) { <option [value]="h">{{ h }}</option> }
                </select>
                <span class="tp-sep">:</span>
                <select class="tp-sel tp-min" [(ngModel)]="endMin" (ngModelChange)="updateTimes()">
                  @for (m of minutes; track m) { <option [value]="m">{{ m }}</option> }
                </select>
                <select class="tp-sel tp-ampm" [(ngModel)]="endAmPm" (ngModelChange)="updateTimes()">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Slot Duration (minutes)</label>
            <mat-form-field appearance="outline" style="max-width:200px">
              <input matInput type="number" [(ngModel)]="newDoc.slotDuration" placeholder="30">
            </mat-form-field>
          </div>
          <div style="display:flex;gap:10px;margin-top:8px">
            <button mat-raised-button color="primary" (click)="addDoctor()"
                    [disabled]="!newDoc.name" style="border-radius:12px;height:42px">
              <mat-icon>save</mat-icon> Save Doctor
            </button>
            <button mat-stroked-button (click)="showForm = false"
                    style="border-radius:12px;height:42px;color:#4A6478;border-color:#C8DCE8">
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- Filter bar -->
      @if (doctors.length > 0) {
        <div class="filter-bar">
          <div class="search-wrap">
            <mat-icon class="search-icon">search</mat-icon>
            <input class="search-input" placeholder="Search by name or specialization…"
                   [(ngModel)]="searchQ" (ngModelChange)="applyFilters()">
            @if (searchQ) {
              <button class="clear-btn" (click)="searchQ=''; applyFilters()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
          <div class="filter-selects">
            <label class="select-wrap">
              <span class="sel-label">Specialization</span>
              <select [(ngModel)]="filterSpec" (ngModelChange)="applyFilters()">
                <option value="">All</option>
                @for (s of specOptions; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </label>
            <label class="select-wrap">
              <span class="sel-label">Sort</span>
              <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="slots-desc">Most Slots</option>
                <option value="slots-asc">Fewest Slots</option>
                <option value="spec">By Specialization</option>
              </select>
            </label>
          </div>
          @if (searchQ || filterSpec) {
            <button mat-stroked-button class="clear-all-btn" (click)="clearFilters()">
              <mat-icon>filter_alt_off</mat-icon> Clear
            </button>
          }
        </div>
      }

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading doctors...</span>
        </div>
      }

      <!-- Empty state -->
      @if (!loading && doctors.length === 0) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon"><mat-icon>medical_services</mat-icon></div>
            <h3>No doctors added</h3>
            <p>Add medical staff so patients can book appointments.</p>
            <button mat-raised-button color="primary" (click)="showForm = true" style="margin-top:8px">
              <mat-icon>add</mat-icon> Add First Doctor
            </button>
          </div>
        </div>
      }

      <!-- No match -->
      @if (!loading && doctors.length > 0 && filtered.length === 0) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon"><mat-icon>search_off</mat-icon></div>
            <h3>No matches</h3>
            <p>No doctors match the current filters.</p>
            <button mat-stroked-button (click)="clearFilters()" style="margin-top:8px">Clear Filters</button>
          </div>
        </div>
      }

      <!-- Doctor cards grid -->
      @if (!loading && filtered.length > 0) {
        <div class="doc-grid">
          @for (d of filtered; track d.id) {
            <div class="doc-card" (click)="selected = d">
              <!-- Top stripe -->
              <div class="doc-stripe"></div>

              <!-- Avatar + name -->
              <div class="doc-card-header">
                <div class="doc-avatar-lg">{{ d.name?.charAt(0) || 'D' }}</div>
                <div class="doc-title">
                  <div class="doc-name">Dr. {{ d.name }}</div>
                  <div class="doc-spec-tag">{{ d.specialization || 'General Practice' }}</div>
                </div>
              </div>

              <!-- Schedule info -->
              <div class="doc-schedule">
                @if (d.scheduleStart && d.scheduleEnd) {
                  <div class="sched-row">
                    <mat-icon class="sched-icon">schedule</mat-icon>
                    <span>{{ formatTime(d.scheduleStart) }} – {{ formatTime(d.scheduleEnd) }}</span>
                  </div>
                  <div class="sched-row">
                    <mat-icon class="sched-icon">grid_view</mat-icon>
                    <span>{{ slotsPerDay(d) }} slots · {{ d.slotDuration || '—' }} min each</span>
                  </div>
                } @else {
                  <div class="sched-row no-schedule">
                    <mat-icon class="sched-icon">event_busy</mat-icon>
                    <span>No schedule set</span>
                  </div>
                }
              </div>

              <!-- Slot bar -->
              @if (d.scheduleStart && d.scheduleEnd) {
                <div class="slot-bar-wrap">
                  <div class="slot-bar-track">
                    <div class="slot-bar-fill"
                         [style.width]="slotBarPercent(d) + '%'"></div>
                  </div>
                  <span class="slot-bar-label">{{ slotsPerDay(d) }}/day</span>
                </div>
              }

              <!-- Card footer -->
              <div class="doc-card-footer">
                <button mat-stroked-button class="detail-btn" (click)="selected = d; $event.stopPropagation()">
                  <mat-icon>info_outline</mat-icon> Details
                </button>
                <button mat-icon-button class="del-btn"
                        (click)="deleteDoctor(d.id); $event.stopPropagation()" title="Remove">
                  <mat-icon>delete_outline</mat-icon>
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
      width: 500px; max-width: 96vw; max-height: 88vh;
      overflow-y: auto; box-shadow: 0 24px 64px rgba(15,30,45,0.25);
      animation: slideUp 0.22s ease;
    }
    @keyframes slideUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }

    .popup-hdr {
      background: linear-gradient(135deg, #0A5840 0%, #1E9A7A 60%, #4F8FD4 100%);
      border-radius: 20px 20px 0 0; padding: 22px 22px 18px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .popup-hdr-inner { display: flex; align-items: center; gap: 14px; }
    .popup-avatar {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(255,255,255,0.2);
      color: #fff; font-weight: 900; font-size: 1.3rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.3);
    }
    .popup-name { font-size: 1.1rem; font-weight: 800; color: #fff; }
    .popup-spec { font-size: 0.78rem; color: rgba(255,255,255,0.75); margin-top: 3px; }
    .popup-close {
      background: rgba(255,255,255,0.15) !important; border: none !important;
      color: #fff !important; border-radius: 10px !important;
      width: 34px !important; height: 34px !important; flex-shrink: 0;
      &:hover { background: rgba(255,255,255,0.25) !important; }
      mat-icon { font-size: 18px; width:18px; height:18px; }
    }

    .popup-body { padding: 18px 22px 8px; }
    .popup-section { margin-bottom: 20px; }
    .section-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
      color: #8BA3B5; margin-bottom: 10px;
    }
    .sec-icon { font-size: 14px; width:14px; height:14px; }
    .detail-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .detail-item {
      background: #F8FAFB; border-radius: 10px; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 3px;
    }
    .dk { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #8BA3B5; }
    .dv { font-size: 0.88rem; font-weight: 800; color: #1A3547; }

    /* Timeline */
    .timeline-wrap {
      display: flex; align-items: center; gap: 10px;
    }
    .tl-label { font-size: 0.7rem; font-weight: 700; color: #8BA3B5; white-space: nowrap; }
    .tl-track {
      flex: 1; height: 28px; background: #F0F4F8; border-radius: 8px; position: relative; overflow: hidden;
    }
    .tl-fill {
      position: absolute; top: 0; bottom: 0;
      background: linear-gradient(90deg, #2EB894, #4F8FD4);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      min-width: 60px;
    }
    .tl-inner { font-size: 0.68rem; font-weight: 700; color: #fff; white-space: nowrap; }

    .popup-actions {
      padding: 14px 22px 20px; display: flex; gap: 8px;
      border-top: 1px solid #F0F4F8;
    }
    .action-delete {
      background: linear-gradient(135deg, #7B1A1A, #C03030) !important;
      color: #fff !important; border-radius: 10px !important; font-weight: 700 !important;
      mat-icon { margin-right: 6px; font-size: 16px; width:16px; height:16px; }
    }
    .action-close {
      border-color: #E0EBF2 !important; color: #8BA3B5 !important;
      border-radius: 10px !important; margin-left: auto;
      &:hover { border-color: #4F8FD4 !important; color: #4F8FD4 !important; }
    }

    /* ── Stat strip ── */
    .stat-strip {
      display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;
    }
    .stat-item {
      flex: 1; min-width: 100px; background: #fff;
      border: 1px solid #E0EBF2; border-radius: 14px;
      padding: 14px 16px 10px; position: relative; overflow: hidden;
      transition: all 0.18s ease;
      &:hover { box-shadow: 0 4px 16px rgba(26,53,71,0.08); }
    }
    .stat-val   { font-size: 1.5rem; font-weight: 900; color: #1A3547; line-height: 1; }
    .stat-label { font-size: 0.7rem; font-weight: 600; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
    .stat-bar   { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; opacity: 0.6; }

    /* ── Filter bar ── */
    .filter-bar {
      display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
    }
    .search-wrap {
      flex: 1; min-width: 200px;
      display: flex; align-items: center; gap: 8px;
      background: #fff; border: 1.5px solid #E0EBF2; border-radius: 12px;
      padding: 0 12px; height: 42px;
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
      padding: 4px 12px 6px; cursor: pointer;
      &:focus-within { border-color: #4F8FD4; }
    }
    .sel-label { font-size: 0.6rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.06em; }
    .select-wrap select {
      border: none; outline: none; background: transparent;
      font-size: 0.82rem; font-weight: 600; color: #1A3547; cursor: pointer; min-width: 120px;
    }
    .clear-all-btn {
      border-color: #E0EBF2 !important; color: #8BA3B5 !important; border-radius: 10px !important;
      height: 42px !important;
      mat-icon { font-size: 16px; width:16px; height:16px; margin-right: 4px; }
      &:hover { border-color: #E05858 !important; color: #E05858 !important; }
    }

    /* ── Doctor cards grid ── */
    .doc-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
    }
    .doc-card {
      background: #fff; border: 1.5px solid #E0EBF2; border-radius: 18px;
      overflow: hidden; cursor: pointer; transition: all 0.2s ease; position: relative;
      display: flex; flex-direction: column;
      &:hover {
        border-color: #2EB894; box-shadow: 0 8px 28px rgba(46,184,148,0.14);
        transform: translateY(-3px);
      }
    }
    .doc-stripe {
      height: 4px;
      background: linear-gradient(90deg, #2EB894, #4F8FD4);
    }
    .doc-card-header {
      display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px;
    }
    .doc-avatar-lg {
      width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
      background: linear-gradient(135deg, #1A7A5E, #2EB894);
      color: #fff; font-weight: 900; font-size: 1.15rem;
      display: flex; align-items: center; justify-content: center;
    }
    .doc-name { font-weight: 800; font-size: 0.95rem; color: #1A3547; }
    .doc-spec-tag {
      display: inline-block; margin-top: 4px;
      background: #EDE9FE; color: #5B21B6;
      font-size: 0.67rem; font-weight: 700; border-radius: 999px;
      padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.05em;
    }

    .doc-schedule {
      padding: 0 16px 12px; flex: 1;
    }
    .sched-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.78rem; color: #4A6478; font-weight: 600; margin-bottom: 5px;
    }
    .sched-icon { font-size: 14px; width:14px; height:14px; color: #8BA3B5; flex-shrink: 0; }
    .no-schedule { color: #B0C4D4; font-style: italic; }

    .slot-bar-wrap {
      padding: 0 16px 14px; display: flex; align-items: center; gap: 8px;
    }
    .slot-bar-track {
      flex: 1; height: 6px; background: #F0F4F8; border-radius: 999px; overflow: hidden;
    }
    .slot-bar-fill {
      height: 100%; background: linear-gradient(90deg, #2EB894, #4F8FD4);
      border-radius: 999px; transition: width 0.5s ease;
    }
    .slot-bar-label { font-size: 0.68rem; font-weight: 700; color: #4F8FD4; white-space: nowrap; }

    .doc-card-footer {
      padding: 10px 14px 14px;
      display: flex; align-items: center; gap: 8px;
      border-top: 1px solid #F0F4F8;
    }
    .detail-btn {
      flex: 1; border-radius: 10px !important; border-color: #E0EBF2 !important;
      color: #4A6478 !important; font-size: 0.78rem !important; font-weight: 600 !important;
      height: 34px !important;
      mat-icon { font-size: 15px; width:15px; height:15px; margin-right: 4px; }
      &:hover { border-color: #2EB894 !important; color: #2EB894 !important; background: #F0FDF4 !important; }
    }
    .del-btn {
      width: 34px !important; height: 34px !important; border-radius: 9px !important;
      color: #8BA3B5 !important;
      &:hover { color: #DC2626 !important; background: #FEE2E2 !important; }
      mat-icon { font-size: 17px; }
    }

    /* ── Common ── */
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #E0EBF2 !important; color: #4A6478 !important; flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .field-group { margin-bottom: 4px; }
    .field-label { display: block; font-size: 0.78rem; font-weight: 700; color: #1A3547; margin-bottom: 6px; }
    @media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }

    /* ── Time picker dropdowns ── */
    .time-picker {
      display: flex; align-items: center; gap: 4px;
      background: #fff; border: 1.5px solid #C8DCE8; border-radius: 12px;
      padding: 0 14px; height: 56px; transition: border-color 0.2s;
      &:focus-within { border-color: #4F8FD4; box-shadow: 0 0 0 3px rgba(79,143,212,0.1); }
    }
    .time-ico {
      color: #8BA3B5; font-size: 20px; width: 20px; height: 20px;
      flex-shrink: 0; margin-right: 8px;
    }
    .tp-sel {
      border: none; outline: none; background: transparent;
      font-family: inherit; font-weight: 700; color: #1A3547;
      cursor: pointer; appearance: none; -webkit-appearance: none;
      text-align: center;
    }
    .tp-hour { font-size: 1.05rem; width: 32px; }
    .tp-min  { font-size: 1.05rem; width: 32px; }
    .tp-ampm {
      font-size: 0.78rem; font-weight: 800; letter-spacing: 0.04em;
      background: #EEF4FA; color: #4F8FD4; border-radius: 8px;
      padding: 4px 10px; margin-left: 6px; cursor: pointer;
      transition: background 0.15s;
      &:hover { background: #D9ECFC; }
    }
    .tp-sep {
      font-size: 1.1rem; font-weight: 900; color: #8BA3B5;
      margin: 0 1px; line-height: 1; user-select: none;
    }
  `]
})
export class DoctorsManageComponent implements OnInit {
  doctors: Doctor[] = [];
  filtered: Doctor[] = [];
  selected: Doctor | null = null;
  loading = true;

  showForm = false;
  newDoc: any = { slotDuration: 30 };

  // Time picker state
  readonly hours   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  readonly minutes = ['00','15','30','45'];
  startHour = '9';  startMin = '00';  startAmPm = 'AM';
  endHour   = '5';  endMin   = '00';  endAmPm   = 'PM';

  searchQ = '';
  filterSpec = '';
  sortBy = 'name-asc';
  specOptions: string[] = [];

  hospitalId: number | null = null;
  private maxSlots = 1; // for slot bar scaling

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.updateTimes(); // pre-populate newDoc with default start/end times
    this.api.get<any>('/hospitals/profile').subscribe({
      next: res => {
        this.hospitalId = res.data?.id;
        if (this.hospitalId) {
          this.api.get<any>(`/hospitals/public/${this.hospitalId}/doctors`).subscribe(r => {
            this.doctors = r.data ?? [];
            this.buildMeta();
            this.applyFilters();
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  buildMeta(): void {
    const specs = [...new Set(this.doctors.map(d => d.specialization).filter(Boolean))];
    this.specOptions = specs.sort();
    const slots = this.doctors.map(d => this.slotsPerDay(d));
    this.maxSlots = Math.max(...slots, 1);
  }

  applyFilters(): void {
    const q = this.searchQ.toLowerCase();
    let list = this.doctors.filter(d => {
      const matchQ = !q || d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q);
      const matchSpec = !this.filterSpec || d.specialization === this.filterSpec;
      return matchQ && matchSpec;
    });

    list = list.sort((a, b) => {
      if (this.sortBy === 'name-asc')    return (a.name || '').localeCompare(b.name || '');
      if (this.sortBy === 'name-desc')   return (b.name || '').localeCompare(a.name || '');
      if (this.sortBy === 'slots-desc')  return this.slotsPerDay(b) - this.slotsPerDay(a);
      if (this.sortBy === 'slots-asc')   return this.slotsPerDay(a) - this.slotsPerDay(b);
      if (this.sortBy === 'spec')        return (a.specialization || '').localeCompare(b.specialization || '');
      return 0;
    });

    this.filtered = list;
  }

  clearFilters(): void {
    this.searchQ = '';
    this.filterSpec = '';
    this.sortBy = 'name-asc';
    this.applyFilters();
  }

  // ── Time picker helpers ──
  updateTimes(): void {
    this.newDoc.scheduleStart = this.to24(this.startHour, this.startMin, this.startAmPm);
    this.newDoc.scheduleEnd   = this.to24(this.endHour,   this.endMin,   this.endAmPm);
  }

  private to24(hour: string, min: string, ampm: string): string {
    let h = parseInt(hour, 10);
    if (ampm === 'AM' && h === 12) h = 0;
    if (ampm === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${min}`;
  }

  private resetTimePicker(): void {
    this.startHour = '9';  this.startMin = '00';  this.startAmPm = 'AM';
    this.endHour   = '5';  this.endMin   = '00';  this.endAmPm   = 'PM';
    this.updateTimes();
  }

  // ── Computed helpers ──
  slotsPerDay(d: Doctor): number {
    if (!d.scheduleStart || !d.scheduleEnd || !d.slotDuration) return 0;
    const [sh, sm] = d.scheduleStart.split(':').map(Number);
    const [eh, em] = d.scheduleEnd.split(':').map(Number);
    const totalMin = (eh * 60 + em) - (sh * 60 + sm);
    return totalMin > 0 ? Math.floor(totalMin / d.slotDuration) : 0;
  }

  hoursPerDay(d: Doctor): string {
    if (!d.scheduleStart || !d.scheduleEnd) return '—';
    const [sh, sm] = d.scheduleStart.split(':').map(Number);
    const [eh, em] = d.scheduleEnd.split(':').map(Number);
    const totalMin = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMin <= 0) return '—';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  slotBarPercent(d: Doctor): number {
    const s = this.slotsPerDay(d);
    return this.maxSlots > 0 ? Math.round((s / this.maxSlots) * 100) : 0;
  }

  timelineLeft(d: Doctor): number {
    if (!d.scheduleStart) return 0;
    const [h, m] = d.scheduleStart.split(':').map(Number);
    return Math.round(((h * 60 + m) / (24 * 60)) * 100);
  }

  timelineWidth(d: Doctor): number {
    if (!d.scheduleStart || !d.scheduleEnd) return 0;
    const [sh, sm] = d.scheduleStart.split(':').map(Number);
    const [eh, em] = d.scheduleEnd.split(':').map(Number);
    const dur = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(Math.round((dur / (24 * 60)) * 100), 5);
  }

  // ── Stat strip ──
  uniqueSpecs(): number {
    return new Set(this.doctors.map(d => d.specialization).filter(Boolean)).size;
  }

  scheduledCount(): number {
    return this.doctors.filter(d => d.scheduleStart && d.scheduleEnd).length;
  }

  totalDailySlots(): number {
    return this.doctors.reduce((sum, d) => sum + this.slotsPerDay(d), 0);
  }

  formatTime(t: string): string {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  addDoctor(): void {
    if (!this.newDoc.name) return;
    this.api.post<any>('/hospitals/profile/doctors', this.newDoc).subscribe({
      next: res => {
        this.doctors.push(res.data);
        this.buildMeta();
        this.applyFilters();
        this.showForm = false;
        this.newDoc = { slotDuration: 30 };
        this.resetTimePicker();
        this.snack.open('Doctor added successfully!', '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error adding doctor.', 'Close', { duration: 3000 })
    });
  }

  deleteDoctor(id: number): void {
    if (!confirm('Remove this doctor from your hospital?')) return;
    this.api.delete<any>(`/hospitals/profile/doctors/${id}`).subscribe(() => {
      this.doctors = this.doctors.filter(d => d.id !== id);
      this.buildMeta();
      this.applyFilters();
      this.snack.open('Doctor removed.', '', { duration: 2000 });
    });
  }
}
