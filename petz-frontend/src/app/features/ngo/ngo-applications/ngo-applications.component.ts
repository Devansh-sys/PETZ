import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptionApplication } from '../../../core/models/adoption.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-ngo-applications',
  template: `
    <div class="page-wrap">

      <!-- ── Header ─────────────────────────────────────────── -->
      <div class="page-hdr">
        <div style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/ngo" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="page-title">Adoption Applications</h1>
            <p class="page-sub">Review and process incoming adoption requests</p>
          </div>
        </div>
        @if (pendingCount > 0) {
          <div class="pending-badge">
            <mat-icon>assignment</mat-icon>
            <span>{{ pendingCount }} pending</span>
          </div>
        }
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading applications…</span>
        </div>
      }

      @if (!loading) {

        <!-- ── Stat Strip ──────────────────────────────────── -->
        @if (applications.length > 0) {
          <div class="stat-strip">
            <div class="stat-item">
              <div class="stat-num">{{ applications.length }}</div>
              <div class="stat-lbl">Total</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#7C62CC">{{ pendingCount }}</div>
              <div class="stat-lbl">Pending</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#2EB894">{{ approvedCount }}</div>
              <div class="stat-lbl">Approved</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num" style="color:#E05858">{{ rejectedCount }}</div>
              <div class="stat-lbl">Rejected</div>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <div class="stat-num">{{ uniqueAnimals }}</div>
              <div class="stat-lbl">Animals</div>
            </div>
          </div>
        }

        <!-- ── Filter Bar ──────────────────────────────────── -->
        <div class="filter-bar">
          <div class="search-wrap">
            <mat-icon class="search-icon">search</mat-icon>
            <input class="search-input" placeholder="Search by animal name or reason…"
                   [(ngModel)]="filter.search" (ngModelChange)="applyFilters()">
          </div>
          <div class="select-group">
            <label class="select-label">Status</label>
            <select class="fsel" [(ngModel)]="filter.status" (ngModelChange)="applyFilters()">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div class="select-group">
            <label class="select-label">Sort</label>
            <select class="fsel" [(ngModel)]="filter.sort" (ngModelChange)="applyFilters()">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="pending">Pending First</option>
            </select>
          </div>
          @if (hasActiveFilters) {
            <button class="clear-btn" (click)="clearFilters()">
              <mat-icon>close</mat-icon> Clear
            </button>
          }
        </div>

        <!-- ── Empty: no applications ─────────────────────── -->
        @if (applications.length === 0) {
          <div class="empty-card">
            <mat-icon class="empty-icon">assignment</mat-icon>
            <h3 class="empty-h3">No applications yet</h3>
            <p class="empty-p">Adoption applications will appear here once submitted.</p>
          </div>
        }

        <!-- ── Empty: filter no-results ───────────────────── -->
        @if (applications.length > 0 && filtered.length === 0) {
          <div class="empty-card">
            <mat-icon class="empty-icon" style="color:#CBD5E1">search_off</mat-icon>
            <h3 class="empty-h3">No applications match your filters</h3>
            <p class="empty-p">Try adjusting or clearing the active filters.</p>
            <button class="clear-btn" style="margin-top:10px" (click)="clearFilters()">
              <mat-icon>close</mat-icon> Clear Filters
            </button>
          </div>
        }

        <!-- ── Table ───────────────────────────────────────── -->
        @if (filtered.length > 0) {
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th>ANIMAL</th>
                  <th>APPLICANT</th>
                  <th>REASON</th>
                  <th>HOUSING</th>
                  <th>APPLIED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (app of filtered; track app.id) {
                  <tr class="app-row" (click)="selected = app">
                    <td>
                      <div style="display:flex;align-items:center;gap:10px">
                        <div class="ani-avatar">
                          @if (app.animalPhotoUrl) {
                            <img [src]="imgSrc(app.animalPhotoUrl)" [alt]="app.animalName" class="ani-avatar-img"
                                 (error)="$any($event.target).style.display='none'">
                          } @else {
                            <mat-icon class="ani-avatar-icon">pets</mat-icon>
                          }
                        </div>
                        <div>
                          <div class="cell-name">{{ app.animalName || ('Animal #' + app.animalId) }}</div>
                          <div class="cell-sub">{{ app.animalSpecies || '—' }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="cell-main">Applicant #{{ app.applicantId }}</div>
                      @if (app.housingType) {
                        <div class="cell-sub">{{ app.housingType }}</div>
                      }
                    </td>
                    <td>
                      <div class="reason-clip">{{ app.reason || '—' }}</div>
                    </td>
                    <td>
                      @if (app.housingType) {
                        <span class="housing-chip">{{ app.housingType }}</span>
                      } @else {
                        <span class="cell-sub">—</span>
                      }
                    </td>
                    <td>
                      <div class="cell-main">{{ app.appliedAt ? fmtDate(app.appliedAt) : '—' }}</div>
                    </td>
                    <td>
                      <span class="status-chip" [ngClass]="statusClass(app.status)">{{ app.status }}</span>
                    </td>
                    <td (click)="$event.stopPropagation()">
                      @if (app.status === 'PENDING') {
                        <div style="display:flex;gap:6px">
                          <button class="btn-approve" (click)="review(app.id, 'APPROVED')" title="Approve">
                            <mat-icon>check_circle</mat-icon>
                          </button>
                          <button class="btn-reject" (click)="review(app.id, 'REJECTED')" title="Reject">
                            <mat-icon>cancel</mat-icon>
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

      }

      <!-- ── Detail Popup ────────────────────────────────────── -->
      @if (selected) {
        <div class="overlay" (click)="selected = null; reviewNote = ''">
          <div class="popup" (click)="$event.stopPropagation()">

            <!-- Header -->
            <div class="popup-hdr">
              <div class="popup-app-num">#{{ selected.id }}</div>
              <div class="popup-hdr-info">
                <span class="popup-type-pill">Adoption Application</span>
                <div class="popup-name">{{ selected.animalName || ('Animal #' + selected.animalId) }}</div>
                <div class="popup-breed">
                  {{ selected.animalSpecies || '' }}{{ selected.animalBreed ? ' · ' + selected.animalBreed : '' }}
                </div>
              </div>
              <button class="popup-close" (click)="selected = null; reviewNote = ''">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Body -->
            <div class="popup-body">

              <!-- Status + date -->
              <div class="popup-status-row">
                <span class="status-chip" [ngClass]="statusClass(selected.status)">{{ selected.status }}</span>
                @if (selected.appliedAt) {
                  <span class="popup-date">Applied {{ fmtDate(selected.appliedAt) }}</span>
                }
              </div>

              <!-- Animal info block -->
              <div class="section-head">Animal Details</div>
              <div class="animal-block">
                @if (selected.animalPhotoUrl) {
                  <img [src]="imgSrc(selected.animalPhotoUrl)" [alt]="selected.animalName" class="animal-thumb"
                       (error)="$any($event.target).style.display='none'">
                }
                <div class="animal-facts">
                  <div class="detail-grid-sm">
                    <div class="detail-item">
                      <div class="detail-label">Name</div>
                      <div class="detail-val">{{ selected.animalName || '—' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Species</div>
                      <div class="detail-val">{{ selected.animalSpecies || '—' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Breed</div>
                      <div class="detail-val">{{ selected.animalBreed || '—' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Age</div>
                      <div class="detail-val">{{ fmtAge(selected.animalAgeMonths) }}</div>
                    </div>
                  </div>
                  <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
                    @if (selected.animalIsVaccinated) { <span class="badge-vax">Vaccinated</span> }
                    @if (selected.animalIsNeutered)   { <span class="badge-neut">Neutered</span> }
                    @if (selected.animalCity)          { <span class="badge-city"><mat-icon>place</mat-icon>{{ selected.animalCity }}</span> }
                  </div>
                </div>
              </div>

              <!-- Applicant info -->
              <div class="section-head">Applicant Info</div>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">Applicant ID</div>
                  <div class="detail-val">#{{ selected.applicantId }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Housing Type</div>
                  <div class="detail-val">{{ selected.housingType || '—' }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Other Pets</div>
                  <div class="detail-val">{{ selected.hasOtherPets ? 'Yes' : 'No' }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Applied</div>
                  <div class="detail-val">{{ selected.appliedAt ? fmtDate(selected.appliedAt) : '—' }}</div>
                </div>
              </div>

              @if (selected.reason) {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Reason for Adoption</div>
                  <div class="notes-box">{{ selected.reason }}</div>
                </div>
              }

              @if (selected.experience) {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Pet Experience</div>
                  <div class="notes-box">{{ selected.experience }}</div>
                </div>
              }

              @if (selected.adminNotes) {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Admin Notes</div>
                  <div class="notes-box">{{ selected.adminNotes }}</div>
                </div>
              }

              <!-- Review notes (only shown when pending) -->
              @if (selected.status === 'PENDING') {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Review Notes <span style="font-weight:400;text-transform:none;letter-spacing:0;font-size:0.7rem;color:#B0BEC5">(optional — sent to applicant)</span></div>
                  <textarea class="notes-input" rows="2"
                            [(ngModel)]="reviewNote"
                            placeholder="Add a reason or message for the applicant…"></textarea>
                </div>
              }

              <!-- Actions -->
              @if (selected.status === 'PENDING') {
                <div class="popup-actions">
                  <button class="btn-approve-wide" (click)="review(selected.id, 'APPROVED', reviewNote)">
                    <mat-icon>check_circle</mat-icon> Approve Application
                  </button>
                  <button class="btn-reject-wide" (click)="review(selected.id, 'REJECTED', reviewNote)">
                    <mat-icon>cancel</mat-icon> Reject
                  </button>
                </div>
              }

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
    .back-btn   { width: 38px !important; height: 38px !important; border-radius: 10px !important; background: #fff !important; border: 1px solid #E0EBF2 !important; mat-icon { color: #4A6478; } &:hover { border-color: #FF8C42 !important; } }
    .pending-badge { display: flex; align-items: center; gap: 6px; background: #EDE9FE; color: #5B21B6; border-radius: 999px; padding: 7px 16px; font-size: 0.78rem; font-weight: 700; mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 40px 0; color: #94A3B8; font-size: 0.85rem; }

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
    .empty-icon { font-size: 44px !important; width: 44px !important; height: 44px !important; color: #C4B5FD; margin-bottom: 12px; }
    .empty-h3   { font-size: 1rem; font-weight: 800; color: #1A3547; margin: 0 0 6px; }
    .empty-p    { font-size: 0.82rem; color: #94A3B8; margin: 0; }

    /* ── Table ────────────────────────────────────────── */
    .table-wrap { background: #fff; border-radius: 20px; box-shadow: 0 1px 12px rgba(26,53,71,0.07); overflow: hidden; margin-bottom: 24px; }
    .app-table  {
      width: 100%; border-collapse: collapse;
      th { font-size: 0.65rem; font-weight: 800; color: #94A3B8; letter-spacing: 0.07em; text-transform: uppercase; padding: 14px 16px; text-align: left; background: #F8FAFB; border-bottom: 1px solid #EEF2F7; }
      td { padding: 13px 16px; border-bottom: 1px solid #F3F6F9; vertical-align: middle; }
      tbody tr:last-child td { border-bottom: none; }
    }
    .app-row { cursor: pointer; transition: background 0.15s; &:hover { background: #FAFCFF; } }

    .ani-avatar     { width: 40px; height: 40px; border-radius: 12px; overflow: hidden; background: #FFF7ED; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .ani-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .ani-avatar-icon{ font-size: 20px !important; width: 20px !important; height: 20px !important; color: #C8DCE8; }

    .cell-name    { font-weight: 800; font-size: 0.85rem; color: #1A3547; }
    .cell-main    { font-weight: 600; font-size: 0.82rem; color: #2D4A5E; }
    .cell-sub     { font-size: 0.72rem; color: #94A3B8; margin-top: 2px; }
    .reason-clip  { font-size: 0.78rem; color: #4A6478; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .housing-chip { font-size: 0.62rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #EEF4FC; color: #3A6EA8; white-space: nowrap; }

    .status-chip    { font-size: 0.63rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
    .chip-pending   { background: #EDE9FE; color: #5B21B6; }
    .chip-approved  { background: #D8F5EE; color: #1A7A5E; }
    .chip-rejected  { background: #FEE2E2; color: #991B1B; }
    .chip-default   { background: #F3F4F6; color: #6B7280; }

    .btn-approve { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #BBF7D0; background: #F0FDF4; color: #2EB894; cursor: pointer; transition: all 0.15s; mat-icon { font-size: 16px; width: 16px; height: 16px; } &:hover { background: #BBF7D0; border-color: #2EB894; } }
    .btn-reject  { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #FECACA; background: #FEF2F2; color: #E05858; cursor: pointer; transition: all 0.15s; mat-icon { font-size: 16px; width: 16px; height: 16px; } &:hover { background: #FECACA; border-color: #E05858; } }

    /* ── Overlay / Popup ──────────────────────────────── */
    .overlay { position: fixed; inset: 0; background: rgba(10,24,36,0.45); backdrop-filter: blur(3px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .popup   { background: #fff; border-radius: 24px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(10,24,36,0.22); animation: popIn 0.2s ease; }
    @keyframes popIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:none; } }

    .popup-hdr { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #3A1F80 0%, #7C62CC 100%); padding: 22px; position: relative; }
    .popup-app-num { width: 56px; height: 56px; border-radius: 14px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 900; color: #fff; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.3); }
    .popup-hdr-info  { flex: 1; }
    .popup-type-pill { display: inline-block; background: rgba(255,255,255,0.25); color: #fff; font-size: 0.63rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
    .popup-name  { font-size: 1.2rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
    .popup-breed { font-size: 0.8rem; color: rgba(255,255,255,0.75); margin-top: 2px; }
    .popup-close { position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.2); border: none; border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: background 0.15s; mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; } &:hover { background: rgba(255,255,255,0.35); } }

    .popup-body       { padding: 22px 24px 24px; }
    .popup-status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
    .popup-date       { font-size: 0.75rem; color: #94A3B8; font-weight: 500; margin-left: auto; }

    .section-head { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #EEF2F7; }

    .animal-block { display: flex; gap: 14px; margin-bottom: 18px; align-items: flex-start; }
    .animal-thumb { width: 80px; height: 80px; border-radius: 14px; object-fit: cover; flex-shrink: 0; border: 2px solid #EEF2F7; }
    .animal-facts { flex: 1; }

    .detail-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .detail-grid-sm { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .detail-item    { background: #F8FAFB; border-radius: 12px; padding: 10px 12px; }
    .detail-label   { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
    .detail-val     { font-size: 0.88rem; font-weight: 700; color: #1A3547; }

    .detail-notes { margin-bottom: 14px; }
    .notes-box    { background: #F8FAFB; border-radius: 12px; padding: 12px 14px; font-size: 0.82rem; color: #4A6478; line-height: 1.5; }

    .badge-vax  { font-size: 0.6rem; font-weight: 700; padding: 3px 7px; border-radius: 6px; background: #D8F5EE; color: #1A7A5E; }
    .badge-neut { font-size: 0.6rem; font-weight: 700; padding: 3px 7px; border-radius: 6px; background: #EEF0FC; color: #5040A0; }
    .badge-city { font-size: 0.6rem; font-weight: 700; padding: 3px 7px; border-radius: 6px; background: #F0F4FF; color: #3A6EA8; display: flex; align-items: center; gap: 2px; mat-icon { font-size: 10px; width: 10px; height: 10px; } }

    .notes-input { width: 100%; border: 1px solid #E0EBF2; border-radius: 12px; padding: 10px 14px; font-size: 0.82rem; color: #1A3547; background: #F8FAFB; outline: none; resize: vertical; box-sizing: border-box; font-family: inherit; &:focus { border-color: #7C62CC; background: #fff; } }
    .popup-actions { display: flex; gap: 10px; margin-top: 6px; }
    .btn-approve-wide { display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center; height: 42px; border-radius: 12px; border: none; background: #2EB894; color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: background 0.15s; mat-icon { font-size: 17px; width: 17px; height: 17px; } &:hover { background: #1E9A7A; } }
    .btn-reject-wide  { display: flex; align-items: center; gap: 6px; padding: 0 18px; height: 42px; border-radius: 12px; border: 1px solid #FECACA; background: #FEF2F2; color: #E05858; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.15s; mat-icon { font-size: 17px; width: 17px; height: 17px; } &:hover { background: #FECACA; border-color: #E05858; } }
  `]
})
export class NgoApplicationsComponent implements OnInit {
  applications: AdoptionApplication[] = [];
  filtered:     AdoptionApplication[] = [];
  loading    = true;
  selected:  AdoptionApplication | null = null;
  reviewNote = '';

  filter = { search: '', status: '', sort: 'newest' };

  get pendingCount()  { return this.applications.filter(a => a.status === 'PENDING').length; }
  get approvedCount() { return this.applications.filter(a => a.status === 'APPROVED').length; }
  get rejectedCount() { return this.applications.filter(a => a.status === 'REJECTED').length; }
  get uniqueAnimals() { return new Set(this.applications.map(a => a.animalId)).size; }
  get hasActiveFilters() { return !!(this.filter.search || this.filter.status); }

  imgSrc(url?: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.mediaUrl + url;
  }

  statusClass(s: string): string {
    switch (s?.toUpperCase()) {
      case 'PENDING':  return 'chip-pending';
      case 'APPROVED': return 'chip-approved';
      case 'REJECTED': return 'chip-rejected';
      default:         return 'chip-default';
    }
  }

  fmtAge(months?: number): string {
    if (!months && months !== 0) return '—';
    if (months < 12) return `${months} mo`;
    const y = Math.floor(months / 12), m = months % 12;
    return m > 0 ? `${y} yr ${m} mo` : `${y} yr`;
  }

  fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  applyFilters(): void {
    let r = [...this.applications];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(a =>
      a.animalName?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q) ||
      String(a.applicantId).includes(q)
    );
    if (this.filter.status) r = r.filter(a => a.status?.toUpperCase() === this.filter.status);
    if (this.filter.sort === 'newest')  r.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
    if (this.filter.sort === 'oldest')  r.sort((a, b) => new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime());
    if (this.filter.sort === 'pending') r.sort((a, b) => (a.status === 'PENDING' ? -1 : 1) - (b.status === 'PENDING' ? -1 : 1));
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', sort: 'newest' };
    this.applyFilters();
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/ngo/applications').subscribe({
      next: res => { this.applications = res.data ?? []; this.applyFilters(); this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  review(id: number, status: string, notes: string = ''): void {
    const body: any = { status };
    if (notes.trim()) body.notes = notes.trim();
    this.api.patch<any>(`/adoption/ngo/applications/${id}/review`, body).subscribe({
      next: () => {
        const a = this.applications.find(x => x.id === id);
        if (a) a.status = status;
        this.applyFilters();
        if (this.selected?.id === id) this.selected = null;
        this.reviewNote = '';
        this.snack.open(`Application ${status.toLowerCase()}.`, '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error processing application.', 'Close', { duration: 3000 })
    });
  }
}
