import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HospitalService } from '../../core/hospital/hospital.service';
import { HospitalResponse } from '../../core/hospital/hospital.models';

@Component({
  selector: 'petz-hospitals',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './hospitals.html',
  styleUrl: './hospitals.scss'
})
export class Hospitals implements OnInit {
  hospitals: HospitalResponse[] = [];
  loading = true;
  error = '';

  filterCity = '';
  filterName = '';
  filterEmergency = false;
  filterOpenNow = false;

  constructor(private hospitalService: HospitalService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.hospitalService.listHospitals({
      city: this.filterCity || undefined,
      name: this.filterName || undefined,
      emergencyOnly: this.filterEmergency || undefined,
      openNow: this.filterOpenNow || undefined
    }).subscribe({
      next: (list) => { this.hospitals = list; this.loading = false; },
      error: () => { this.error = 'Could not load hospitals. Please try again.'; this.loading = false; }
    });
  }

  reset(): void {
    this.filterCity = '';
    this.filterName = '';
    this.filterEmergency = false;
    this.filterOpenNow = false;
    this.load();
  }
}
