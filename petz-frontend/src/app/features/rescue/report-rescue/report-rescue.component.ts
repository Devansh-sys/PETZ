import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-report-rescue',
  template: `
    <div class="page-container" style="max-width:640px">
      <h1>Report an Animal in Need</h1>
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Animal Type</mat-label>
                <input matInput formControlName="animalType" placeholder="Dog, Cat, Bird...">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Criticality</mat-label>
                <mat-select formControlName="criticality">
                  <mat-option value="LOW">Low</mat-option>
                  <mat-option value="MEDIUM">Medium</mat-option>
                  <mat-option value="HIGH">High</mat-option>
                  <mat-option value="CRITICAL">Critical</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Address / Location Description</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Description</mat-label>
              <textarea matInput rows="4" formControlName="description"
                        placeholder="Describe the animal's condition..."></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px;margin-top:8px">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Submitting...' : 'Submit Report' }}
              </button>
              <button mat-button type="button" routerLink="/rescue">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ReportRescueComponent {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      animalType:   ['', Validators.required],
      description:  ['', Validators.required],
      address:      [''],
      criticality:  ['MEDIUM']
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(this.form.value)], { type: 'application/json' }));

    this.api.postFormData<any>('/rescue', formData).subscribe({
      next: (res) => {
        this.snack.open('Rescue reported! NGO will be assigned.', '', { duration: 3000 });
        this.router.navigate(['/rescue']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Error submitting.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
