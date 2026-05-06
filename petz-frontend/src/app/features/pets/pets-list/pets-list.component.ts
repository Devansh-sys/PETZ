import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Pet } from '../../../core/models/pet.model';

@Component({
  standalone: false,
  selector: 'app-pets-list',
  template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>My Pets</h1>
        <button mat-raised-button color="primary" routerLink="/pets/new">
          <mat-icon>add</mat-icon> Add Pet
        </button>
      </div>

      @if (loading) {
        <div style="text-align:center;padding:40px">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      @if (!loading && pets.length === 0) {
        <div class="card" style="text-align:center;padding:40px;color:#64748B">
          <mat-icon style="font-size:48px;width:48px;height:48px">pets</mat-icon>
          <p>No pets yet. Add your first pet!</p>
        </div>
      }

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        @for (pet of pets; track pet.id) {
          <mat-card class="pet-card">
            <img mat-card-image [src]="pet.photoUrl || 'assets/pet-placeholder.png'"
                 style="height:180px;object-fit:cover" alt="pet photo">
            <mat-card-content>
              <h2 style="margin:12px 0 4px">{{ pet.name }}</h2>
              <p style="color:#64748B; margin:0">
                {{ pet.species }} • {{ pet.breed || 'Mixed' }} • {{ pet.ageYears }}yr
              </p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button [routerLink]="['/pets', pet.id]">Edit</button>
              <button mat-button color="warn" (click)="delete(pet.id)">Delete</button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `
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
    if (!confirm('Delete this pet?')) return;
    this.api.delete<any>(`/pets/${id}`).subscribe(() => {
      this.pets = this.pets.filter(p => p.id !== id);
    });
  }
}
