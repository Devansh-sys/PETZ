import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService } from '../../core/appointment/appointment.service';
import { BookingConfirmationResponse, BookingState } from '../../core/appointment/appointment.models';

const BOOKING_KEY = 'petz.booking';

@Component({
  selector: 'petz-book-confirm',
  imports: [CommonModule, Navbar],
  templateUrl: './book-confirm.html',
  styleUrl: './book-confirm.scss'
})
export class BookConfirm implements OnInit, OnDestroy {
  state: BookingState | null = null;
  confirmation: BookingConfirmationResponse | null = null;
  loading = false;
  error = '';
  lockExpiry = 0;

  private lockTimer: any;

  constructor(
    private auth: AuthService,
    private apptService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem(BOOKING_KEY);
    if (!raw) { this.router.navigate(['/book']); return; }
    const s: BookingState = JSON.parse(raw);
    if (!s.petId || !s.slotId) { this.router.navigate(['/book/pet']); return; }
    this.state = s;
    this.lockSlot(s);
  }

  ngOnDestroy(): void {
    clearInterval(this.lockTimer);
  }

  private lockSlot(s: BookingState): void {
    const userId = this.auth.session()?.userId;
    if (!userId) { this.router.navigate(['/sos/auth']); return; }
    this.loading = true;
    this.apptService.lockSlot(s.slotId!, userId).subscribe({
      next: (lock) => {
        const updated = { ...s, lockId: lock.lockId };
        this.state = updated;
        sessionStorage.setItem(BOOKING_KEY, JSON.stringify(updated));
        this.lockExpiry = lock.remainingSeconds;
        this.startCountdown();
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'This slot is no longer available. Please choose another.';
        this.loading = false;
      }
    });
  }

  private startCountdown(): void {
    this.lockTimer = setInterval(() => {
      this.lockExpiry--;
      if (this.lockExpiry <= 0) {
        this.lockExpiry = 0;
        clearInterval(this.lockTimer);
        this.error = 'Your slot lock expired. Please go back and choose a slot again.';
      }
    }, 1000);
  }

  get lockLabel(): string {
    const mm = Math.floor(this.lockExpiry / 60).toString().padStart(2, '0');
    const ss = (this.lockExpiry % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  get isLocked(): boolean { return this.lockExpiry > 0; }

  formatTime(t: string): string { return t ? t.slice(0, 5) : ''; }
  refCode(id: string): string { return id ? id.slice(0, 8).toUpperCase() : ''; }

  confirm(): void {
    const s = this.state;
    const userId = this.auth.session()?.userId;
    if (!s || !userId || this.loading) return;
    this.loading = true;
    this.error = '';
    this.apptService.createAppointment({
      userId,
      petId: s.petId!,
      hospitalId: s.hospitalId!,
      serviceId: s.serviceId!,
      doctorId: s.doctorId!,
      slotId: s.slotId!
    }).subscribe({
      next: (raw) => {
        clearInterval(this.lockTimer);
        this.confirmation = {
          appointmentId: raw.appointmentId,
          status: raw.status,
          appointmentType: raw.bookingType ?? 'ROUTINE',
          petName: s.petName ?? '',
          petSpecies: s.petSpecies ?? '',
          hospitalName: s.hospitalName ?? '',
          hospitalAddress: s.hospitalAddress ?? '',
          hospitalPhone: s.hospitalPhone ?? '',
          doctorName: s.doctorName ?? '',
          serviceName: s.serviceName ?? '',
          appointmentDate: raw.appointmentDate,
          appointmentStartTime: raw.appointmentTime,
          appointmentEndTime: raw.endTime,
          confirmationMessage: raw.message ?? 'Your appointment is confirmed.'
        };
        this.loading = false;
        sessionStorage.removeItem(BOOKING_KEY);
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'Booking failed. Please try again.';
        this.loading = false;
      }
    });
  }

  goHome(): void { this.router.navigate(['/']); }
  goAppointments(): void { this.router.navigate(['/appointments']); }
  back(): void { this.router.navigate(['/book/pet']); }
}
