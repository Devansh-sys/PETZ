import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HospitalService } from '../../core/hospital/hospital.service';
import { DoctorSlotResponse } from '../../core/hospital/hospital.models';
import { BookingState } from '../../core/appointment/appointment.models';

const BOOKING_KEY = 'petz.booking';

@Component({
  selector: 'petz-book-slot',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './book-slot.html',
  styleUrl: './book-slot.scss'
})
export class BookSlot implements OnInit {
  state: BookingState | null = null;
  slots: DoctorSlotResponse[] = [];
  loading = false;
  error = '';
  selectedDate: string = this.todayStr();

  constructor(
    private hospitalService: HospitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem(BOOKING_KEY);
    if (!raw) { this.router.navigate(['/book']); return; }
    const s: BookingState = JSON.parse(raw);
    if (!s.doctorId) { this.router.navigate(['/book/doctor']); return; }
    this.state = s;
    this.loadSlots();
  }

  loadSlots(): void {
    this.loading = true;
    this.error = '';
    this.hospitalService.listSlots(this.state!.hospitalId!, this.state!.doctorId!, this.selectedDate, this.state!.serviceId).subscribe({
      next: (list) => { this.slots = list.filter(sl => sl.available); this.loading = false; },
      error: () => { this.error = 'Could not load slots.'; this.loading = false; }
    });
  }

  select(slot: DoctorSlotResponse): void {
    const s = { ...this.state!, slotId: slot.id, slotDate: slot.slotDate, slotStart: slot.startTime, slotEnd: slot.endTime };
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(s));
    this.router.navigate(['/book/pet']);
  }

  back(): void { this.router.navigate(['/book/doctor']); }

  get minDate(): string { return this.todayStr(); }

  private todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatTime(t: string): string {
    return t ? t.slice(0, 5) : '';
  }
}
