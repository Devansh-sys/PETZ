import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-book-appointment',
  template: `
    <div class="page-container" style="max-width:700px">

      <!-- Header -->
      <div class="page-header" style="margin-bottom:24px">
        <div class="page-header-left">
          <button mat-icon-button routerLink="/dashboard"
                  style="background:#fff;border:1px solid #E0EBF2;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
          </button>
          <div>
            <h1>Book Appointment</h1>
            <p>Schedule a vet visit for your pet</p>
          </div>
        </div>
        <button mat-stroked-button routerLink="/appointments"
                style="border-radius:10px;color:#4A6478;border-color:#C8DCE8">
          My Appointments
        </button>
      </div>

      <div class="card" style="padding:32px">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <!-- Step 1: Choose hospital & doctor -->
          <div class="form-section-title">Step 1 — Choose Hospital &amp; Doctor</div>

          <div class="field-group">
            <label class="field-label">Hospital</label>
            <mat-form-field appearance="outline">
              <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">local_hospital</mat-icon>
              <mat-select formControlName="hospitalId"
                          placeholder="Select a hospital"
                          (selectionChange)="onHospitalChange($event.value)">
                @for (h of hospitals; track h.id) {
                  <mat-option [value]="h.id">{{ h.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="field-group">
            <label class="field-label">Doctor</label>
            <mat-form-field appearance="outline">
              <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">person</mat-icon>
              <mat-select formControlName="doctorId"
                          placeholder="Select a doctor"
                          [disabled]="!form.get('hospitalId')?.value">
                @for (d of doctors; track d.id) {
                  <mat-option [value]="d.id">
                    Dr. {{ d.name }}
                    @if (d.specialization) { — {{ d.specialization }} }
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Step 2: Date & time -->
          <div class="form-section-title" style="margin-top:8px">Step 2 — Date &amp; Time</div>

          <div class="form-row">
            <!-- Calendar date picker -->
            <div class="field-group">
              <label class="field-label">Appointment Date</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">calendar_today</mat-icon>
                <input matInput [matDatepicker]="picker"
                       formControlName="apptDate"
                       placeholder="Pick a date"
                       [min]="minDate"
                       readonly>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Time slot dropdown -->
            <div class="field-group">
              <label class="field-label">Preferred Time</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">schedule</mat-icon>
                <mat-select formControlName="apptTime" placeholder="Select time">
                  @for (slot of timeSlots; track slot.value) {
                    <mat-option [value]="slot.value">{{ slot.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Step 3: Reason -->
          <div class="form-section-title" style="margin-top:8px">Step 3 — Reason for Visit</div>

          <div class="field-group">
            <label class="field-label">Describe the issue or reason</label>
            <mat-form-field appearance="outline">
              <textarea matInput rows="3" formControlName="reason"
                        placeholder="e.g. Annual vaccination, limping, skin rash..."></textarea>
            </mat-form-field>
          </div>

          <!-- Notice -->
          <div class="booking-notice">
            <mat-icon>info_outline</mat-icon>
            <span>You'll receive a confirmation once the hospital reviews your request.</span>
          </div>

          <!-- Actions -->
          <div style="display:flex;gap:12px;margin-top:20px">
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    style="height:48px;min-width:160px;font-size:0.9rem">
              @if (loading) {
                <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner>
              }
              {{ loading ? 'Booking...' : 'Confirm Booking' }}
            </button>
            <button mat-stroked-button type="button" routerLink="/appointments"
                    style="height:48px;border-radius:12px;color:#4A6478;border-color:#C8DCE8">
              Cancel
            </button>
          </div>

        </form>
      </div>

    </div>
  `,
  styles: [`
    .page-header-left { display: flex; align-items: center; }
    .form-section-title {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8BA3B5;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid #E0EBF2;
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
      color: #1A3547;
      margin-bottom: 6px;
    }
    .booking-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #FFF7ED;
      border: 1px solid #FFF3E8;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 0.82rem;
      color: #9A3412;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; color: #FF8C42; }
    }
    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class BookAppointmentComponent implements OnInit {
  form: FormGroup;
  hospitals: any[] = [];
  doctors: any[] = [];
  loading = false;
  minDate = new Date(); // prevent past dates

  // Time slots from 08:00 to 20:00 in 30-min increments
  timeSlots = this.buildTimeSlots();

  constructor(private fb: FormBuilder, private api: ApiService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      hospitalId: [null, Validators.required],
      doctorId:   [null, Validators.required],
      apptDate:   [null, Validators.required],
      apptTime:   ['',   Validators.required],
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
    this.doctors = [];
    this.api.get<any>(`/hospitals/public/${hospitalId}/doctors`).subscribe(res => {
      this.doctors = res.data ?? [];
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const raw = this.form.value;
    // Format the Date object from mat-datepicker to yyyy-MM-dd
    const dateObj: Date = raw.apptDate;
    const yyyy = dateObj.getFullYear();
    const mm   = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd   = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const payload = {
      hospitalId: raw.hospitalId,
      doctorId:   raw.doctorId,
      apptDate:   formattedDate,
      apptTime:   raw.apptTime,
      reason:     raw.reason
    };

    this.api.post<any>('/appointments', payload).subscribe({
      next: () => {
        this.snack.open('Appointment booked! ✅', '', { duration: 2500 });
        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Booking failed.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private buildTimeSlots(): { label: string; value: string }[] {
    const slots: { label: string; value: string }[] = [];
    for (let h = 8; h <= 20; h++) {
      for (const m of [0, 30]) {
        if (h === 20 && m === 30) break;
        const hh     = String(h).padStart(2, '0');
        const mmStr  = String(m).padStart(2, '0');
        const period = h < 12 ? 'AM' : 'PM';
        const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const label  = `${String(h12).padStart(2, '0')}:${mmStr} ${period}`;
        slots.push({ label, value: `${hh}:${mmStr}:00` });
      }
    }
    return slots;
  }
}
