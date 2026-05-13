import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Appt {
  id: number;
  userId: number;
  petId: number;
  hospitalId: number;
  doctorId: number;
  apptDate: string;
  apptTime: string;
  reason: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  hospitalName: string;
  hospitalCity: string;
  hospitalAddress: string;
  hospitalPhone: string;
  doctorName: string;
  doctorSpecialization: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface WeekDay {
  date: Date;
  label: string;
  dayNum: string;
  dayName: string;
  count: number;
}

@Component({
  standalone: false,
  selector: 'app-hospital-appointments',
  templateUrl: './hospital-appointments.component.html',
  styleUrls: ['./hospital-appointments.component.scss']
})
export class HospitalAppointmentsComponent implements OnInit {
  allAppts: Appt[] = [];
  filtered: Appt[] = [];
  selected: Appt | null = null;
  loading = true;

  searchQ = '';
  filterStatus = '';
  sortBy = 'date-asc';
  viewMode: 'week' | 'all' = 'week';

  // Week strip
  weekStart: Date = this.getMonday(new Date());
  weekDays: WeekDay[] = [];
  selectedDate: Date | null = null;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.buildWeek();
    this.api.get<any>('/appointments/hospital').subscribe({
      next: res => {
        this.allAppts = res.data ?? [];
        this.buildWeek();
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Week strip helpers ──
  getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const m = new Date(d);
    m.setDate(d.getDate() + diff);
    m.setHours(0, 0, 0, 0);
    return m;
  }

  buildWeek(): void {
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(this.weekStart.getDate() + i);
      const ds = this.toDateStr(d);
      const count = this.allAppts.filter(a => a.apptDate === ds).length;
      return {
        date: d,
        label: ds,
        dayNum: d.getDate().toString().padStart(2, '0'),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      };
    });
  }

  weekRangeLabel(): string {
    const end = new Date(this.weekStart);
    end.setDate(this.weekStart.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${this.weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  }

  weekTotal(): number {
    const start = this.toDateStr(this.weekStart);
    const end = new Date(this.weekStart); end.setDate(this.weekStart.getDate() + 6);
    const endStr = this.toDateStr(end);
    return this.allAppts.filter(a => a.apptDate >= start && a.apptDate <= endStr).length;
  }

  prevWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.selectedDate = null;
    this.buildWeek();
    this.applyFilters();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.selectedDate = null;
    this.buildWeek();
    this.applyFilters();
  }

  selectDay(d: Date): void {
    this.selectedDate = this.isSelectedDay(d) ? null : d;
    this.applyFilters();
  }

  clearDateFilter(): void {
    this.selectedDate = null;
    this.applyFilters();
  }

  isSelectedDay(d: Date): boolean {
    return !!this.selectedDate && this.toDateStr(d) === this.toDateStr(this.selectedDate);
  }

  isToday(d: Date): boolean {
    return this.toDateStr(d) === this.toDateStr(new Date());
  }

  toDateStr(d: Date): string {
    // Use local date components — .toISOString() returns UTC which shifts the date
    // for users in timezones ahead of UTC (e.g. IST UTC+5:30 midnight → previous UTC day)
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  // ── Filters ──
  applyFilters(): void {
    const q = this.searchQ.toLowerCase();
    const ds = this.selectedDate ? this.toDateStr(this.selectedDate) : null;

    const weekStartStr = this.toDateStr(this.weekStart);
    const weekEndDate = new Date(this.weekStart);
    weekEndDate.setDate(this.weekStart.getDate() + 6);
    const weekEndStr = this.toDateStr(weekEndDate);

    let list = this.allAppts.filter(a => {
      const matchSearch = !q || [a.petName, a.userName, a.doctorName, a.reason, a.petSpecies, a.userEmail]
        .some(v => v?.toLowerCase().includes(q));
      const matchStatus = !this.filterStatus || a.status === this.filterStatus;
      let matchDate: boolean;
      if (ds) {
        matchDate = a.apptDate === ds;
      } else if (this.viewMode === 'week') {
        matchDate = a.apptDate >= weekStartStr && a.apptDate <= weekEndStr;
      } else {
        matchDate = true;
      }
      return matchSearch && matchStatus && matchDate;
    });

    const statusOrder: Record<string, number> = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 };
    list = list.sort((a, b) => {
      if (this.sortBy === 'date-asc')      return a.apptDate.localeCompare(b.apptDate) || a.apptTime.localeCompare(b.apptTime);
      if (this.sortBy === 'date-desc')     return b.apptDate.localeCompare(a.apptDate) || b.apptTime.localeCompare(a.apptTime);
      if (this.sortBy === 'pending-first') return (a.status === 'PENDING' ? -1 : 1) - (b.status === 'PENDING' ? -1 : 1);
      if (this.sortBy === 'status')        return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      return 0;
    });

    this.filtered = list;
  }

  clearFilters(): void {
    this.searchQ = '';
    this.filterStatus = '';
    this.sortBy = 'date-asc';
    this.selectedDate = null;
    this.applyFilters();
  }

  switchView(mode: 'week' | 'all'): void {
    this.viewMode = mode;
    this.selectedDate = null;
    this.applyFilters();
  }

  // ── Stat helpers ──
  countBy(status: string): number {
    if (this.viewMode === 'all') {
      return this.allAppts.filter(a => a.status === status).length;
    }
    const start = this.toDateStr(this.weekStart);
    const endDate = new Date(this.weekStart);
    endDate.setDate(this.weekStart.getDate() + 6);
    const end = this.toDateStr(endDate);
    return this.allAppts.filter(a => a.status === status && a.apptDate >= start && a.apptDate <= end).length;
  }

  // ── Date / time formatting ──
  getDay(date: string): string {
    if (!date) return '—';
    return new Date(date + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  getMonth(date: string): string {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
  }

  formatTime(time: string): string {
    if (!time) return '—';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  // ── Date guard — returns true if appointment date is today or in the past ──
  isPast(apptDate: string): boolean {
    if (!apptDate) return false;
    const today = this.toDateStr(new Date());
    return apptDate <= today;
  }

  // ── Status update ──
  updateStatus(a: Appt, status: string): void {
    this.api.patch<any>(`/appointments/${a.id}/status`, { status }).subscribe({
      next: () => {
        a.status = status;
        this.buildWeek();
        this.applyFilters();
        this.snack.open(`Appointment ${status.toLowerCase()}.`, '', { duration: 2000 });
      },
      error: () => this.snack.open('Failed to update status.', '', { duration: 2500 })
    });
  }
}
