import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HospitalService } from '../../core/hospital/hospital.service';
import { HospitalResponse } from '../../core/hospital/hospital.models';
import { BookingState } from '../../core/appointment/appointment.models';

const BOOKING_KEY = 'petz.booking';

@Component({
  selector: 'petz-book-hospital',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './book-hospital.html',
  styleUrl: './book-hospital.scss'
})
export class BookHospital implements OnInit {
  hospitals: HospitalResponse[] = [];
  loading = true;
  error = '';
  filterCity = '';
  filterEmergency = false;

  constructor(
    private hospitalService: HospitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    sessionStorage.removeItem(BOOKING_KEY);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.hospitalService.listHospitals({
      city: this.filterCity || undefined,
      emergencyOnly: this.filterEmergency || undefined
    }).subscribe({
      next: (list) => { this.hospitals = list; this.loading = false; },
      error: () => { this.error = 'Could not load hospitals.'; this.loading = false; }
    });
  }

  select(h: HospitalResponse): void {
    const state: BookingState = {
      hospitalId: h.id,
      hospitalName: h.name,
      hospitalAddress: h.address,
      hospitalPhone: h.contactPhone
    };
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(state));
    this.router.navigate(['/book/service']);
  }
}
