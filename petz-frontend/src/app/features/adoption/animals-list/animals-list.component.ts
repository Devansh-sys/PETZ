import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';

@Component({
  standalone: false,
  selector: 'app-animals-list',
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
            <h1>Find Your Companion</h1>
            <p>Animals looking for a loving forever home</p>
          </div>
        </div>
        <div class="page-header-actions">
          <button mat-stroked-button routerLink="/adoption/my"
                  style="border-radius:10px;color:#4A6478;border-color:#C8DCE8">
            <mat-icon>assignment</mat-icon> My Applications
          </button>
        </div>
      </div>

      <!-- Search filters (API-based) -->
      <div class="search-bar-card">
        <div class="search-field">
          <mat-icon>search</mat-icon>
          <input [(ngModel)]="filters.species" placeholder="Species (Dog, Cat, Bird...)"
                 (keyup.enter)="search()">
        </div>
        <div class="search-divider"></div>
        <div class="search-field">
          <mat-icon>place</mat-icon>
          <input [(ngModel)]="filters.city" placeholder="City or area"
                 (keyup.enter)="search()">
        </div>
        <button mat-raised-button color="primary" (click)="search()" class="search-btn">
          <mat-icon>search</mat-icon> Search
        </button>
      </div>

      <!-- Client-side secondary filter bar -->
      <div class="client-filter-bar">
        <div class="select-group">
          <label class="select-label">Gender</label>
          <select class="fsel" [(ngModel)]="clientFilter.gender" (ngModelChange)="applyClientFilters()">
            <option value="">All</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <button class="toggle-chip" [class.chip-active]="clientFilter.vaccinated"
                (click)="clientFilter.vaccinated = !clientFilter.vaccinated; applyClientFilters()">
          💉 Vaccinated
        </button>
        <button class="toggle-chip" [class.chip-active]="clientFilter.neutered"
                (click)="clientFilter.neutered = !clientFilter.neutered; applyClientFilters()">
          ✂️ Neutered
        </button>
        <div class="select-group">
          <label class="select-label">Sort</label>
          <select class="fsel" [(ngModel)]="clientFilter.sort" (ngModelChange)="applyClientFilters()">
            <option value="newest">Newest First</option>
            <option value="name">Name A–Z</option>
            <option value="youngest">Age: Youngest</option>
            <option value="oldest_age">Age: Oldest</option>
          </select>
        </div>
        @if (hasClientFilters) {
          <button class="clear-btn" (click)="clearClientFilters()">
            <mat-icon>close</mat-icon> Clear
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Finding animals near you...</span>
        </div>
      }

      @if (!loading) {
        <!-- Results count -->
        @if (allAnimals.length > 0) {
          <div class="results-count">
            <span>Showing {{ displayed.length }} of {{ allAnimals.length }} animals available for adoption</span>
          </div>
        }

        <!-- Animal cards -->
        @if (allAnimals.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon">
                <mat-icon>favorite_border</mat-icon>
              </div>
              <h3>No animals found</h3>
              <p>Try adjusting your search filters or check back later for new arrivals.</p>
              <button mat-stroked-button (click)="clearFilters()" style="margin-top:8px;border-radius:10px">
                Clear filters
              </button>
            </div>
          </div>
        }

        @if (displayed.length === 0 && allAnimals.length > 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>filter_alt_off</mat-icon></div>
              <h3>No matches</h3>
              <p>No animals match your current filters. Try clearing some filters.</p>
              <button mat-stroked-button (click)="clearClientFilters()" style="margin-top:8px;border-radius:10px">
                Clear filters
              </button>
            </div>
          </div>
        }

        <div class="animal-grid">
          @for (a of displayed; track a.id) {
            <div class="animal-card" [routerLink]="['/adoption/animals', a.id]">
              <div class="animal-img-wrap">
                <img [src]="a.photoUrl || 'assets/animal-placeholder.png'" [alt]="a.name">
                <div class="animal-species-tag">{{ a.species }}</div>
                @if (a.isAdoptionReady) {
                  <div class="ready-badge">
                    <mat-icon>check_circle</mat-icon> Ready to adopt
                  </div>
                }
              </div>
              <div class="animal-body">
                <div class="animal-name">{{ a.name }}</div>
                <div class="animal-meta">
                  {{ a.breed || 'Mixed' }}
                  @if (a.ageMonths) { · {{ a.ageMonths < 12 ? a.ageMonths + ' mo' : (a.ageMonths / 12 | number:'1.0-1') + ' yr' }} }
                </div>
                @if (a.city) {
                  <div class="animal-location">
                    <mat-icon>place</mat-icon> {{ a.city }}
                  </div>
                }
                <div class="animal-tags">
                  @if (a.isVaccinated) {
                    <span class="tag tag-green">💉 Vaccinated</span>
                  }
                  @if (a.isNeutered) {
                    <span class="tag tag-blue">✂️ Neutered</span>
                  }
                </div>
              </div>
              <div class="animal-cta">
                <button mat-raised-button color="primary" class="adopt-btn"
                        [routerLink]="['/adoption/animals', a.id]">
                  View Profile
                </button>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .search-bar-card {
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: 16px;
      border: 1px solid #E0EBF2;
      box-shadow: 0 4px 16px rgba(26,53,71,0.06);
      padding: 10px 10px 10px 20px;
      margin-bottom: 14px;
      gap: 0;
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      mat-icon { color: #8BA3B5; font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
      input {
        border: none;
        outline: none;
        font-size: 0.88rem;
        color: #1A3547;
        font-family: 'DM Sans', sans-serif;
        background: transparent;
        width: 100%;
        &::placeholder { color: #8BA3B5; }
      }
    }
    .search-divider {
      width: 1px;
      height: 28px;
      background: #E0EBF2;
      margin: 0 14px;
    }
    .search-btn {
      height: 44px !important;
      border-radius: 12px !important;
      flex-shrink: 0;
    }

    /* ── Client-side filter bar ── */
    .client-filter-bar {
      display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
      background: #fff; border-radius: 14px; border: 1px solid #E0EBF2;
      padding: 12px 16px; margin-bottom: 16px;
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
    .toggle-chip {
      height: 36px; padding: 0 14px; border: 1px solid #E0EBF2; border-radius: 10px;
      background: #F8FAFB; font-size: 0.82rem; cursor: pointer;
      font-family: inherit; color: #4A6478; transition: all 0.15s;
      &:hover { border-color: #FF8C42; }
    }
    .chip-active { background: #FFF3E8; border-color: #FF8C42; color: #FF8C42; font-weight: 700; }
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
      margin-bottom: 18px;
      font-size: 0.82rem;
      color: #8BA3B5;
      font-weight: 600;
    }
    .animal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(258px, 1fr));
      gap: 18px;
    }
    .animal-card {
      background: #fff;
      border-radius: 20px;
      border: 1px solid #E0EBF2;
      box-shadow: 0 4px 16px rgba(26,53,71,0.07);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.22s ease;
      display: flex;
      flex-direction: column;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 36px rgba(26,53,71,0.12);
        border-color: #FDBF8A;
      }
    }
    .animal-img-wrap {
      position: relative;
      height: 175px;
      background: #FFF4EE;
      overflow: hidden;
      img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
      }
    }
    .animal-card:hover .animal-img-wrap img { transform: scale(1.04); }
    .animal-species-tag {
      position: absolute;
      top: 10px; left: 10px;
      background: rgba(26,53,71,0.75);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      backdrop-filter: blur(6px);
    }
    .ready-badge {
      position: absolute;
      bottom: 10px; left: 10px;
      display: flex; align-items: center; gap: 4px;
      background: rgba(5,150,105,0.9);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      backdrop-filter: blur(6px);
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .animal-body {
      padding: 14px 16px 10px;
      flex: 1;
    }
    .animal-name { font-weight: 800; font-size: 1rem; color: #1A3547; margin-bottom: 2px; }
    .animal-meta { font-size: 0.78rem; color: #8BA3B5; margin-bottom: 6px; }
    .animal-location {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.76rem; color: #4A6478; margin-bottom: 8px;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: #FF8C42; }
    }
    .animal-tags { display: flex; gap: 5px; flex-wrap: wrap; }
    .tag {
      font-size: 0.68rem; font-weight: 600;
      padding: 2px 8px; border-radius: 999px;
    }
    .tag-green { background: #D1FAE5; color: #065F46; }
    .tag-blue  { background: #DBEAFE; color: #1E40AF; }
    .animal-cta {
      padding: 0 16px 14px;
    }
    .adopt-btn {
      width: 100% !important;
      border-radius: 12px !important;
      height: 38px !important;
      font-size: 0.85rem !important;
    }
  `]
})
export class AnimalsListComponent implements OnInit {
  animals: AdoptableAnimal[] = [];
  allAnimals: AdoptableAnimal[] = [];
  displayed: AdoptableAnimal[] = [];
  loading = true;
  filters = { species: '', city: '' };
  clientFilter = { gender: '', vaccinated: false, neutered: false, sort: 'newest' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.search(); }

  search(): void {
    this.loading = true;
    const params: any = {};
    if (this.filters.species) params['species'] = this.filters.species;
    if (this.filters.city)    params['city']    = this.filters.city;
    this.api.get<any>('/adoption/animals', params).subscribe({
      next: res => {
        this.animals = res.data ?? [];
        this.allAnimals = this.animals;
        this.loading = false;
        this.applyClientFilters();
      },
      error: () => { this.loading = false; }
    });
  }

  get hasClientFilters(): boolean {
    return !!(this.clientFilter.gender || this.clientFilter.vaccinated || this.clientFilter.neutered || this.clientFilter.sort !== 'newest');
  }

  applyClientFilters(): void {
    let r = [...this.allAnimals];
    if (this.clientFilter.gender) r = r.filter(a => (a.gender || '').toUpperCase() === this.clientFilter.gender);
    if (this.clientFilter.vaccinated) r = r.filter(a => a.isVaccinated);
    if (this.clientFilter.neutered)   r = r.filter(a => a.isNeutered);
    if (this.clientFilter.sort === 'newest') {
      r.sort((a, b) => b.id - a.id);
    } else if (this.clientFilter.sort === 'name') {
      r.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.clientFilter.sort === 'youngest') {
      r.sort((a, b) => (a.ageMonths || 999) - (b.ageMonths || 999));
    } else if (this.clientFilter.sort === 'oldest_age') {
      r.sort((a, b) => (b.ageMonths || 0) - (a.ageMonths || 0));
    }
    this.displayed = r;
  }

  clearClientFilters(): void {
    this.clientFilter = { gender: '', vaccinated: false, neutered: false, sort: 'newest' };
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.filters = { species: '', city: '' };
    this.clearClientFilters();
    this.search();
  }
}
