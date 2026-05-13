import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  scheduleStart: string;
  scheduleEnd: string;
  slotDuration: number;
}

@Component({
  standalone: false,
  selector: 'app-doctors-manage',
  templateUrl: './doctors-manage.component.html',
  styleUrls: ['./doctors-manage.component.scss']
})
export class DoctorsManageComponent implements OnInit {
  doctors: Doctor[] = [];
  filtered: Doctor[] = [];
  selected: Doctor | null = null;
  loading = true;

  showForm = false;
  newDoc: any = { slotDuration: 30 };

  // ── Add-doctor time picker state ──
  readonly hours   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  readonly minutes = ['00','15','30','45'];
  startHour = '9';  startMin = '00';  startAmPm = 'AM';
  endHour   = '5';  endMin   = '00';  endAmPm   = 'PM';

  // ── Edit-doctor state ──
  editMode  = false;
  savingEdit = false;
  editDoc: any = {};
  editStartHour = '9';  editStartMin = '00';  editStartAmPm = 'AM';
  editEndHour   = '5';  editEndMin   = '00';  editEndAmPm   = 'PM';

  searchQ = '';
  filterSpec = '';
  sortBy = 'name-asc';
  specOptions: string[] = [];

  hospitalId: number | null = null;
  private maxSlots = 1;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.updateTimes();
    this.api.get<any>('/hospitals/profile').subscribe({
      next: res => {
        this.hospitalId = res.data?.id;
        if (this.hospitalId) {
          this.api.get<any>(`/hospitals/public/${this.hospitalId}/doctors`).subscribe(r => {
            this.doctors = r.data ?? [];
            this.buildMeta();
            this.applyFilters();
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  buildMeta(): void {
    const specs = [...new Set(this.doctors.map(d => d.specialization).filter(Boolean))];
    this.specOptions = specs.sort();
    const slots = this.doctors.map(d => this.slotsPerDay(d));
    this.maxSlots = Math.max(...slots, 1);
  }

  applyFilters(): void {
    const q = this.searchQ.toLowerCase();
    let list = this.doctors.filter(d => {
      const matchQ = !q || d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q);
      const matchSpec = !this.filterSpec || d.specialization === this.filterSpec;
      return matchQ && matchSpec;
    });

    list = list.sort((a, b) => {
      if (this.sortBy === 'name-asc')    return (a.name || '').localeCompare(b.name || '');
      if (this.sortBy === 'name-desc')   return (b.name || '').localeCompare(a.name || '');
      if (this.sortBy === 'slots-desc')  return this.slotsPerDay(b) - this.slotsPerDay(a);
      if (this.sortBy === 'slots-asc')   return this.slotsPerDay(a) - this.slotsPerDay(b);
      if (this.sortBy === 'spec')        return (a.specialization || '').localeCompare(b.specialization || '');
      return 0;
    });

    this.filtered = list;
  }

  clearFilters(): void {
    this.searchQ = '';
    this.filterSpec = '';
    this.sortBy = 'name-asc';
    this.applyFilters();
  }

  // ── Time picker helpers ──
  updateTimes(): void {
    this.newDoc.scheduleStart = this.to24(this.startHour, this.startMin, this.startAmPm);
    this.newDoc.scheduleEnd   = this.to24(this.endHour,   this.endMin,   this.endAmPm);
  }

  private to24(hour: string, min: string, ampm: string): string {
    let h = parseInt(hour, 10);
    if (ampm === 'AM' && h === 12) h = 0;
    if (ampm === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${min}`;
  }

  private resetTimePicker(): void {
    this.startHour = '9';  this.startMin = '00';  this.startAmPm = 'AM';
    this.endHour   = '5';  this.endMin   = '00';  this.endAmPm   = 'PM';
    this.updateTimes();
  }

  // ── Computed helpers ──
  slotsPerDay(d: Doctor): number {
    if (!d.scheduleStart || !d.scheduleEnd || !d.slotDuration) return 0;
    const [sh, sm] = d.scheduleStart.split(':').map(Number);
    const [eh, em] = d.scheduleEnd.split(':').map(Number);
    const totalMin = (eh * 60 + em) - (sh * 60 + sm);
    return totalMin > 0 ? Math.floor(totalMin / d.slotDuration) : 0;
  }

  hoursPerDay(d: Doctor): string {
    if (!d.scheduleStart || !d.scheduleEnd) return '—';
    const [sh, sm] = d.scheduleStart.split(':').map(Number);
    const [eh, em] = d.scheduleEnd.split(':').map(Number);
    const totalMin = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMin <= 0) return '—';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  slotBarPercent(d: Doctor): number {
    const s = this.slotsPerDay(d);
    return this.maxSlots > 0 ? Math.round((s / this.maxSlots) * 100) : 0;
  }

  timelineLeft(d: Doctor): number {
    if (!d.scheduleStart) return 0;
    const [h, m] = d.scheduleStart.split(':').map(Number);
    return Math.round(((h * 60 + m) / (24 * 60)) * 100);
  }

  timelineWidth(d: Doctor): number {
    if (!d.scheduleStart || !d.scheduleEnd) return 0;
    const [sh, sm] = d.scheduleStart.split(':').map(Number);
    const [eh, em] = d.scheduleEnd.split(':').map(Number);
    const dur = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(Math.round((dur / (24 * 60)) * 100), 5);
  }

  // ── Stat strip ──
  uniqueSpecs(): number {
    return new Set(this.doctors.map(d => d.specialization).filter(Boolean)).size;
  }

  scheduledCount(): number {
    return this.doctors.filter(d => d.scheduleStart && d.scheduleEnd).length;
  }

  totalDailySlots(): number {
    return this.doctors.reduce((sum, d) => sum + this.slotsPerDay(d), 0);
  }

  formatTime(t: string): string {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  addDoctor(): void {
    if (!this.newDoc.name) return;
    this.api.post<any>('/hospitals/profile/doctors', this.newDoc).subscribe({
      next: res => {
        this.doctors.push(res.data);
        this.buildMeta();
        this.applyFilters();
        this.showForm = false;
        this.newDoc = { slotDuration: 30 };
        this.resetTimePicker();
        this.snack.open('Doctor added successfully!', '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error adding doctor.', 'Close', { duration: 3000 })
    });
  }

  deleteDoctor(id: number): void {
    if (!confirm('Remove this doctor from your hospital?')) return;
    this.api.delete<any>(`/hospitals/profile/doctors/${id}`).subscribe(() => {
      this.doctors = this.doctors.filter(d => d.id !== id);
      this.buildMeta();
      this.applyFilters();
      this.snack.open('Doctor removed.', '', { duration: 2000 });
    });
  }

  // ── Edit doctor ──────────────────────────────────────────────────────

  startEdit(): void {
    if (!this.selected) return;
    this.editDoc = { ...this.selected };
    const start = this.from24(this.selected.scheduleStart);
    const end   = this.from24(this.selected.scheduleEnd);
    this.editStartHour  = start.hour;  this.editStartMin = start.min;  this.editStartAmPm = start.ampm;
    this.editEndHour    = end.hour;    this.editEndMin   = end.min;    this.editEndAmPm   = end.ampm;
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode  = false;
    this.savingEdit = false;
    this.editDoc   = {};
  }

  updateEditTimes(): void {
    this.editDoc.scheduleStart = this.to24(this.editStartHour, this.editStartMin, this.editStartAmPm);
    this.editDoc.scheduleEnd   = this.to24(this.editEndHour,   this.editEndMin,   this.editEndAmPm);
  }

  saveEdit(): void {
    if (!this.selected || !this.editDoc.name) return;
    this.savingEdit = true;
    this.updateEditTimes();
    this.api.put<any>(`/hospitals/profile/doctors/${this.selected.id}`, {
      name:          this.editDoc.name,
      specialization: this.editDoc.specialization,
      scheduleStart: this.editDoc.scheduleStart,
      scheduleEnd:   this.editDoc.scheduleEnd,
      slotDuration:  this.editDoc.slotDuration,
    }).subscribe({
      next: res => {
        const idx = this.doctors.findIndex(d => d.id === this.selected!.id);
        if (idx !== -1) {
          this.doctors[idx] = res.data;
          this.selected = res.data;
        }
        this.buildMeta();
        this.applyFilters();
        this.editMode   = false;
        this.savingEdit = false;
        this.snack.open('Doctor updated successfully!', '', { duration: 2500 });
      },
      error: err => {
        this.savingEdit = false;
        this.snack.open(err.error?.message ?? 'Error updating doctor.', 'Close', { duration: 3000 });
      }
    });
  }

  /** Parse an HH:mm string back into { hour, min, ampm } for the time picker dropdowns */
  private from24(time: string): { hour: string; min: string; ampm: string } {
    if (!time) return { hour: '12', min: '00', ampm: 'PM' };
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const min  = mStr ?? '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0)  h = 12;
    else if (h > 12) h -= 12;
    return { hour: String(h), min, ampm };
  }
}
