import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { rescueStatusLabel } from '../../../core/utils/rescue-status.util';

@Component({
  standalone: false,
  selector: 'app-admin-rescues',
  templateUrl: './admin-rescues.component.html',
  styleUrls: ['./admin-rescues.component.scss']
})
export class AdminRescuesComponent implements OnInit {
  all: any[] = [];
  filteredData: any[] = [];
  selected: any = null;
  loading = true;

  cols = ['animal', 'crit', 'address', 'ngo', 'status'];

  filters = {
    search: '',
    status: '',
    urgency: '',
    animalType: '',
    assignment: '',
    sort: 'newest'
  };

  statuses = [
    { label: 'All',                    value: '' },
    { label: 'Pending',                value: 'PENDING' },
    { label: 'Reported',               value: 'ASSIGNED' },
    { label: 'Assigned & In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed',              value: 'COMPLETED' }
  ];

  urgencies = [
    { label: 'All',      value: '' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High',     value: 'HIGH' },
    { label: 'Medium',   value: 'MEDIUM' },
    { label: 'Low',      value: 'LOW' }
  ];

  assignmentOptions = [
    { label: 'All',        value: '' },
    { label: 'Assigned',   value: 'assigned' },
    { label: 'Unassigned', value: 'unassigned' }
  ];

  sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' }
  ];

  get pendingCount()    { return this.all.filter(r => r.status === 'PENDING').length; }
  get progressCount()   { return this.all.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length; }
  get unassignedCount() { return this.all.filter(r => !r.ngoName).length; }

  get availableAnimalTypes(): string[] {
    const types = this.all.map(r => r.animalType).filter(t => !!t);
    return [...new Set(types)].sort();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filters.search)      count++;
    if (this.filters.status)      count++;
    if (this.filters.urgency)     count++;
    if (this.filters.animalType)  count++;
    if (this.filters.assignment)  count++;
    if (this.filters.sort !== 'newest') count++;
    return count;
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/rescues').subscribe({
      next: res => {
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
      result = result.filter(r =>
        (r.address || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.animalType || '').toLowerCase().includes(q)
      );
    }

    if (this.filters.status) {
      result = result.filter(r => r.status === this.filters.status);
    }

    if (this.filters.urgency) {
      result = result.filter(r => r.criticality === this.filters.urgency);
    }

    if (this.filters.animalType) {
      result = result.filter(r => r.animalType === this.filters.animalType);
    }

    if (this.filters.assignment === 'assigned') {
      result = result.filter(r => !!r.ngoName);
    } else if (this.filters.assignment === 'unassigned') {
      result = result.filter(r => !r.ngoName);
    }

    result.sort((a, b) => {
      const aTime = new Date(a.reportedAt || 0).getTime();
      const bTime = new Date(b.reportedAt || 0).getTime();
      return this.filters.sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    this.filteredData = result;
  }

  clearAll(): void {
    this.filters = { search: '', status: '', urgency: '', animalType: '', assignment: '', sort: 'newest' };
    this.applyFilters();
  }

  statusLabel(status: string): string {
    return rescueStatusLabel(status);
  }

  statusClass(status: string): string {
    return (status || '').toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  responseTime(reportedAt: string, updatedAt: string): string {
    const diff = new Date(updatedAt).getTime() - new Date(reportedAt).getTime();
    if (diff <= 0) return 'Updated immediately';
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `Updated ${days}d ${hours % 24}h after report`;
    if (hours > 0) return `Updated ${hours}h ${mins % 60}m after report`;
    return `Updated ${mins}m after report`;
  }
}
