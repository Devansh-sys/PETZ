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

      <!-- Search filters -->
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

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Finding animals near you...</span>
        </div>
      }

      @if (!loading) {
        <!-- Results count -->
        @if (animals.length > 0) {
          <div class="results-count">
            <span>{{ animals.length }} animals available for adoption</span>
          </div>
        }

        <!-- Animal cards -->
        @if (animals.length === 0) {
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

        <div class="animal-grid">
          @for (a of animals; track a.id) {
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
      margin-bottom: 24px;
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
  loading = true;
  filters = { species: '', city: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.search(); }

  search(): void {
    this.loading = true;
    const params: any = {};
    if (this.filters.species) params['species'] = this.filters.species;
    if (this.filters.city)    params['city']    = this.filters.city;
    this.api.get<any>('/adoption/animals', params).subscribe({
      next: res => { this.animals = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  clearFilters(): void {
    this.filters = { species: '', city: '' };
    this.search();
  }
}
