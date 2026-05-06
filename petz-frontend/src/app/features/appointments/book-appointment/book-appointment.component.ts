import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-book-appointment',
  template: `
    <div class="page-container" style="max-width:680px">
      <h1>Book Appointment</h1>
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Hospital</mat-label>
                <mat-select formControlName="hospitalId" (selectionChange)="onHospitalChange($event.value)">
                  @for (h of hospitals; track h.id) {
                    <mat-option [value]="h.id">{{ h.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Doctor</mat-label>
                <mat-select formControlName="doctorId">
                  @for (d of doctors; track d.id) {
                    <mat-option [value]="d.id">{{ d.name }} — {{ d.specialization }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date</mat-label>
                <input matInput type="date" formControlName="apptDate">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Time</mat-label>
                <input matInput type="time" formControlName="apptTime">
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Reason for visit</mat-label>
              <textarea matInput rows="2" formControlName="reason"></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px;margin-top:8px">
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="form.invalid || loading">
                {{ loading ? 'Booking...' : 'Book Appointment' }}
              </button>
              <button mat-button type="button" routerLink="/appointments">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class BookAppointmentComponent implements OnInit {
  form: FormGroup;
  hospitals: any[] = [];
  doctors: any[] = [];
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      hospitalId: [null, Validators.required],
      doctorId:   [null, Validators.required],
      apptDate:   ['', Validators.required],
      apptTime:   ['', Validators.required],
      reason:     ['']
    });
  }

  ngOnInit(): void {
    this.api.get<any>('/hospitals/public').subscribe(res => {
      this.hospitals = res.data ?? [];
    });
  }

  onHospitalChange(hospitalId: number): void {
    this.form.patchValue({ doctorId: null });
    this.api.get<any>(`/hospitals/public/${hospitalId}/doctors`).subscribe(res => {
      this.doctors = res.data ?? [];
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.api.post<any>('/appointments', this.form.value).subscribe({
      next: () => {
        this.snack.open('Appointment booked!', '', { duration: 2000 });
        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Booking failed.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
