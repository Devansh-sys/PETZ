import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';

@Component({
  standalone: false,
  selector: 'app-animals-list',
  template: `
    <div class="page-container">
      <h1>Adoptable Animals</h1>

      <!-- Filters -->
      <mat-card style="margin-bottom:20px">
        <mat-card-content style="display:flex;gap:12px;flex-wrap:wrap;padding-top:12px">
          <mat-form-field appearance="outline" style="width:200px">
            <mat-label>Species</mat-label>
            <input matInput [(ngModel)]="filters.species" placeholder="Dog, Cat...">
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:200px">
            <mat-label>City</mat-label>
            <input matInput [(ngModel)]="filters.city">
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="search()" style="height:56px">
            <mat-icon>search</mat-icon> Search
          </button>
        </mat-card-content>
      </mat-card>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
          @for (a of animals; track a.id) {
            <mat-card style="cursor:pointer" [routerLink]="['/adoption/animals', a.id]">
              <img mat-card-image [src]="a.photoUrl || 'assets/animal-placeholder.png'"
                   style="height:180px;object-fit:cover" [alt]="a.name">
              <mat-card-content>
                <h2 style="margin:12px 0 4px">{{ a.name }}</h2>
                <p style="color:#64748B;margin:0">{{ a.species }} • {{ a.breed || 'Mixed' }} • {{ a.ageMonths }}mo</p>
                <p style="color:#94A3B8;margin:4px 0 0;font-size:0.85rem">{{ a.city }}</p>
                <div style="margin-top:8px">
                  @if (a.isVaccinated) {
                    <span class="chip confirmed" style="margin-right:4px">Vaccinated</span>
                  }
                  @if (a.isNeutered) {
                    <span class="chip approved" style="margin-right:4px">Neutered</span>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
          @if (animals.length === 0) {
            <p style="text-align:center;padding:40px;color:#64748B;grid-column:1/-1">
              No animals found.
            </p>
          }
        </div>
      }
    </div>
  `
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
}
