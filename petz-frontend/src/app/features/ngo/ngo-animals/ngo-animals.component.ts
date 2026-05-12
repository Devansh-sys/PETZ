import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-ngo-animals',
  template: `
    <div class="page-wrap">

      <!-- ── Header ─────────────────────────────────────────── -->
      <div class="page-hdr">
        <div style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/ngo" class="back-btn" title="Back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="page-title">My Animals</h1>
            <p class="page-sub">Manage all animals listed for adoption</p>
          </div>
        </div>
        <button mat-raised-button color="primary" (click)="showForm ? cancelForm() : (showForm = true)">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Animal' }}
        </button>
      </div>

      <!-- ── Add Animal Form ─────────────────────────────────── -->
      @if (showForm) {
        <div class="form-card">
          <div class="form-section-label">New Animal Details</div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Animal Name *</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">badge</mat-icon>
                <input matInput [(ngModel)]="newAnimal.name" placeholder="e.g. Milo">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Species</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">pets</mat-icon>
                <input matInput [(ngModel)]="newAnimal.species" placeholder="Dog, Cat, Bird…">
              </mat-form-field>
            </div>
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Breed</label>
              <mat-form-field appearance="outline">
                <input matInput [(ngModel)]="newAnimal.breed" placeholder="Mixed">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">City</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">place</mat-icon>
                <input matInput [(ngModel)]="newAnimal.city">
              </mat-form-field>
            </div>
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Age (months)</label>
              <mat-form-field appearance="outline">
                <input matInput type="number" [(ngModel)]="newAnimal.ageMonths">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Gender</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">transgender</mat-icon>
                <input matInput [(ngModel)]="newAnimal.gender" placeholder="Male / Female">
              </mat-form-field>
            </div>
          </div>
          <!-- Photo upload (full width) -->
          <div class="form-row-full">
            <label class="field-label">Animal Photo <span class="field-opt">Optional</span></label>
            <input type="file" #photoInput accept="image/*" style="display:none"
                   (change)="onPhotoSelected($event)">
            <div class="photo-upload-zone" (click)="photoInput.click()">
              @if (photoPreview) {
                <img [src]="photoPreview" class="photo-preview-img" alt="Preview">
                <div class="photo-change-overlay">
                  <mat-icon>edit</mat-icon>
                  <span>Change Photo</span>
                </div>
              } @else {
                <div class="photo-placeholder">
                  <mat-icon>add_photo_alternate</mat-icon>
                  <span class="photo-cta">Click to upload a photo</span>
                  <span class="photo-hint">JPG or PNG · max 5 MB</span>
                </div>
              }
            </div>
          </div>

          <div class="form-actions">
            <button mat-raised-button color="primary" (click)="addAnimal()" [disabled]="!newAnimal.name || saving">
              @if (saving) { <mat-spinner diameter="16" style="margin-right:6px"></mat-spinner> }
              @else { <mat-icon>save</mat-icon> }
              {{ saving ? 'Saving…' : 'Save Animal' }}
            </button>
            <button mat-stroked-button (click)="cancelForm()" class="cancel-btn">Cancel</button>
          </div>
        </div>
      }

      <!-- ── Stat Strip ──────────────────────────────────────── -->
      @if (animals.length > 0) {
        <div class="stat-strip">
          <div class="stat-item">
            <div class="stat-num">{{ animals.length }}</div>
            <div class="stat-lbl">Total Listed</div>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <div class="stat-num">{{ availableCount }}</div>
            <div class="stat-lbl">Available</div>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <div class="stat-num">{{ adoptedCount }}</div>
            <div class="stat-lbl">Adopted</div>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <div class="stat-num">{{ vaccinatedCount }}</div>
            <div class="stat-lbl">Vaccinated</div>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <div class="stat-num">{{ uniqueCities }}</div>
            <div class="stat-lbl">Cities</div>
          </div>
        </div>
      }

      <!-- ── Filter Bar ──────────────────────────────────────── -->
      <div class="filter-bar">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input class="search-input" placeholder="Search by name or breed…"
                 [(ngModel)]="filter.search" (ngModelChange)="applyFilters()">
        </div>
        <div class="select-group">
          <label class="select-label">Species</label>
          <select class="fsel" [(ngModel)]="filter.species" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            @for (sp of speciesList; track sp) {
              <option [value]="sp">{{ sp }}</option>
            }
          </select>
        </div>
        <div class="select-group">
          <label class="select-label">Status</label>
          <select class="fsel" [(ngModel)]="filter.status" (ngModelChange)="applyFilters()">
            <option value="">All</option>
            <option value="AVAILABLE">Available</option>
            <option value="ADOPTED">Adopted</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <div class="select-group">
          <label class="select-label">Sort</label>
          <select class="fsel" [(ngModel)]="filter.sort" (ngModelChange)="applyFilters()">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">Name A–Z</option>
            <option value="za">Name Z–A</option>
          </select>
        </div>
        @if (hasActiveFilters) {
          <button class="clear-btn" (click)="clearFilters()">
            <mat-icon>close</mat-icon> Clear
          </button>
        }
      </div>

      <!-- ── Empty: no animals ───────────────────────────────── -->
      @if (animals.length === 0) {
        <div class="empty-card">
          <mat-icon class="empty-icon-big">pets</mat-icon>
          <h3 class="empty-h3">No animals listed yet</h3>
          <p class="empty-p">Add animals to your organisation's adoption catalogue.</p>
          <button mat-raised-button color="primary" (click)="showForm = true" style="margin-top:10px">
            <mat-icon>add</mat-icon> Add your first animal
          </button>
        </div>
      }

      <!-- ── Empty: filter no-results ───────────────────────── -->
      @if (animals.length > 0 && filtered.length === 0) {
        <div class="empty-card">
          <mat-icon class="empty-icon-big" style="color:#CBD5E1">search_off</mat-icon>
          <h3 class="empty-h3">No animals match your filters</h3>
          <p class="empty-p">Try adjusting or clearing the active filters.</p>
          <button class="clear-btn" style="margin-top:10px" (click)="clearFilters()">
            <mat-icon>close</mat-icon> Clear Filters
          </button>
        </div>
      }

      <!-- ── Table ───────────────────────────────────────────── -->
      @if (filtered.length > 0) {
        <div class="table-wrap">
          <table class="ani-table">
            <thead>
              <tr>
                <th>ANIMAL</th>
                <th>BREED / AGE</th>
                <th>LOCATION</th>
                <th>HEALTH</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              @for (a of filtered; track a.id) {
                <tr class="ani-row" (click)="selected = a">
                  <td>
                    <div style="display:flex;align-items:center;gap:12px">
                      <div class="ani-avatar">
                        @if (a.photoUrl) {
                          <img [src]="imgSrc(a.photoUrl)" [alt]="a.name" class="ani-avatar-img"
                               (error)="$any($event.target).style.display='none'">
                        } @else {
                          <mat-icon class="ani-avatar-icon">pets</mat-icon>
                        }
                      </div>
                      <div>
                        <div class="cell-name">{{ a.name }}</div>
                        <div class="cell-species">{{ a.species || '—' }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="cell-main">{{ a.breed || 'Mixed breed' }}</div>
                    <div class="cell-sub">{{ fmtAge(a.ageMonths) }}</div>
                  </td>
                  <td>
                    <div class="cell-main">{{ a.city || '—' }}</div>
                  </td>
                  <td>
                    <div style="display:flex;gap:5px;flex-wrap:wrap">
                      @if (a.isVaccinated) { <span class="badge-vax">Vacc.</span> }
                      @if (a.isNeutered)   { <span class="badge-neut">Neut.</span> }
                      @if (!a.isVaccinated && !a.isNeutered) { <span class="cell-sub">—</span> }
                    </div>
                  </td>
                  <td>
                    <span class="status-chip" [ngClass]="statusClass(a.status)">{{ a.status }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- ── Detail Popup ────────────────────────────────────── -->
      @if (selected) {
        <div class="overlay" (click)="selected = null">
          <div class="popup" (click)="$event.stopPropagation()">

            <!-- Header -->
            <div class="popup-hdr">
              @if (selected.photoUrl) {
                <img [src]="imgSrc(selected.photoUrl)" [alt]="selected.name" class="popup-photo"
                     (error)="$any($event.target).style.display='none'">
              } @else {
                <div class="popup-photo-ph">
                  <mat-icon>pets</mat-icon>
                </div>
              }
              <div class="popup-hdr-info">
                <span class="popup-species-pill">{{ selected.species || 'Animal' }}</span>
                <div class="popup-name">{{ selected.name }}</div>
                <div class="popup-breed">{{ selected.breed || 'Mixed breed' }}</div>
              </div>
              <button class="popup-close" (click)="selected = null">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Body -->
            <div class="popup-body">

              <!-- Status + date -->
              <div class="popup-status-row">
                <span class="status-chip" [ngClass]="statusClass(selected.status)">{{ selected.status }}</span>
                <div style="display:flex;gap:6px">
                  @if (selected.isVaccinated) { <span class="badge-vax">Vaccinated</span> }
                  @if (selected.isNeutered)   { <span class="badge-neut">Neutered</span> }
                </div>
                @if (selected.createdAt) {
                  <span class="popup-date">Listed {{ fmtDate(selected.createdAt) }}</span>
                }
              </div>

              <!-- Detail grid -->
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">Age</div>
                  <div class="detail-val">{{ fmtAge(selected.ageMonths) }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Gender</div>
                  <div class="detail-val">{{ selected.gender || '—' }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">City</div>
                  <div class="detail-val">{{ selected.city || '—' }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Adoption Ready</div>
                  <div class="detail-val">{{ selected.isAdoptionReady ? 'Yes' : 'No' }}</div>
                </div>
              </div>

              <!-- Description -->
              @if (selected.description) {
                <div class="detail-notes">
                  <div class="detail-label" style="margin-bottom:6px">Description</div>
                  <div class="notes-box">{{ selected.description }}</div>
                </div>
              }

              <!-- Actions -->
              <div class="popup-actions">
                <button class="popup-del-btn" (click)="deleteAnimal(selected.id)">
                  <mat-icon>delete_outline</mat-icon> Remove Animal
                </button>
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
      &:hover { border-color: #FF8C42 !important; mat-icon { color: #FF8C42; } }
    }

    /* ── Add Animal Form ──────────────────────────────── */
    .form-card          { background: #fff; border-radius: 20px; box-shadow: 0 1px 12px rgba(26,53,71,0.07); padding: 24px 28px; margin-bottom: 20px; }
    .form-section-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #EEF2F7; }
    .form-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; @media(max-width:560px){ grid-template-columns:1fr; } }
    .field-group { margin-bottom: 4px; mat-form-field { width: 100%; } }
    .field-label { display: block; font-size: 0.78rem; font-weight: 700; color: #1A3547; margin-bottom: 6px; }
    .form-row-full { margin-bottom: 16px; }
    .field-opt { font-size: 0.68rem; font-weight: 500; color: #94A3B8; margin-left: 6px; text-transform: none; letter-spacing: 0; }

    /* Photo upload zone */
    .photo-upload-zone {
      width: 100%; height: 170px; border: 2px dashed #D0DCE8; border-radius: 14px;
      cursor: pointer; overflow: hidden; position: relative; background: #F8FAFB;
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.15s, background 0.15s;
      &:hover { border-color: #FF8C42; background: #FFF7ED; }
    }
    .photo-preview-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
    }
    .photo-change-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.42);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
      opacity: 0; transition: opacity 0.2s; color: #fff;
      font-size: 0.82rem; font-weight: 700;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .photo-upload-zone:hover .photo-change-overlay { opacity: 1; }
    .photo-placeholder {
      display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: #C8DCE8; }
    }
    .photo-cta  { font-size: 0.84rem; font-weight: 700; color: #8BA3B5; }
    .photo-hint { font-size: 0.7rem; color: #C0CEDB; }

    .form-actions { display: flex; gap: 10px; margin-top: 10px; align-items: center; }
    .cancel-btn  { border-radius: 12px !important; height: 42px !important; color: #4A6478 !important; border-color: #C8DCE8 !important; }

    /* ── Stat Strip ───────────────────────────────────── */
    .stat-strip { display: flex; align-items: center; background: #fff; border-radius: 18px; box-shadow: 0 1px 12px rgba(26,53,71,0.07); padding: 16px 24px; margin-bottom: 16px; }
    .stat-item  { flex: 1; text-align: center; }
    .stat-num   { font-size: 1.5rem; font-weight: 900; color: #1A3547; line-height: 1; letter-spacing: -0.03em; }
    .stat-lbl   { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
    .stat-div   { width: 1px; height: 36px; background: #E8EDF3; flex-shrink: 0; }

    /* ── Filter Bar ───────────────────────────────────── */
    .filter-bar  { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; background: #fff; border-radius: 16px; box-shadow: 0 1px 8px rgba(26,53,71,0.06); padding: 14px 18px; margin-bottom: 16px; }
    .search-wrap { position: relative; flex: 1; min-width: 180px; }
    .search-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      font-size: 17px !important; width: 17px !important; height: 17px !important; color: #94A3B8;
    }
    .search-input {
      width: 100%; height: 36px; border: 1px solid #E0EBF2; border-radius: 10px;
      padding: 0 12px 0 34px; font-size: 0.82rem; color: #1A3547;
      outline: none; background: #F8FAFB; box-sizing: border-box;
      &:focus { border-color: #FF8C42; background: #fff; }
    }
    .select-group { display: flex; flex-direction: column; gap: 3px; }
    .select-label { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
    .fsel {
      height: 36px; border: 1px solid #E0EBF2; border-radius: 10px; padding: 0 28px 0 10px;
      font-size: 0.82rem; color: #1A3547; appearance: none; outline: none; cursor: pointer;
      background: #F8FAFB url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394A3B8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 8px center;
      &:focus { border-color: #FF8C42; background-color: #fff; }
    }
    .clear-btn {
      display: flex; align-items: center; gap: 4px; height: 36px;
      border: 1px solid #E0EBF2; border-radius: 10px; padding: 0 12px;
      background: #F8FAFB; color: #64748B; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { border-color: #E05858; color: #E05858; background: #FEF2F2; }
    }

    /* ── Table ────────────────────────────────────────── */
    .table-wrap { background: #fff; border-radius: 20px; box-shadow: 0 1px 12px rgba(26,53,71,0.07); overflow: hidden; margin-bottom: 24px; }
    .ani-table  {
      width: 100%; border-collapse: collapse;
      th { font-size: 0.65rem; font-weight: 800; color: #94A3B8; letter-spacing: 0.07em; text-transform: uppercase; padding: 14px 20px; text-align: left; background: #F8FAFB; border-bottom: 1px solid #EEF2F7; }
      td { padding: 14px 20px; border-bottom: 1px solid #F3F6F9; vertical-align: middle; }
      tbody tr:last-child td { border-bottom: none; }
    }
    .ani-row { cursor: pointer; transition: background 0.15s; &:hover { background: #FAFCFF; } }

    .ani-avatar      { width: 42px; height: 42px; border-radius: 12px; overflow: hidden; background: #FFF4EE; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .ani-avatar-img  { width: 100%; height: 100%; object-fit: cover; display: block; }
    .ani-avatar-icon { font-size: 22px !important; width: 22px !important; height: 22px !important; color: #FDBF8A; }

    .cell-name    { font-weight: 800; font-size: 0.88rem; color: #1A3547; }
    .cell-species { font-size: 0.72rem; color: #94A3B8; margin-top: 2px; }
    .cell-main    { font-weight: 600; font-size: 0.84rem; color: #2D4A5E; }
    .cell-sub     { font-size: 0.72rem; color: #94A3B8; margin-top: 2px; }

    /* ── Status chips ─────────────────────────────────── */
    .status-chip  { font-size: 0.63rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
    .chip-avail   { background: #FFF0E0; color: #C06020; }
    .chip-adopted { background: #D8F5EE; color: #1A7A5E; }
    .chip-pending { background: #EEF0FC; color: #5040A0; }
    .chip-default { background: #F3F4F6; color: #6B7280; }

    /* ── Health badges ────────────────────────────────── */
    .badge-vax  { font-size: 0.6rem; font-weight: 700; padding: 3px 7px; border-radius: 6px; background: #D8F5EE; color: #1A7A5E; }
    .badge-neut { font-size: 0.6rem; font-weight: 700; padding: 3px 7px; border-radius: 6px; background: #EEF0FC; color: #5040A0; }

    /* ── Empty ────────────────────────────────────────── */
    .empty-card     { background: #fff; border-radius: 20px; box-shadow: 0 1px 12px rgba(26,53,71,0.07); display: flex; flex-direction: column; align-items: center; padding: 52px 24px; margin-bottom: 24px; text-align: center; }
    .empty-icon-big { font-size: 44px !important; width: 44px !important; height: 44px !important; color: #FDBF8A; margin-bottom: 12px; }
    .empty-h3       { font-size: 1rem; font-weight: 800; color: #1A3547; margin: 0 0 6px; }
    .empty-p        { font-size: 0.82rem; color: #94A3B8; margin: 0; }

    /* ── Overlay / Popup ──────────────────────────────── */
    .overlay {
      position: fixed; inset: 0; background: rgba(10,24,36,0.45); backdrop-filter: blur(3px);
      z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .popup {
      background: #fff; border-radius: 24px; width: 100%; max-width: 480px;
      box-shadow: 0 24px 60px rgba(10,24,36,0.22); overflow: hidden;
      animation: popIn 0.2s ease;
    }
    @keyframes popIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:none; } }

    .popup-hdr {
      display: flex; align-items: center; gap: 16px;
      background: linear-gradient(135deg, #2EB894 0%, #4F8FD4 100%);
      padding: 22px; position: relative;
    }
    .popup-photo    { width: 70px; height: 70px; border-radius: 16px; object-fit: cover; border: 3px solid rgba(255,255,255,0.35); flex-shrink: 0; }
    .popup-photo-ph {
      width: 70px; height: 70px; border-radius: 16px; flex-shrink: 0;
      background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;
      border: 3px solid rgba(255,255,255,0.3);
      mat-icon { font-size: 32px !important; width: 32px !important; height: 32px !important; color: rgba(255,255,255,0.8); }
    }
    .popup-hdr-info    { flex: 1; }
    .popup-species-pill {
      display: inline-block; background: rgba(255,255,255,0.25); color: #fff;
      font-size: 0.63rem; font-weight: 700; padding: 3px 9px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px;
    }
    .popup-name  { font-size: 1.25rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
    .popup-breed { font-size: 0.8rem; color: rgba(255,255,255,0.75); margin-top: 2px; }
    .popup-close {
      position: absolute; top: 14px; right: 14px;
      background: rgba(255,255,255,0.2); border: none; border-radius: 8px;
      width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
      color: #fff; cursor: pointer; transition: background 0.15s;
      mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
      &:hover { background: rgba(255,255,255,0.35); }
    }

    .popup-body         { padding: 22px 24px 24px; }
    .popup-status-row   { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
    .popup-date         { font-size: 0.75rem; color: #94A3B8; font-weight: 500; margin-left: auto; }

    .detail-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .detail-item  { background: #F8FAFB; border-radius: 12px; padding: 12px 14px; }
    .detail-label { font-size: 0.62rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .detail-val   { font-size: 0.9rem; font-weight: 700; color: #1A3547; }

    .detail-notes { margin-bottom: 16px; }
    .notes-box    { background: #F8FAFB; border-radius: 12px; padding: 12px 14px; font-size: 0.82rem; color: #4A6478; line-height: 1.5; }

    .popup-actions   { display: flex; gap: 10px; }
    .popup-del-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 0 18px; height: 38px; border-radius: 12px;
      border: 1px solid #FECACA; background: #FEF2F2;
      color: #E05858; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.15s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: #FECACA; border-color: #E05858; }
    }
  `]
})
export class NgoAnimalsComponent implements OnInit {
  animals: AdoptableAnimal[] = [];
  filtered: AdoptableAnimal[] = [];
  selected: AdoptableAnimal | null = null;
  showForm = false;
  saving   = false;
  newAnimal: any = {};

  // Photo upload state
  photoFile:    File | null   = null;
  photoPreview: string | null = null;

  filter = { search: '', species: '', status: '', sort: 'newest' };

  get availableCount()  { return this.animals.filter(a => a.status === 'AVAILABLE').length; }
  get adoptedCount()    { return this.animals.filter(a => a.status === 'ADOPTED').length; }
  get vaccinatedCount() { return this.animals.filter(a => a.isVaccinated).length; }
  get uniqueCities()    { return new Set(this.animals.map(a => a.city).filter(Boolean)).size; }
  get speciesList(): string[] {
    return [...new Set(this.animals.map(a => a.species).filter(Boolean) as string[])].sort();
  }
  get hasActiveFilters(): boolean {
    return !!(this.filter.search || this.filter.species || this.filter.status);
  }

  imgSrc(url?: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.mediaUrl + url;
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

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return 'chip-avail';
      case 'ADOPTED':   return 'chip-adopted';
      case 'PENDING':   return 'chip-pending';
      default:          return 'chip-default';
    }
  }

  applyFilters(): void {
    let r = [...this.animals];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(a => a.name.toLowerCase().includes(q) || a.breed?.toLowerCase().includes(q));
    if (this.filter.species) r = r.filter(a => a.species === this.filter.species);
    if (this.filter.status)  r = r.filter(a => a.status?.toUpperCase() === this.filter.status);
    if (this.filter.sort === 'newest') r.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    if (this.filter.sort === 'oldest') r.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    if (this.filter.sort === 'az')     r.sort((a, b) => a.name.localeCompare(b.name));
    if (this.filter.sort === 'za')     r.sort((a, b) => b.name.localeCompare(a.name));
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', species: '', status: '', sort: 'newest' };
    this.applyFilters();
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/ngo/animals').subscribe({
      next: res => { this.animals = res.data ?? []; this.applyFilters(); },
      error: ()  => {}
    });
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = e => { this.photoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  cancelForm(): void {
    this.showForm    = false;
    this.newAnimal   = {};
    this.photoFile   = null;
    this.photoPreview = null;
  }

  addAnimal(): void {
    if (!this.newAnimal.name || this.saving) return;
    this.saving = true;

    this.api.post<any>('/adoption/ngo/animals', this.newAnimal).subscribe({
      next: res => {
        const savedAnimal: AdoptableAnimal = res.data;

        const finalize = () => {
          this.animals.push(savedAnimal);
          this.applyFilters();
          this.saving = false;
          this.cancelForm();
          this.snack.open('Animal added successfully!', '', { duration: 2500 });
        };

        // Upload photo if one was selected
        if (this.photoFile) {
          const form = new FormData();
          form.append('file', this.photoFile);
          this.api.postFormData<any>(`/adoption/ngo/animals/${savedAnimal.id}/photo`, form).subscribe({
            next: photoRes => {
              if (photoRes?.data?.photoUrl) savedAnimal.photoUrl = photoRes.data.photoUrl;
              finalize();
            },
            error: () => {
              // Photo upload failed — animal is still saved; just skip the photo
              this.snack.open('Animal saved, but photo upload failed.', 'OK', { duration: 3500 });
              finalize();
            }
          });
        } else {
          finalize();
        }
      },
      error: err => {
        this.saving = false;
        this.snack.open(err.error?.message ?? 'Error adding animal.', 'Close', { duration: 3000 });
      }
    });
  }

  deleteAnimal(id: number): void {
    if (!confirm('Remove this animal from the adoption list?')) return;
    this.api.delete<any>(`/adoption/ngo/animals/${id}`).subscribe({
      next: () => {
        this.animals = this.animals.filter(a => a.id !== id);
        this.applyFilters();
        this.selected = null;
        this.snack.open('Animal removed.', '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error removing animal.', 'Close', { duration: 3000 })
    });
  }
}
