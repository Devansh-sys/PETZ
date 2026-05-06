import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-pet-form',
  template: `
    <div class="page-container" style="max-width:600px">
      <h1>{{ isEdit ? 'Edit Pet' : 'Add New Pet' }}</h1>
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Name *</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Species</mat-label>
                <input matInput formControlName="species" placeholder="Dog, Cat, Bird...">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Breed</mat-label>
                <input matInput formControlName="breed">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Age (years)</mat-label>
                <input matInput type="number" formControlName="ageYears">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="Male">Male</mat-option>
                  <mat-option value="Female">Female</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Weight (kg)</mat-label>
                <input matInput type="number" step="0.1" formControlName="weightKg">
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Notes</mat-label>
              <textarea matInput rows="3" formControlName="notes"></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px;margin-top:16px">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Add Pet') }}
              </button>
              <button mat-button type="button" routerLink="/pets">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
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
      name:      ['', Validators.required],
      species:   [''],
      breed:     [''],
      ageYears:  [null],
      gender:    [''],
      weightKg:  [null],
      notes:     ['']
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
      next: (res) => {
        this.snack.open('Pet saved!', '', { duration: 2000 });
        this.router.navigate(['/pets']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Error saving.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
