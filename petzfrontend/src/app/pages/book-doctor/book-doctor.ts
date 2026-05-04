import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HospitalService } from '../../core/hospital/hospital.service';
import { DoctorResponse } from '../../core/hospital/hospital.models';
import { BookingState } from '../../core/appointment/appointment.models';

const BOOKING_KEY = 'petz.booking';

@Component({
  selector: 'petz-book-doctor',
  imports: [CommonModule, Navbar],
  templateUrl: './book-doctor.html',
  styleUrl: './book-doctor.scss'
})
export class BookDoctor implements OnInit {
  state: BookingState | null = null;
  doctors: DoctorResponse[] = [];
  loading = true;
  error = '';

  constructor(
    private hospitalService: HospitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem(BOOKING_KEY);
    if (!raw) { this.router.navigate(['/book']); return; }
    const s: BookingState = JSON.parse(raw);
    if (!s.serviceId) { this.router.navigate(['/book/service']); return; }
    this.state = s;
    this.hospitalService.listDoctors(s.hospitalId!).subscribe({
      next: (list) => { this.doctors = list.filter(d => d.isActive); this.loading = false; },
      error: () => { this.error = 'Could not load doctors.'; this.loading = false; }
    });
  }

  select(d: DoctorResponse): void {
    const s = { ...this.state!, doctorId: d.id, doctorName: d.name, doctorSpecialization: d.specialization, doctorAvailability: d.availability };
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(s));
    this.router.navigate(['/book/slot']);
  }

  back(): void { this.router.navigate(['/book/service']); }
}
