import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-animal-detail',
  template: `
    <div class="page-container" style="max-width:760px">
      <button mat-button routerLink="/adoption/animals" style="margin-bottom:16px">
        <mat-icon>arrow_back</mat-icon> Back
      </button>

      @if (loading) {
        <div style="text-align:center;padding:40px">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      @if (!loading && animal) {
        <mat-card>
          <img mat-card-image [src]="animal.photoUrl || 'assets/animal-placeholder.png'"
               style="max-height:340px;object-fit:cover" [alt]="animal.name">
          <mat-card-header style="padding:16px">
            <mat-card-title style="font-size:1.6rem">{{ animal.name }}</mat-card-title>
            <mat-card-subtitle>
              {{ animal.species }} • {{ animal.breed }} • {{ animal.ageMonths }} months • {{ animal.gender }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content style="padding:16px">
            <p>{{ animal.description }}</p>
            <div style="margin:12px 0">
              @if (animal.isVaccinated) {
                <span class="chip confirmed" style="margin-right:6px">✓ Vaccinated</span>
              }
              @if (animal.isNeutered) {
                <span class="chip approved" style="margin-right:6px">✓ Neutered</span>
              }
              <span class="chip available">{{ animal.status }}</span>
            </div>
            <p style="color:#64748B">📍 {{ animal.city }}</p>
          </mat-card-content>
        </mat-card>

        @if (animal.status === 'AVAILABLE' && isLoggedIn) {
          <mat-card style="margin-top:20px">
            <mat-card-header>
              <mat-card-title>Apply to Adopt</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="applyForm" (ngSubmit)="apply()">
                <mat-form-field appearance="outline" style="width:100%;margin-top:12px">
                  <mat-label>Why do you want to adopt {{ animal.name }}?</mat-label>
                  <textarea matInput rows="3" formControlName="reason"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width:100%">
                  <mat-label>Pet ownership experience</mat-label>
                  <textarea matInput rows="2" formControlName="experience"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Housing type</mat-label>
                  <mat-select formControlName="housingType">
                    <mat-option value="HOUSE">House</mat-option>
                    <mat-option value="APARTMENT">Apartment</mat-option>
                    <mat-option value="FLAT">Flat</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary" type="submit" [disabled]="applying">
                  {{ applying ? 'Submitting...' : 'Submit Application' }}
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `
})
export class AnimalDetailComponent implements OnInit {
  animal: AdoptableAnimal | null = null;
  loading = true;
  applying = false;
  applyForm: FormGroup;
  isLoggedIn = false;

  constructor(private route: ActivatedRoute, private api: ApiService,
              private fb: FormBuilder, private snack: MatSnackBar,
              private router: Router, private auth: AuthService) {
    this.applyForm = this.fb.group({
      reason: [''], experience: [''], housingType: ['HOUSE'], hasOtherPets: [false]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id');
    this.api.get<any>(`/adoption/animals/${id}`).subscribe({
      next: res => { this.animal = res.data; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  apply(): void {
    if (!this.animal) return;
    this.applying = true;
    const body = { ...this.applyForm.value, animalId: this.animal.id };
    this.api.post<any>('/adoption/apply', body).subscribe({
      next: () => {
        this.snack.open('Application submitted!', '', { duration: 3000 });
        this.router.navigate(['/adoption/my']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 });
        this.applying = false;
      }
    });
  }
}
