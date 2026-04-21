import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HospitalService } from '../../core/hospital/hospital.service';
import { HospitalServiceResponse } from '../../core/hospital/hospital.models';
import { BookingState } from '../../core/appointment/appointment.models';

const BOOKING_KEY = 'petz.booking';

@Component({
  selector: 'petz-book-service',
  imports: [CommonModule, Navbar],
  templateUrl: './book-service.html',
  styleUrl: './book-service.scss'
})
export class BookService implements OnInit {
  state: BookingState | null = null;
  services: HospitalServiceResponse[] = [];
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
    if (!s.hospitalId) { this.router.navigate(['/book']); return; }
    this.state = s;
    this.hospitalService.listServices(s.hospitalId).subscribe({
      next: (list) => { this.services = list.filter(sv => sv.active); this.loading = false; },
      error: () => { this.error = 'Could not load services.'; this.loading = false; }
    });
  }

  select(svc: HospitalServiceResponse): void {
    const s = { ...this.state!, serviceId: svc.id, serviceName: svc.serviceName, serviceType: svc.serviceType };
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(s));
    this.router.navigate(['/book/doctor']);
  }

  back(): void { this.router.navigate(['/book']); }
}
