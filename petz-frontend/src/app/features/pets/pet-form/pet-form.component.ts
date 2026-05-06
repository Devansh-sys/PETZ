import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-pet-form',
  template: `
    <div class="page-container" style="max-width:680px">

      <!-- Header -->
      <div class="page-header" style="margin-bottom:24px">
        <div class="page-header-left">
          <h1>{{ isEdit ? 'Edit Pet Profile' : 'Add New Pet' }}</h1>
          <p>{{ isEdit ? 'Update your pet\'s details' : 'Register a new companion to your profile' }}</p>
        </div>
        <button mat-stroked-button routerLink="/pets" style="border-radius:10px">
          <mat-icon>arrow_back</mat-icon> Back
        </button>
      </div>

      <div class="card" style="padding:32px">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <!-- Basic info -->
          <div class="form-section-title">Basic Information</div>

          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Pet Name *</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">badge</mat-icon>
                <input matInput formControlName="name" placeholder="e.g. Buddy">
                <mat-error>Name is required</mat-error>
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Species</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">category</mat-icon>
                <mat-select formControlName="species" placeholder="Select species">
                  <mat-option value="DOG">🐕 Dog</mat-option>
                  <mat-option value="CAT">🐈 Cat</mat-option>
                  <mat-option value="BIRD">🦜 Bird</mat-option>
                  <mat-option value="RABBIT">🐇 Rabbit</mat-option>
                  <mat-option value="FISH">🐟 Fish</mat-option>
                  <mat-option value="OTHER">🐾 Other</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Breed</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">style</mat-icon>
                <input matInput formControlName="breed" placeholder="e.g. Golden Retriever">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Gender</label>
              <mat-form-field appearance="outline">
                <mat-select formControlName="gender" placeholder="Select gender">
                  <mat-option value="Male">♂ Male</mat-option>
                  <mat-option value="Female">♀ Female</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Vitals -->
          <div class="form-section-title" style="margin-top:8px">Vitals</div>

          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Age (years)</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">cake</mat-icon>
                <input matInput type="number" formControlName="ageYears" placeholder="e.g. 3">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Weight (kg)</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">monitor_weight</mat-icon>
                <input matInput type="number" step="0.1" formControlName="weightKg" placeholder="e.g. 12.5">
              </mat-form-field>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-section-title" style="margin-top:8px">Additional Notes</div>

          <div class="field-group">
            <label class="field-label">Health notes / special needs</label>
            <mat-form-field appearance="outline">
              <textarea matInput rows="3" formControlName="notes"
                        placeholder="Allergies, medical history, dietary needs..."></textarea>
            </mat-form-field>
          </div>

          <!-- Actions -->
          <div style="display:flex;gap:12px;margin-top:8px">
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    style="height:46px;min-width:140px;font-size:0.9rem">
              @if (loading) {
                <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner>
              }
              {{ loading ? 'Saving...' : (isEdit ? 'Update Pet' : 'Add Pet') }}
            </button>
            <button mat-stroked-button type="button" routerLink="/pets"
                    style="height:46px;border-radius:12px;color:#78716C;border-color:#E5D0C5">
              Cancel
            </button>
          </div>

        </form>
      </div>

    </div>
  `,
  styles: [`
    .form-section-title {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #A8A29E;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid #F0E0D6;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }
    .field-group { margin-bottom: 4px; }
    .field-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      color: #1C0902;
      margin-bottom: 6px;
    }
    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class PetFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;
  petId: number | null = null;

  constructor(private fb: FormBuilder, private api: ApiService,
              private route: ActivatedRoute, private router: Router,
              private snack: MatSnackBar) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      species:  [''],
      breed:    [''],
      ageYears: [null],
      gender:   [''],
      weightKg: [null],
      notes:    ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.petId = +id;
      this.api.get<any>(`/pets/${id}`).subscribe(res => {
        if (res.success) this.form.patchValue(res.data);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const obs = this.isEdit
      ? this.api.put<any>(`/pets/${this.petId}`, this.form.value)
      : this.api.post<any>('/pets', this.form.value);
    obs.subscribe({
      next: () => {
        this.snack.open('Pet saved successfully! 🐾', '', { duration: 2500 });
        this.router.navigate(['/pets']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Error saving pet.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
