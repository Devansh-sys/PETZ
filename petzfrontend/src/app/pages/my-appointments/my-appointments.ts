import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService } from '../../core/appointment/appointment.service';
import { AppointmentResponse } from '../../core/appointment/appointment.models';

@Component({
  selector: 'petz-my-appointments',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.scss'
})
export class MyAppointments implements OnInit {
  appointments: AppointmentResponse[] = [];
  loading = true;
  error = '';

  constructor(
    private auth: AuthService,
    private apptService: AppointmentService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.session()?.userId;
    if (!userId) { this.loading = false; return; }
    this.apptService.getAppointmentsByUser(userId).subscribe({
      next: (list) => { this.appointments = list; this.loading = false; },
      error: () => { this.error = 'Could not load appointments.'; this.loading = false; }
    });
  }

  statusClass(status: string): string {
    const s = status?.toUpperCase();
    if (s === 'CONFIRMED' || s === 'ATTENDED' || s === 'COMPLETED') return 'ok';
    if (s === 'CANCELLED' || s === 'NO_SHOW' || s === 'EXPIRED') return 'danger';
    return 'pending';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(t: string): string {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
  }
}
