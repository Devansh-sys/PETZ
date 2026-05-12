import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  standalone: false,
  selector: 'app-appointments-list',
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.scss']
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  filtered: Appointment[] = [];
  loading = true;
  cols = ['date', 'time', 'reason', 'status', 'actions'];
  selected: Appointment | null = null;

  filter = { search: '', status: '', sort: 'upcoming' };
  selectedDate: string | null = null;
  weekOffset = 0;
  weekDays: { label: string; num: string; key: string; isToday: boolean; hasAppts: boolean }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/appointments/my').subscribe({
      next: res => {
        this.appointments = res.data ?? [];
        this.loading = false;
        this.buildWeek();
        this.applyFilters();
      },
      error: () => { this.loading = false; }
    });
  }

  buildWeek(): void {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const startOfWeek = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon
    startOfWeek.setDate(today.getDate() - dayOfWeek + this.weekOffset * 7);

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: String(d.getDate()).padStart(2, '0'),
        key,
        isToday: key === todayKey,
        hasAppts: this.appointments.some(a => a.apptDate === key)
      };
    });
  }

  changeWeek(dir: number): void {
    this.weekOffset += dir;
    this.buildWeek();
  }

  selectDay(key: string): void {
    this.selectedDate = this.selectedDate === key ? null : key;
    this.applyFilters();
  }

  applyFilters(): void {
    let r = [...this.appointments];
    const q = this.filter.search.toLowerCase().trim();
    if (q) r = r.filter(a =>
      (a.reason || '').toLowerCase().includes(q) ||
      (a.hospitalName || '').toLowerCase().includes(q) ||
      (a.doctorName || '').toLowerCase().includes(q)
    );
    if (this.filter.status) r = r.filter(a => a.status === this.filter.status);
    if (this.selectedDate) r = r.filter(a => a.apptDate === this.selectedDate);
    if (this.filter.sort === 'upcoming') {
      r.sort((a, b) => (a.apptDate + a.apptTime).localeCompare(b.apptDate + b.apptTime));
    } else if (this.filter.sort === 'newest') {
      r.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else {
      r.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    this.filtered = r;
  }

  clearFilters(): void {
    this.filter = { search: '', status: '', sort: 'upcoming' };
    this.selectedDate = null;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filter.search || this.filter.status || this.selectedDate || this.filter.sort !== 'upcoming');
  }

  get upcomingCount(): number {
    return this.appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status === 'COMPLETED').length;
  }

  getDay(date: string): string {
    if (!date) return '—';
    return new Date(date + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  getMonth(date: string): string {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
  }

  cancel(id: number): void {
    if (!confirm('Cancel this appointment?')) return;
    this.api.delete<any>(`/appointments/${id}`).subscribe(() => {
      const a = this.appointments.find(x => x.id === id);
      if (a) a.status = 'CANCELLED';
      this.buildWeek();
      this.applyFilters();
    });
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr;
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}
