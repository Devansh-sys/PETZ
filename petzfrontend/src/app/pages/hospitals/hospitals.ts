import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Navbar } from '../../shared/navbar/navbar';
import { HospitalService } from '../../core/hospital/hospital.service';
import { HospitalResponse } from '../../core/hospital/hospital.models';

@Component({
  selector: 'petz-hospitals',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './hospitals.html',
  styleUrl: './hospitals.scss'
})
export class Hospitals implements OnInit, OnDestroy {
  hospitals: HospitalResponse[] = [];
  loading = true;
  error = '';

  filterCity = '';
  filterName = '';
  filterEmergency = false;
  filterOpenNow = false;

  private filterChange$ = new Subject<void>();
  private sub!: Subscription;

  constructor(private hospitalService: HospitalService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.filterChange$.pipe(
      debounceTime(300),
      switchMap(() => {
        this.loading = true;
        this.error = '';
        return this.hospitalService.listHospitals({
          city: this.filterCity || undefined,
          name: this.filterName || undefined,
          emergencyOnly: this.filterEmergency || undefined,
          openNow: this.filterOpenNow || undefined
        });
      })
    ).subscribe({
      next: (list) => { this.hospitals = list; this.loading = false; },
      error: () => { this.error = 'Could not load hospitals. Please try again.'; this.loading = false; }
    });
    this.load();
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  load(): void { this.filterChange$.next(); }

  bookHospital(h: HospitalResponse): void {
    sessionStorage.setItem('petz.booking', JSON.stringify({
      hospitalId: h.id, hospitalName: h.name,
      hospitalAddress: h.address, hospitalPhone: h.contactPhone
    }));
    this.router.navigate(['/book/service']);
  }

  reset(): void {
    this.filterCity = '';
    this.filterName = '';
    this.filterEmergency = false;
    this.filterOpenNow = false;
    this.load();
  }
}
