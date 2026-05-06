import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Pet } from '../../../core/models/pet.model';

@Component({
  standalone: false,
  selector: 'app-pets-list',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>My Pets</h1>
          <p>Manage and monitor all your registered companions</p>
        </div>
        <div class="page-header-actions">
          <button mat-raised-button color="primary" routerLink="/pets/new">
            <mat-icon>add</mat-icon> Add Pet
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading your pets...</span>
        </div>
      }

      <!-- Empty state -->
      @if (!loading && pets.length === 0) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 40 40" fill="none">
                <ellipse cx="13" cy="9" rx="4.5" ry="5.5" fill="#F97316" opacity="0.6"/>
                <ellipse cx="27" cy="9" rx="4.5" ry="5.5" fill="#F97316" opacity="0.6"/>
                <ellipse cx="7" cy="19" rx="3.5" ry="4.5" fill="#F97316" opacity="0.6"/>
                <ellipse cx="33" cy="19" rx="3.5" ry="4.5" fill="#F97316" opacity="0.6"/>
                <path d="M20 14C13.5 14 8 19.5 8 26C8 30.5 11 34 15 35.5H25C29 34 32 30.5 32 26C32 19.5 26.5 14 20 14Z" fill="#F97316"/>
              </svg>
            </div>
            <h3>No pets yet</h3>
            <p>Add your first furry, feathered, or scaly friend to get started.</p>
            <button mat-raised-button color="primary" routerLink="/pets/new" style="margin-top:8px">
              <mat-icon>add</mat-icon> Add your first pet
            </button>
          </div>
        </div>
      }

      <!-- Pet cards grid -->
      @if (!loading && pets.length > 0) {
        <div class="pet-grid">
          @for (pet of pets; track pet.id) {
            <div class="pet-card-custom">
              <div class="pet-img-wrap">
                <img [src]="pet.photoUrl || 'assets/pet-placeholder.png'"
                     [alt]="pet.name" class="pet-img-cover">
                <div class="pet-species-badge">{{ pet.species }}</div>
              </div>
              <div class="pet-card-body">
                <div class="pet-info">
                  <div class="pet-name">{{ pet.name }}</div>
                  <div class="pet-meta">
                    {{ pet.breed || 'Mixed breed' }}
                    @if (pet.ageYears) { <span class="dot">·</span> {{ pet.ageYears }} yr }
                    @if (pet.gender)   { <span class="dot">·</span> {{ pet.gender }} }
                  </div>
                </div>
                <div class="pet-card-actions">
                  <button mat-stroked-button class="edit-btn" [routerLink]="['/pets', pet.id]">
                    <mat-icon>edit_note</mat-icon> Edit
                  </button>
                  <button mat-icon-button class="del-btn" (click)="delete(pet.id)" title="Delete">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .pet-card-custom {
      background: #fff;
      border-radius: 20px;
      border: 1px solid #F0E0D6;
      box-shadow: 0 4px 16px rgba(28,9,2,0.07);
      overflow: hidden;
      transition: all 0.22s ease;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 36px rgba(28,9,2,0.12);
        border-color: #FDBF8A;
      }
    }
    .pet-img-wrap {
      position: relative;
      height: 165px;
      background: #FFF4EE;
      overflow: hidden;
    }
    .pet-img-cover {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .pet-species-badge {
      position: absolute;
      top: 10px; right: 10px;
      background: rgba(249,115,22,0.9);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      backdrop-filter: blur(4px);
    }
    .pet-card-body {
      padding: 14px 16px;
    }
    .pet-info {
      margin-bottom: 12px;
    }
    .pet-name {
      font-weight: 800;
      font-size: 1rem;
      color: #1C0902;
      margin-bottom: 3px;
      letter-spacing: -0.01em;
    }
    .pet-meta {
      font-size: 0.78rem;
      color: #A8A29E;
      .dot { margin: 0 4px; }
    }
    .pet-card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .edit-btn {
      flex: 1;
      border-radius: 10px !important;
      border-color: #F0E0D6 !important;
      color: #78716C !important;
      font-size: 0.82rem !important;
      font-weight: 600 !important;
      height: 36px !important;
      &:hover { border-color: #F97316 !important; color: #F97316 !important; background: #FFF7ED !important; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
    }
    .del-btn {
      width: 36px !important;
      height: 36px !important;
      border-radius: 10px !important;
      color: #A8A29E !important;
      &:hover { color: #DC2626 !important; background: #FEE2E2 !important; }
      mat-icon { font-size: 18px; }
    }
  `]
})
export class PetsListComponent implements OnInit {
  pets: Pet[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/pets/my').subscribe({
      next: res => { this.pets = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  delete(id: number): void {
    if (!confirm('Remove this pet from your list?')) return;
    this.api.delete<any>(`/pets/${id}`).subscribe(() => {
      this.pets = this.pets.filter(p => p.id !== id);
    });
  }
}
