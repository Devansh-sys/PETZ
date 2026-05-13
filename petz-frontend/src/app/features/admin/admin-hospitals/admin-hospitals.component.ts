import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-hospitals',
  templateUrl: './admin-hospitals.component.html',
  styleUrls: ['./admin-hospitals.component.scss']
})
export class AdminHospitalsComponent implements OnInit {
  all: any[] = [];
  filteredData: any[] = [];
  selected: any = null;
  loading = true;

  cols = ['hospital', 'contact', 'city', 'status', 'actions'];

  filters = { search: '', status: '', city: '', sort: 'az' };

  get activeCount()   { return this.all.filter(h => h.isActive !== false).length; }
  get inactiveCount() { return this.all.filter(h => h.isActive === false).length; }

  get availableCities(): string[] {
    const cities = this.all.map(h => h.city).filter(c => !!c);
    return [...new Set(cities)].sort();
  }

  get activeFilterCount(): number {
    let n = 0;
    if (this.filters.search) n++;
    if (this.filters.status) n++;
    if (this.filters.city)   n++;
    if (this.filters.sort !== 'az') n++;
    return n;
  }

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.loadHospitals(); }

  loadHospitals(): void {
    this.loading = true;
    this.api.get<any>('/admin/hospitals').subscribe({
      next: res => {
        // Load ALL hospitals so admin can see and manage both active and inactive ones.
        this.all = res.data ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.all];

    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      result = result.filter(h =>
        (h.name  || '').toLowerCase().includes(q) ||
        (h.city  || '').toLowerCase().includes(q) ||
        (h.email || '').toLowerCase().includes(q) ||
        (h.phone || '').toLowerCase().includes(q)
      );
    }

    if (this.filters.status === 'active') {
      result = result.filter(h => h.isActive !== false);
    } else if (this.filters.status === 'inactive') {
      result = result.filter(h => h.isActive === false);
    }

    if (this.filters.city) {
      result = result.filter(h => h.city === this.filters.city);
    }

    result.sort((a, b) => {
      if (this.filters.sort === 'za')     return (b.name || '').localeCompare(a.name || '');
      if (this.filters.sort === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (this.filters.sort === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return (a.name || '').localeCompare(b.name || '');
    });

    this.filteredData = result;
  }

  clearAll(): void {
    this.filters = { search: '', status: '', city: '', sort: 'az' };
    this.applyFilters();
  }

  toggle(h: any): void {
    const newActive = h.isActive === false;
    this.api.patch<any>(`/admin/hospitals/${h.id}/toggle`, { active: newActive }).subscribe({
      next: () => {
        h.isActive = newActive;
        if (this.selected?.id === h.id) this.selected = { ...this.selected, isActive: newActive };
        this.snack.open(`Hospital ${newActive ? 'activated' : 'deactivated'}.`, '', { duration: 2000 });
      },
      error: err => {
        this.snack.open(err.error?.message ?? 'Action failed.', 'Close', { duration: 3000 });
      }
    });
  }

  locationOf(h: any): string {
    return [h.address, h.city].filter(v => !!v).join(', ') || '—';
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
