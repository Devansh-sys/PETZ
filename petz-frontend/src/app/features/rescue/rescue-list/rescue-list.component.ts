import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { RescueReport } from '../../../core/models/rescue.model';
import { rescueStatusLabel } from '../../../core/utils/rescue-status.util';

@Component({
  standalone: false,
  selector: 'app-rescue-list',
  templateUrl: './rescue-list.component.html',
  styleUrls: ['./rescue-list.component.scss']
})
export class RescueListComponent implements OnInit {
  rescues: RescueReport[] = [];
  loading = true;
  activeFilter = 'ALL';
  selected: RescueReport | null = null;

  searchFilter = { search: '', criticality: '', sort: 'newest' };

  readonly steps = [
    { key: 'PENDING',     label: 'Reported'    },
    { key: 'ASSIGNED',    label: 'Reported to NGO' },
    { key: 'IN_PROGRESS', label: 'Assigned & In Progress' },
    { key: 'COMPLETED',   label: 'Completed'   }
  ];

  readonly statusFilters = [
    { key: 'PENDING',     label: 'Pending'               },
    { key: 'ASSIGNED',    label: 'Reported'              },
    { key: 'IN_PROGRESS', label: 'Assigned & In Progress'},
    { key: 'COMPLETED',   label: 'Completed'             },
    { key: 'CANCELLED',   label: 'Cancelled'             }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/my').subscribe({
      next: res => {
        this.rescues = (res.data ?? []).map((r: any) => ({
          ...r,
          reportedAt: r.reportedAt && !r.reportedAt.endsWith('Z') && !r.reportedAt.includes('+')
            ? r.reportedAt + 'Z' : r.reportedAt,
          updatedAt: r.updatedAt && !r.updatedAt.endsWith('Z') && !r.updatedAt.includes('+')
            ? r.updatedAt + 'Z' : r.updatedAt,
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get hasSearchFilters(): boolean {
    return !!(this.searchFilter.search || this.searchFilter.criticality || this.searchFilter.sort !== 'newest');
  }

  clearSearchFilters(): void {
    this.searchFilter = { search: '', criticality: '', sort: 'newest' };
  }

  filtered(): RescueReport[] {
    let r = this.activeFilter === 'ALL' ? this.rescues : this.rescues.filter(x => x.status === this.activeFilter);
    const q = this.searchFilter.search.toLowerCase().trim();
    if (q) r = r.filter(x =>
      (x.animalType || '').toLowerCase().includes(q) ||
      (x.description || '').toLowerCase().includes(q) ||
      (x.address || '').toLowerCase().includes(q)
    );
    if (this.searchFilter.criticality) r = r.filter(x => x.criticality === this.searchFilter.criticality);
    if (this.searchFilter.sort === 'newest') {
      r = [...r].sort((a, b) => new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime());
    } else {
      r = [...r].sort((a, b) => new Date(a.reportedAt || 0).getTime() - new Date(b.reportedAt || 0).getTime());
    }
    return r;
  }

  countOf(status: string): number {
    return this.rescues.filter(r => r.status === status).length;
  }

  stepIndex(status: string): number {
    const map: Record<string, number> = {
      PENDING: 0, ASSIGNED: 1, IN_PROGRESS: 2, COMPLETED: 3
    };
    return map[status] ?? 0;
  }

  statusLabel(status: string): string {
    return rescueStatusLabel(status);
  }

  statusHint(status: string): string {
    const map: Record<string, string> = {
      PENDING:     'Your report is queued — an NGO will be assigned shortly.',
      ASSIGNED:    'Waiting for NGO confirmation. An NGO has been notified and will respond shortly.',
      IN_PROGRESS: 'A rescue team is actively on the way — help is coming!',
      COMPLETED:   'This animal has been successfully rescued. Thank you!',
      CANCELLED:   'This report has been cancelled.'
    };
    return map[status] ?? '';
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      PENDING:     'hourglass_empty',
      ASSIGNED:    'group',
      IN_PROGRESS: 'directions_run',
      COMPLETED:   'check_circle',
      CANCELLED:   'cancel'
    };
    return map[status] ?? 'info_outline';
  }

  animalIcon(type?: string): string {
    const t = (type || '').toLowerCase();
    if (t === 'dog')  return 'pets';
    if (t === 'cat')  return 'pets';
    if (t === 'bird') return 'flutter_dash';
    return 'cruelty_free';
  }

  critClass(c: string): string {
    return 'crit-' + (c || '').toLowerCase();
  }
}
