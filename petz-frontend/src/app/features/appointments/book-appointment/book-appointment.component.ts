import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss']
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
