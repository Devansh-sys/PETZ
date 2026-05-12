import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptionApplication } from '../../../core/models/adoption.model';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-my-applications',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center">
          <button mat-icon-button routerLink="/dashboard"
                  style="background:#fff;border:1px solid #E0EBF2;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
          </button>
          <div>
            <h1>My Applications</h1>
            <p>Track your adoption application statuses</p>
          </div>
        </div>
        <button mat-stroked-button routerLink="/adoption/animals"
                style="border-radius:10px;color:#4A6478;border-color:#C8DCE8;height:40px">
          <mat-icon>pets</mat-icon> Browse Animals
        </button>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading your applications...</span>
        </div>
      }

      @if (!loading) {

        <!-- Empty state -->
        @if (applications.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>assignment</mat-icon></div>
              <h3>No applications yet</h3>
              <p>Find your perfect companion and submit an adoption application.</p>
              <button mat-raised-button routerLink="/adoption/animals"
                      style="margin-top:12px;border-radius:12px;background:#FF8C42;color:#fff;height:42px">
                <mat-icon>pets</mat-icon> Browse Animals
              </button>
            </div>
          </div>
        }

        @if (applications.length > 0) {

          <!-- Filter Bar -->
          <div class="filter-bar-card">
            <div class="search-wrap">
              <mat-icon class="search-icon">search</mat-icon>
              <input class="search-input" [(ngModel)]="filter.search" (ngModelChange)="applyFilters()"
                     placeholder="Search by animal name or species…">
            </div>
            <div class="select-group">
              <label class="select-label">Status</label>
              <select class="fsel" [(ngModel)]="filter.status" (ngModelChange)="applyFilters()">
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            <div class="select-group">
              <label class="select-label">Sort</label>
              <select class="fsel" [(ngModel)]="filter.sort" (ngModelChange)="applyFilters()">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            @if (hasActiveFilters) {
              <button class="clear-btn" (click)="clearFilters()">
                <mat-icon>close</mat-icon> Clear
              </button>
            }
          </div>

          <!-- Results count -->
          <div class="results-count">Showing {{ filtered.length }} of {{ applications.length }} applications</div>

          <!-- Application cards -->
          <div style="display:flex;flex-direction:column;gap:14px">
            @for (app of filtered; track app.id) {
              <div class="app-card" (click)="selected = app" style="cursor:pointer">

                <!-- Left: number + info -->
                <div class="app-left">
                  <div class="app-num-badge">
                    @if (app.animalPhotoUrl) {
                      <img [src]="imgSrc(app.animalPhotoUrl)" style="width:100%;height:100%;object-fit:cover;border-radius:14px"
                           (error)="$any($event.target).style.display='none'" />
                    } @else {
                      <mat-icon style="color:#fff;font-size:20px">pets</mat-icon>
                    }
                  </div>
                  <div class="app-detail">
                    <div class="app-title">{{ app.animalName || 'Adoption Application' }}</div>
                    <div class="app-meta">
                      @if (app.animalSpecies) {
                        <span><mat-icon>cruelty_free</mat-icon>{{ app.animalSpecies }}{{ app.animalBreed ? ' · ' + app.animalBreed : '' }}</span>
                      }
                      @if (app.appliedAt) {
                        <span><mat-icon>schedule</mat-icon>{{ app.appliedAt | date:'mediumDate' }}</span>
                      }
                    </div>
                    @if (app.adminNotes) {
                      <div class="app-note">
                        <mat-icon>comment</mat-icon>
                        <span>{{ app.adminNotes }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Right: status -->
                <div class="app-right">
                  <span class="chip" [ngClass]="statusClass(app.status)">
                    {{ statusLabel(app.status) }}
                  </span>
                  <div class="status-hint" [ngClass]="'hint-' + statusClass(app.status)">
                    {{ statusHint(app.status) }}
                  </div>
                </div>

              </div>
            }
            @if (filtered.length === 0) {
              <div class="card" style="text-align:center;padding:32px;color:#8BA3B5;font-size:0.88rem">
                No applications match your filters.
              </div>
            }
          </div>

          <!-- Summary chips -->
          <div class="summary-row">
            <div class="sum-pill">
              <span class="sum-num">{{ applications.length }}</span> Total
            </div>
            @if (pendingCount > 0) {
              <div class="sum-pill pending-pill">
                <span class="sum-num">{{ pendingCount }}</span> Pending
              </div>
            }
            @if (approvedCount > 0) {
              <div class="sum-pill approved-pill">
                <span class="sum-num">{{ approvedCount }}</span> Approved
              </div>
            }
          </div>
        }
      }

    </div>

    <!-- ── Detail Modal ── -->
    @if (selected) {
      <div class="modal-backdrop" (click)="selected = null">
        <div class="modal-card" (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:14px">
              <div class="modal-animal-icon">
                @if (selected.animalPhotoUrl) {
                  <img [src]="imgSrc(selected.animalPhotoUrl)" style="width:100%;height:100%;object-fit:cover;border-radius:14px"
                       (error)="$any($event.target).style.display='none'" />
                } @else {
                  <mat-icon>pets</mat-icon>
                }
              </div>
              <div>
                <div class="modal-title">{{ selected.animalName || 'Adoption Application' }}</div>
                <div class="modal-sub">
                  @if (selected.animalSpecies) {
                    <span>{{ selected.animalSpecies }}{{ selected.animalBreed ? ' · ' + selected.animalBreed : '' }}</span>
                  }
                </div>
              </div>
            </div>
            <button mat-icon-button (click)="selected = null">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="modal-body">

            <!-- Status -->
            <div class="detail-row">
              <mat-icon class="detail-icon">info</mat-icon>
              <div>
                <div class="detail-label">Application Status</div>
                <span class="chip" [ngClass]="statusClass(selected.status)">{{ statusLabel(selected.status) }}</span>
                <div class="detail-meta" style="margin-top:4px">{{ statusHint(selected.status) }}</div>
              </div>
            </div>

            <!-- Animal details -->
            <div class="section-divider">Animal Details</div>

            <div class="detail-grid">
              @if (selected.animalAgeMonths) {
                <div class="detail-item">
                  <div class="detail-label">Age</div>
                  <div class="detail-value">{{ ageDisplay(selected.animalAgeMonths) }}</div>
                </div>
              }
              @if (selected.animalGender) {
                <div class="detail-item">
                  <div class="detail-label">Gender</div>
                  <div class="detail-value">{{ selected.animalGender }}</div>
                </div>
              }
              @if (selected.animalCity) {
                <div class="detail-item">
                  <div class="detail-label">Location</div>
                  <div class="detail-value">{{ selected.animalCity }}</div>
                </div>
              }
              <div class="detail-item">
                <div class="detail-label">Vaccinated</div>
                <div class="detail-value">{{ selected.animalIsVaccinated ? '✅ Yes' : '❌ No' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Neutered</div>
                <div class="detail-value">{{ selected.animalIsNeutered ? '✅ Yes' : '❌ No' }}</div>
              </div>
            </div>

            <!-- Your application -->
            <div class="section-divider">Your Application</div>

            @if (selected.reason) {
              <div class="detail-row">
                <mat-icon class="detail-icon">favorite</mat-icon>
                <div>
                  <div class="detail-label">Why do you want to adopt?</div>
                  <div class="detail-value" style="font-weight:500;line-height:1.5">{{ selected.reason }}</div>
                </div>
              </div>
            }

            @if (selected.experience) {
              <div class="detail-row">
                <mat-icon class="detail-icon">workspace_premium</mat-icon>
                <div>
                  <div class="detail-label">Pet Experience</div>
                  <div class="detail-value" style="font-weight:500;line-height:1.5">{{ selected.experience }}</div>
                </div>
              </div>
            }

            <div class="detail-grid">
              @if (selected.housingType) {
                <div class="detail-item">
                  <div class="detail-label">Housing Type</div>
                  <div class="detail-value">{{ selected.housingType }}</div>
                </div>
              }
              <div class="detail-item">
                <div class="detail-label">Other Pets</div>
                <div class="detail-value">{{ selected.hasOtherPets ? 'Yes' : 'No' }}</div>
              </div>
              @if (selected.appliedAt) {
                <div class="detail-item">
                  <div class="detail-label">Applied On</div>
                  <div class="detail-value">{{ selected.appliedAt | date:'mediumDate' }}</div>
                </div>
              }
            </div>

            <!-- Admin notes -->
            @if (selected.adminNotes) {
              <div class="admin-notes-box">
                <div class="detail-label" style="margin-bottom:6px">NGO Feedback</div>
                <div style="font-size:0.88rem;color:#1A3547;line-height:1.5">{{ selected.adminNotes }}</div>
              </div>
            }

            <!-- NGO info -->
            @if (selected.ngoName) {
              <div class="ngo-section">
                <div class="ngo-section-title"><mat-icon>groups</mat-icon> Managing NGO</div>
                <div class="ngo-name">{{ selected.ngoName }}</div>
                @if (selected.ngoCity) {
                  <div class="ngo-meta">{{ selected.ngoCity }}</div>
                }
                <div class="ngo-contacts">
                  @if (selected.ngoPhone) {
                    <a class="ngo-contact-chip" [href]="'tel:' + selected.ngoPhone">
                      <mat-icon>call</mat-icon> {{ selected.ngoPhone }}
                    </a>
                  }
                  @if (selected.ngoEmail) {
                    <a class="ngo-contact-chip" [href]="'mailto:' + selected.ngoEmail">
                      <mat-icon>email</mat-icon> {{ selected.ngoEmail }}
                    </a>
                  }
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    }
  `,
  styles: [`
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

    /* ── Application cards ── */
    .app-card {
      display: flex; align-items: flex-start; gap: 16px;
      background: #fff; border: 1px solid #E0EBF2;
      border-radius: 18px; padding: 18px 22px;
      box-shadow: 0 4px 14px rgba(26,53,71,0.06);
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,53,71,0.1); }
    }
    .app-left { display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0; }
    .app-num-badge {
      min-width: 46px; height: 46px; border-radius: 14px;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
      box-shadow: 0 4px 10px rgba(255,140,66,0.30);
    }
    .app-detail { flex: 1; min-width: 0; }
    .app-title { font-weight: 800; font-size: 0.95rem; color: #1A3547; margin-bottom: 5px; }
    .app-meta {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 6px;
      span { display: flex; align-items: center; gap: 3px; font-size: 0.76rem; color: #8BA3B5; }
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .app-note {
      display: flex; align-items: flex-start; gap: 5px;
      font-size: 0.78rem; color: #4A6478; font-style: italic;
      background: #F9FBFB; border-radius: 8px; padding: 6px 10px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #FF8C42; flex-shrink: 0; margin-top: 1px; }
    }
    .app-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .status-hint { font-size: 0.68rem; font-weight: 600; text-align: right; max-width: 110px; line-height: 1.3; }
    .hint-pending      { color: #92400E; }
    .hint-under_review { color: #1E40AF; }
    .hint-approved     { color: #065F46; }
    .hint-cancelled    { color: #991B1B; }
    .hint-confirmed    { color: #1E40AF; }

    .summary-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
    .sum-pill {
      display: flex; align-items: center; gap: 6px;
      background: #F9FBFB; border: 1px solid #E0EBF2;
      border-radius: 999px; padding: 5px 14px;
      font-size: 0.76rem; font-weight: 600; color: #4A6478;
    }
    .sum-num { font-weight: 900; font-size: 0.9rem; color: #1A3547; }
    .pending-pill  { background: #FEF3C7; border-color: #FDE68A; color: #92400E; .sum-num { color: #92400E; } }
    .approved-pill { background: #D1FAE5; border-color: #A7F3D0; color: #065F46; .sum-num { color: #065F46; } }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .modal-card {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,0.2);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 22px 16px; border-bottom: 1px solid #F0F4F8;
      background: linear-gradient(135deg, #FFF7ED 0%, #fff 100%);
      position: sticky; top: 0; z-index: 1;
    }
    .modal-animal-icon {
      width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0; overflow: hidden;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #fff; font-size: 24px; }
    }
    .modal-title { font-size: 1.05rem; font-weight: 800; color: #1A3547; }
    .modal-sub   { font-size: 0.78rem; color: #8BA3B5; margin-top: 2px; }

    .modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }

    .section-divider {
      font-size: 0.72rem; font-weight: 700; color: #8BA3B5;
      text-transform: uppercase; letter-spacing: 0.07em;
      border-bottom: 1px solid #F0F4F8; padding-bottom: 6px; margin-top: 4px;
    }

    .detail-row { display: flex; align-items: flex-start; gap: 12px; }
    .detail-icon { color: #FF8C42; font-size: 20px; width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
    .detail-value { font-size: 0.9rem; font-weight: 600; color: #1A3547; }
    .detail-meta  { font-size: 0.78rem; color: #8BA3B5; }

    .detail-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px;
    }
    .detail-item {
      background: #F8FAFC; border-radius: 12px; padding: 10px 12px;
    }

    .admin-notes-box {
      background: #FEF3C7; border: 1px solid #FDE68A;
      border-radius: 12px; padding: 12px 14px;
    }

    /* NGO section */
    .ngo-section {
      background: #EFF6FF; border: 1px solid #BFDBFE;
      border-radius: 14px; padding: 14px 16px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .ngo-section-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.72rem; font-weight: 700; color: #1E40AF;
      text-transform: uppercase; letter-spacing: 0.06em;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }
    .ngo-name { font-size: 1rem; font-weight: 800; color: #1A3547; }
    .ngo-meta { font-size: 0.78rem; color: #4A6478; }
    .ngo-contacts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .ngo-contact-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: #fff; border: 1px solid #BFDBFE; border-radius: 999px;
      padding: 5px 12px; font-size: 0.78rem; font-weight: 600; color: #1D4ED8;
      text-decoration: none; transition: all 0.15s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { background: #DBEAFE; }
    }
  `]
})
export class MyApplicationsComponent implements OnInit {
  applications: AdoptionApplication[] = [];
  filtered: AdoptionApplication[] = [];
  loading = true;
  selected: AdoptionApplication | null = null;

  filter = { search: '', status: '', sort: 'newest' };

  get pendingCount(): number  { return this.applications.filter(a => a.status === 'PENDING').length; }
  get approvedCount(): number { return this.applications.filter(a => a.status === 'APPROVED').length; }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/my-applications').subscribe({
      next: res => {
        this.applications = res.data ?? [];
        this.loading = false;
        this.applyFilters();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let r = [...this.applications];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(a =>
      (a.animalName || '').toLowerCase().includes(q) ||
      (a.animalSpecies || '').toLowerCase().includes(q) ||
      (a.animalBreed || '').toLowerCase().includes(q)
    );
    if (this.filter.status) r = r.filter(a => a.status === this.filter.status);
    if (this.filter.sort === 'newest') {
      r.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
    } else {
      r.sort((a, b) => new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime());
    }
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', sort: 'newest' };
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filter.search || this.filter.status || this.filter.sort !== 'newest');
  }

  imgSrc(url?: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.mediaUrl + url;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDING':      'Pending',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED':     'Approved',
      'REJECTED':     'Rejected',
      'WITHDRAWN':    'Withdrawn'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDING':      'pending',
      'UNDER_REVIEW': 'under_review',
      'APPROVED':     'approved',
      'REJECTED':     'cancelled',
      'WITHDRAWN':    'cancelled'
    };
    return map[status] ?? status?.toLowerCase() ?? '';
  }

  statusHint(status: string): string {
    const map: Record<string, string> = {
      'PENDING':      'Awaiting NGO review',
      'UNDER_REVIEW': 'NGO is reviewing',
      'APPROVED':     'Congratulations!',
      'REJECTED':     'Not approved',
      'WITHDRAWN':    'Withdrawn'
    };
    return map[status] ?? '';
  }

  ageDisplay(months: number): string {
    if (!months) return '—';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const y = Math.floor(months / 12);
    const m = months % 12;
    return m > 0 ? `${y}y ${m}m` : `${y} year${y > 1 ? 's' : ''}`;
  }
}
