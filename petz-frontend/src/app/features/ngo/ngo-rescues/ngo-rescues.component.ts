import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { rescueStatusLabel } from '../../../core/utils/rescue-status.util';

@Component({
  standalone: false,
  selector: 'app-ngo-rescues',
  template: `
    <div class="page-wrap">

      <!-- ── Header ─────────────────────────────────────────── -->
      <div class="page-hdr">
        <div style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/ngo" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="page-title">Rescue Queue</h1>
            <p class="page-sub">Rescue assignments waiting for your response</p>
          </div>
        </div>
        @if (criticalCount > 0) {
          <div class="crit-badge">
            <div class="blink-dot"></div>
            <mat-icon>warning_amber</mat-icon>
            <span>{{ criticalCount }} critical</span>
          </div>
        }
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading rescue queue…</span>
        </div>
      }

      @if (!loading) {

        <!-- ── Stat Strip ──────────────────────────────────── -->
        @if (rescues.length > 0) {
          <div class="stat-strip">
            <div class="stat-item">
              <div class="stat-num">{{ rescues.length }}</div>
              <div class="stat-lbl">Total</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#7C62CC">{{ pendingCount }}</div>
              <div class="stat-lbl">Pending</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#E89340">{{ assignedCount }}</div>
              <div class="stat-lbl">Reported</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#F97316">{{ inProgressCount }}</div>
              <div class="stat-lbl">In Progress</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#2EB894">{{ completedCount }}</div>
              <div class="stat-lbl">Completed</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#E05858">{{ criticalCount }}</div>
              <div class="stat-lbl">Critical</div>
            </div>
          </div>
        }

        <!-- ── Filter Bar ──────────────────────────────────── -->
        <div class="filter-bar">
          <div class="search-wrap">
            <mat-icon class="search-icon">search</mat-icon>
            <input class="search-input" placeholder="Search by animal type or address…"
                   [(ngModel)]="filter.search" (ngModelChange)="applyFilters()">
          </div>
          <div class="select-group">
            <label class="select-label">Status</label>
            <select class="fsel" [(ngModel)]="filter.status" (ngModelChange)="applyFilters()">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Reported</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div class="select-group">
            <label class="select-label">Urgency</label>
            <select class="fsel" [(ngModel)]="filter.criticality" (ngModelChange)="applyFilters()">
              <option value="">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div class="select-group">
            <label class="select-label">Sort</label>
            <select class="fsel" [(ngModel)]="filter.sort" (ngModelChange)="applyFilters()">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="urgency">Urgency (High→Low)</option>
            </select>
          </div>
          @if (hasActiveFilters) {
            <button class="clear-btn" (click)="clearFilters()">
              <mat-icon>close</mat-icon> Clear
            </button>
          }
        </div>

        <!-- ── Empty: no rescues ───────────────────────────── -->
        @if (rescues.length === 0) {
          <div class="empty-card">
            <mat-icon class="empty-icon">emergency</mat-icon>
            <h3 class="empty-h3">Queue is clear</h3>
            <p class="empty-p">No rescue assignments right now. New ones will appear here.</p>
          </div>
        }

        <!-- ── Empty: filter no-results ───────────────────── -->
        @if (rescues.length > 0 && filtered.length === 0) {
          <div class="empty-card">
            <mat-icon class="empty-icon" style="color:#CBD5E1">search_off</mat-icon>
            <h3 class="empty-h3">No rescues match your filters</h3>
            <p class="empty-p">Try adjusting or clearing the active filters.</p>
            <button class="clear-btn" style="margin-top:10px" (click)="clearFilters()">
              <mat-icon>close</mat-icon> Clear Filters
            </button>
          </div>
        }

        <!-- ── Rescue Cards ────────────────────────────────── -->
        <div class="cards-list">
          @for (r of filtered; track r.id) {
            <div class="rescue-card" [class]="'border-' + critClass(r.criticality)"
                 (click)="selected = r; completionNote = ''">
              <div class="rc-left">
                <div class="rc-icon" [class]="'icon-' + critClass(r.criticality)">
                  <mat-icon>pets</mat-icon>
                </div>
                <div class="rc-info">
                  <div class="rc-title">{{ r.animalType || 'Unknown Animal' }}</div>
                  @if (r.address) {
                    <div class="rc-address">
                      <mat-icon>place</mat-icon> {{ r.address }}
                    </div>
                  }
                  @if (r.description) {
                    <div class="rc-desc">{{ r.description }}</div>
                  }
                  <div class="rc-meta-row">
                    @if (r.reportedAt) {
                      <span class="time-ago">{{ timeAgo(r.reportedAt) }}</span>
                    }
                  </div>
                </div>
              </div>
              <div class="rc-right" (click)="$event.stopPropagation()">
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                  <span class="status-chip" [ngClass]="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
                  <span class="crit-pill" [ngClass]="'crit-' + critClass(r.criticality)">{{ r.criticality }}</span>
                </div>
                <div class="rc-actions">
                  @if (r.status === 'ASSIGNED') {
                    <button class="btn-accept" (click)="respond(r.id, 'ACCEPT')">
                      <mat-icon>check</mat-icon> Accept
                    </button>
                    <button class="btn-decline" (click)="respond(r.id, 'DECLINE')">Decline</button>
                  }
                  @if (r.status === 'IN_PROGRESS') {
                    <span class="open-hint"><mat-icon>open_in_new</mat-icon> Open to complete</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>

      }

      <!-- ── Detail Popup ────────────────────────────────────── -->
      @if (selected) {
        <div class="overlay" (click)="selected = null">
          <div class="popup" (click)="$event.stopPropagation()">

            <!-- Header -->
            <div class="popup-hdr" [class]="'hdr-' + critClass(selected.criticality)">
              <div class="popup-hdr-icon">
                <mat-icon>pets</mat-icon>
              </div>
              <div class="popup-hdr-info">
                <div class="popup-crit-pill" [ngClass]="'pill-' + critClass(selected.criticality)">
                  {{ selected.criticality }}
                </div>
                <div class="popup-name">{{ selected.animalType || 'Unknown Animal' }}</div>
                @if (selected.address) {
                  <div class="popup-addr">
                    <mat-icon>place</mat-icon> {{ selected.address }}
                  </div>
                }
              </div>
              <button class="popup-close" (click)="selected = null">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Body -->
            <div class="popup-body">

              <!-- Status + time -->
              <div class="popup-status-row">
                <span class="status-chip" [ngClass]="statusClass(selected.status)">{{ statusLabel(selected.status) }}</span>
                @if (selected.reportedAt) {
                  <span class="time-ago">{{ timeAgo(selected.reportedAt) }}</span>
                  <span class="popup-date">{{ fmtDate(selected.reportedAt) }}</span>
                }
              </div>

              <!-- Detail grid -->
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">Animal Type</div>
                  <div class="detail-val">{{ selected.animalType || '—' }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Report #</div>
                  <div class="detail-val">#{{ selected.id }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Reported</div>
                  <div class="detail-val">{{ fmtDate(selected.reportedAt) }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Last Updated</div>
                  <div class="detail-val">{{ selected.updatedAt ? fmtDate(selected.updatedAt) : '—' }}</div>
                </div>
              </div>

              <!-- Reporter Contact -->
              @if (selected.reporterPhone) {
                <div class="reporter-contact-box">
                  <div class="reporter-contact-label">
                    <mat-icon>contact_phone</mat-icon> Reporter Contact
                  </div>
                  <a class="reporter-call-btn" [href]="'tel:' + selected.reporterPhone">
                    <mat-icon>call</mat-icon>
                    <span>{{ selected.reporterPhone }}</span>
                    <span class="call-hint">Tap to call</span>
                  </a>
                </div>
              }

              <!-- Photo -->
              @if (selected.photoUrl) {
                <div style="margin-bottom:14px">
                  <div class="detail-label" style="margin-bottom:6px">Photo</div>
                  <img [src]="selected.photoUrl" alt="Rescue photo" class="rescue-photo">
                </div>
              }

              <!-- Description -->
              @if (selected.description) {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Description</div>
                  <div class="notes-box">{{ selected.description }}</div>
                </div>
              }

              <!-- Resolution notes -->
              @if (selected.resolutionNotes) {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Resolution Notes</div>
                  <div class="notes-box">{{ selected.resolutionNotes }}</div>
                </div>
              }

              <!-- Complete with notes -->
              @if (selected.status === 'IN_PROGRESS') {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Completion Notes</div>
                  <textarea class="notes-input" rows="2"
                            [(ngModel)]="completionNote"
                            placeholder="Describe how the rescue was completed…"></textarea>
                </div>
              }

              <!-- Actions -->
              <div class="popup-actions">
                @if (selected.status === 'ASSIGNED') {
                  <button class="btn-accept" (click)="respond(selected.id, 'ACCEPT'); selected = null">
                    <mat-icon>check</mat-icon> Accept
                  </button>
                  <button class="btn-decline" (click)="respond(selected.id, 'DECLINE'); selected = null">
                    Decline
                  </button>
                }
                @if (selected.status === 'IN_PROGRESS') {
                  <button class="btn-complete-wide" (click)="completeWithNote(selected.id)">
                    <mat-icon>done_all</mat-icon> Mark as Complete
                  </button>
                }
              </div>

            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Layout ───────────────────────────────────────── */
    .page-wrap  { padding: 0; }
    .page-hdr   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
    .page-title { font-size: 1.6rem; font-weight: 900; color: #1A3547; margin: 0; letter-spacing: -0.02em; }
    .page-sub   { font-size: 0.82rem; color: #94A3B8; margin: 3px 0 0; }
    .back-btn   {
      width: 38px !important; height: 38px !important; border-radius: 10px !important;
      background: #fff !important; border: 1px solid #E0EBF2 !important;
      mat-icon { color: #4A6478; }
      &:hover { border-color: #FF8C42 !important; }
    }
    .crit-badge {
      display: flex; align-items: center; gap: 6px;
      background: #FEE2E2; color: #991B1B; border-radius: 999px; padding: 7px 16px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .blink-dot { width: 7px; height: 7px; border-radius: 50%; background: #E05858; animation: blink 1.4s ease-in-out infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* ── Stat Strip ───────────────────────────────────── */
    .stat-strip { display: flex; align-items: center; background: #fff; border-radius: 18px; box-shadow: 0 1px 12px rgba(26,53,71,0.07); padding: 16px 24px; margin-bottom: 16px; }
    .stat-item  { flex: 1; text-align: center; }
    .stat-num   { font-size: 1.5rem; font-weight: 900; color: #1A3547; line-height: 1; letter-spacing: -0.03em; }
    .stat-lbl   { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
    .stat-div   { width: 1px; height: 36px; background: #E8EDF3; flex-shrink: 0; }

    /* ── Filter Bar ───────────────────────────────────── */
    .filter-bar  { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; background: #fff; border-radius: 16px; box-shadow: 0 1px 8px rgba(26,53,71,0.06); padding: 14px 18px; margin-bottom: 16px; }
    .search-wrap { position: relative; flex: 1; min-width: 180px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 17px !important; width: 17px !important; height: 17px !important; color: #94A3B8; }
    .search-input { width: 100%; height: 36px; border: 1px solid #E0EBF2; border-radius: 10px; padding: 0 12px 0 34px; font-size: 0.82rem; color: #1A3547; outline: none; background: #F8FAFB; box-sizing: border-box; &:focus { border-color: #FF8C42; background: #fff; } }
    .select-group { display: flex; flex-direction: column; gap: 3px; }
    .select-label { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
    .fsel { height: 36px; border: 1px solid #E0EBF2; border-radius: 10px; padding: 0 28px 0 10px; font-size: 0.82rem; color: #1A3547; appearance: none; outline: none; cursor: pointer; background: #F8FAFB url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 8px center; &:focus { border-color: #FF8C42; background-color: #fff; } }
    .clear-btn { display: flex; align-items: center; gap: 4px; height: 36px; border: 1px solid #E0EBF2; border-radius: 10px; padding: 0 12px; background: #F8FAFB; color: #64748B; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s; mat-icon { font-size: 15px; width: 15px; height: 15px; } &:hover { border-color: #E05858; color: #E05858; background: #FEF2F2; } }

    /* ── Empty ────────────────────────────────────────── */
    .empty-card { background: #fff; border-radius: 20px; box-shadow: 0 1px 12px rgba(26,53,71,0.07); display: flex; flex-direction: column; align-items: center; padding: 52px 24px; margin-bottom: 24px; text-align: center; }
    .empty-icon { font-size: 44px !important; width: 44px !important; height: 44px !important; color: #C8DCE8; margin-bottom: 12px; }
    .empty-h3   { font-size: 1rem; font-weight: 800; color: #1A3547; margin: 0 0 6px; }
    .empty-p    { font-size: 0.82rem; color: #94A3B8; margin: 0; }
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 40px 0; color: #94A3B8; font-size: 0.85rem; }

    /* ── Rescue Cards ─────────────────────────────────── */
    .cards-list  { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .rescue-card {
      display: flex; align-items: flex-start; gap: 16px;
      background: #fff; border-radius: 18px; padding: 18px 20px;
      box-shadow: 0 2px 12px rgba(26,53,71,0.07);
      border-left: 4px solid transparent;
      cursor: pointer; transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,53,71,0.1); }
    }
    .border-critical { border-left-color: #E05858; }
    .border-high     { border-left-color: #E89340; }
    .border-medium   { border-left-color: #D4B840; }
    .border-low      { border-left-color: #2EB894; }

    .rc-left  { display: flex; gap: 14px; flex: 1; min-width: 0; }
    .rc-icon  {
      width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #fff; font-size: 22px; }
    }
    .icon-critical { background: linear-gradient(135deg, #F87171, #E05858); }
    .icon-high     { background: linear-gradient(135deg, #FBB060, #E89340); }
    .icon-medium   { background: linear-gradient(135deg, #F0D060, #D4B840); }
    .icon-low      { background: linear-gradient(135deg, #52DDB8, #2EB894); }

    .rc-info    { flex: 1; min-width: 0; }
    .rc-title   { font-weight: 800; font-size: 0.95rem; color: #1A3547; margin-bottom: 4px; }
    .rc-address { display: flex; align-items: center; gap: 3px; font-size: 0.78rem; color: #4A6478; margin-bottom: 4px; mat-icon { font-size: 13px; width: 13px; height: 13px; color: #FF8C42; } }
    .rc-desc    { font-size: 0.8rem; color: #8BA3B5; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 6px; }
    .rc-meta-row{ display: flex; gap: 8px; align-items: center; }

    .rc-right   { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
    .rc-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

    .time-ago   { font-size: 0.68rem; font-weight: 700; background: #FFF7ED; color: #F97316; padding: 2px 8px; border-radius: 999px; }

    /* ── Status / Crit chips ──────────────────────────── */
    .status-chip  { font-size: 0.63rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
    .chip-pending    { background: #EDE9FE; color: #5B21B6; }
    .chip-assigned   { background: #FFF0E0; color: #C06020; }
    .chip-in_progress{ background: #EEF4FC; color: #3A6EA8; }
    .chip-completed  { background: #D8F5EE; color: #1A7A5E; }
    .chip-default    { background: #F3F4F6; color: #6B7280; }

    .crit-pill    { font-size: 0.63rem; font-weight: 800; padding: 3px 9px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.06em; }
    .crit-critical{ background: #FEE2E2; color: #991B1B; }
    .crit-high    { background: #FFF3E8; color: #9A3412; }
    .crit-medium  { background: #FEF9C3; color: #854D0E; }
    .crit-low     { background: #D1FAE5; color: #065F46; }

    /* ── Action Buttons ───────────────────────────────── */
    .btn-accept { display: flex; align-items: center; gap: 4px; height: 36px; padding: 0 14px; border-radius: 10px; border: none; background: #F97316; color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.15s; mat-icon { font-size: 15px; width: 15px; height: 15px; } &:hover { background: #D04A0A; } }
    .btn-decline { height: 36px; padding: 0 14px; border-radius: 10px; border: 1px solid #FECACA; background: #FEF2F2; color: #E05858; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.15s; &:hover { background: #FECACA; } }
    .btn-complete-wide { display: flex; align-items: center; gap: 6px; width: 100%; justify-content: center; height: 42px; border-radius: 12px; border: none; background: #2EB894; color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: background 0.15s; mat-icon { font-size: 17px; width: 17px; height: 17px; } &:hover { background: #1E9A7A; } }
    .open-hint { display: flex; align-items: center; gap: 3px; font-size: 0.72rem; font-weight: 600; color: #94A3B8; mat-icon { font-size: 13px; width: 13px; height: 13px; } }

    /* ── Overlay / Popup ──────────────────────────────── */
    .overlay { position: fixed; inset: 0; background: rgba(10,24,36,0.45); backdrop-filter: blur(3px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .popup   { background: #fff; border-radius: 24px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(10,24,36,0.22); animation: popIn 0.2s ease; }
    @keyframes popIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:none; } }

    .popup-hdr { display: flex; align-items: center; gap: 16px; padding: 22px; position: relative; }
    .hdr-critical { background: linear-gradient(135deg, #7B1010 0%, #C03030 100%); }
    .hdr-high     { background: linear-gradient(135deg, #7B3A10 0%, #C07030 100%); }
    .hdr-medium   { background: linear-gradient(135deg, #6B5510 0%, #B09020 100%); }
    .hdr-low      { background: linear-gradient(135deg, #0A5840 0%, #1E9A7A 100%); }

    .popup-hdr-icon { width: 60px; height: 60px; border-radius: 16px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.3); mat-icon { font-size: 30px; width: 30px; height: 30px; color: #fff; } }
    .popup-hdr-info { flex: 1; }
    .popup-crit-pill { display: inline-block; background: rgba(255,255,255,0.25); color: #fff; font-size: 0.63rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
    .pill-critical { background: rgba(255,255,255,0.2); }
    .pill-high     { background: rgba(255,255,255,0.2); }
    .pill-medium   { background: rgba(255,255,255,0.2); }
    .pill-low      { background: rgba(255,255,255,0.2); }
    .popup-name { font-size: 1.2rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
    .popup-addr { display: flex; align-items: center; gap: 3px; font-size: 0.78rem; color: rgba(255,255,255,0.8); margin-top: 4px; mat-icon { font-size: 13px; width: 13px; height: 13px; } }
    .popup-close { position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.2); border: none; border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: background 0.15s; mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; } &:hover { background: rgba(255,255,255,0.35); } }

    .popup-body       { padding: 22px 24px 24px; }
    .popup-status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
    .popup-date       { font-size: 0.75rem; color: #94A3B8; font-weight: 500; margin-left: auto; }

    .detail-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .detail-item  { background: #F8FAFB; border-radius: 12px; padding: 12px 14px; }
    .detail-label { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .detail-val   { font-size: 0.9rem; font-weight: 700; color: #1A3547; }

    .detail-notes { margin-bottom: 14px; }
    .notes-box { background: #F8FAFB; border-radius: 12px; padding: 12px 14px; font-size: 0.82rem; color: #4A6478; line-height: 1.5; }
    .notes-input { width: 100%; border: 1px solid #E0EBF2; border-radius: 12px; padding: 10px 14px; font-size: 0.82rem; color: #1A3547; background: #F8FAFB; outline: none; resize: vertical; box-sizing: border-box; font-family: inherit; &:focus { border-color: #2EB894; background: #fff; } }

    .rescue-photo { width: 100%; max-height: 200px; object-fit: cover; border-radius: 12px; }
    .popup-actions { display: flex; gap: 10px; margin-top: 4px; }

    /* ── Reporter Contact Box ─────────────────────────── */
    .reporter-contact-box {
      background: #F0FDF4; border: 1px solid #A7F3D0; border-radius: 14px;
      padding: 14px 16px; margin-bottom: 14px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .reporter-contact-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.62rem; font-weight: 800; color: #15803D;
      text-transform: uppercase; letter-spacing: 0.08em;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }
    .reporter-call-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: #22C55E; color: #fff; border-radius: 12px;
      padding: 10px 18px; text-decoration: none;
      font-size: 1rem; font-weight: 800; letter-spacing: 0.02em;
      transition: background 0.15s; width: fit-content;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover { background: #16A34A; }
    }
    .call-hint {
      font-size: 0.72rem; font-weight: 500; color: rgba(255,255,255,0.8); margin-left: 2px;
    }
  `]
})
export class NgoRescuesComponent implements OnInit {
  rescues:  any[] = [];
  filtered: any[] = [];
  loading   = true;
  selected: any | null = null;
  completionNote = '';

  filter = { search: '', status: '', criticality: '', sort: 'newest' };

  get pendingCount()   { return this.rescues.filter(r => r.status === 'PENDING').length; }
  get assignedCount()  { return this.rescues.filter(r => r.status === 'ASSIGNED').length; }
  get inProgressCount(){ return this.rescues.filter(r => r.status === 'IN_PROGRESS').length; }
  get completedCount() { return this.rescues.filter(r => r.status === 'COMPLETED' || r.status === 'RESOLVED').length; }
  get criticalCount()  { return this.rescues.filter(r => r.criticality === 'CRITICAL').length; }
  get hasActiveFilters(){ return !!(this.filter.search || this.filter.status || this.filter.criticality); }

  critClass(c: string): string {
    return (c || 'low').toLowerCase();
  }

  statusLabel(s: string): string {
    return rescueStatusLabel(s);
  }

  statusClass(s: string): string {
    switch (s?.toUpperCase()) {
      case 'PENDING':     return 'chip-pending';
      case 'ASSIGNED':    return 'chip-assigned';
      case 'IN_PROGRESS': return 'chip-in_progress';
      case 'COMPLETED':
      case 'RESOLVED':    return 'chip-completed';
      default:            return 'chip-default';
    }
  }

  timeAgo(iso: string): string {
    // Append 'Z' if no timezone — backend sends UTC without suffix, browser would treat as local otherwise
    const utc = iso && !iso.endsWith('Z') && !iso.includes('+') ? iso + 'Z' : iso;
    const diff = Date.now() - new Date(utc).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hrs  > 0) return `${hrs}h ago`;
    return `${Math.max(1, mins)}m ago`;
  }

  fmtDate(iso: string): string {
    const utc = iso && !iso.endsWith('Z') && !iso.includes('+') ? iso + 'Z' : iso;
    return new Date(utc).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  applyFilters(): void {
    const urgencyOrder: Record<string,number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    let r = [...this.rescues];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(x => x.animalType?.toLowerCase().includes(q) || x.address?.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q));
    if (this.filter.status)      r = r.filter(x => x.status === this.filter.status);
    if (this.filter.criticality) r = r.filter(x => x.criticality === this.filter.criticality);
    if (this.filter.sort === 'newest')  r.sort((a, b) => new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime());
    if (this.filter.sort === 'oldest')  r.sort((a, b) => new Date(a.reportedAt || 0).getTime() - new Date(b.reportedAt || 0).getTime());
    if (this.filter.sort === 'urgency') r.sort((a, b) => (urgencyOrder[a.criticality] ?? 9) - (urgencyOrder[b.criticality] ?? 9));
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', criticality: '', sort: 'newest' };
    this.applyFilters();
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/ngo').subscribe({
      next: res => { this.rescues = res.data ?? []; this.applyFilters(); this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  respond(id: number, response: string): void {
    this.api.post<any>(`/rescue/${id}/respond`, { response }).subscribe({
      next: _res => {
        if (response === 'DECLINE') {
          // Remove from this NGO's list — rescue is now re-assigned to the next NGO
          this.rescues = this.rescues.filter(x => x.id !== id);
          this.snack.open('Rescue declined and passed to the next available NGO.', '', { duration: 3500 });
        } else {
          // ACCEPT — mark as IN_PROGRESS so the "Mark as Complete" button appears
          const r = this.rescues.find(x => x.id === id);
          if (r) r.status = 'IN_PROGRESS';
          this.snack.open('Rescue accepted! You are now in charge.', '', { duration: 3000 });
        }
        this.applyFilters();
      },
      error: err => this.snack.open(err.error?.message ?? 'Error responding to rescue.', 'Close', { duration: 3500 })
    });
  }

  complete(id: number): void {
    this.api.post<any>(`/rescue/${id}/complete`, { notes: 'Rescue completed.' }).subscribe({
      next: () => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = 'COMPLETED';
        this.applyFilters();
        this.snack.open('Rescue marked as complete!', '', { duration: 2000 });
      }
    });
  }

  completeWithNote(id: number): void {
    const notes = this.completionNote.trim() || 'Rescue completed.';
    this.api.post<any>(`/rescue/${id}/complete`, { notes }).subscribe({
      next: () => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = 'COMPLETED';
        this.applyFilters();
        this.selected = null;
        this.completionNote = '';
        this.snack.open('Rescue marked as complete!', '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 })
    });
  }
}
