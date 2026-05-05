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
  searchingNext = false;
  error = '';
  // Default to tomorrow — slot seeder guarantees tomorrow has openings, so the
  // user lands on a date with data instead of an empty "today" view.
  selectedDate: string = this.addDaysStr(1);

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
    this.slots = [];
    this.hospitalService.listSlots(
      this.state!.hospitalId!, this.state!.doctorId!,
      this.selectedDate, this.state!.serviceId
    ).subscribe({
      next: (list) => {
        this.slots = list.filter(sl => sl.available);
        this.loading = false;
      },
      error: () => {
        // Treat a load failure the same as "no slots for this date" —
        // auto-search forward so the user isn't blocked.
        this.loading = false;
        this.slots = [];
        this.error = 'No slots available for this date. Searching for the next available date…';
        this.findNextAvailable();
      }
    });
  }

  /**
   * Walks forward from the current selectedDate up to 30 days, stopping on
   * the first day that returns at least one available slot. Used by the
   * "Find next available date" link in the empty state so the user doesn't
   * have to click through the date picker manually.
   */
  findNextAvailable(): void {
    if (this.searchingNext) return;
    this.searchingNext = true;
    this.error = '';
    const tryOffset = (offset: number) => {
      if (offset > 30) {
        this.searchingNext = false;
        this.error = 'No available slots in the next 30 days.';
        return;
      }
      const d = this.addDaysStr(offset, this.selectedDate);
      this.hospitalService.listSlots(this.state!.hospitalId!, this.state!.doctorId!, d, this.state!.serviceId).subscribe({
        next: (list) => {
          const open = list.filter(sl => sl.available);
          if (open.length > 0) {
            this.selectedDate = d;
            this.slots = open;
            this.searchingNext = false;
          } else {
            tryOffset(offset + 1);
          }
        },
        error: () => { this.searchingNext = false; this.error = 'Could not load slots.'; }
      });
    };
    tryOffset(1);
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

  /** Returns YYYY-MM-DD for `today + days` (or `from + days` when given). */
  private addDaysStr(days: number, from?: string): string {
    const base = from ? new Date(from + 'T00:00:00Z') : new Date();
    base.setUTCDate(base.getUTCDate() + days);
    return base.toISOString().split('T')[0];
  }

  formatTime(t: string): string {
    return t ? t.slice(0, 5) : '';
  }
}
