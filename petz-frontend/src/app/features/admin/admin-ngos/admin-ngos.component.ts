import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-ngos',
  templateUrl: './admin-ngos.component.html',
  styleUrls: ['./admin-ngos.component.scss']
})
export class AdminNgosComponent implements OnInit {
  ngos:    any[] = [];
  cols     = ['ngo', 'contact', 'regno', 'status', 'verified', 'actions'];
  loading  = true;
  selected: any | null = null;

  filters = {
    search:   '',
    verified: 'ALL',
    status:   'ALL',
    sort:     'name_asc',
    city:     'ALL',
    regNo:    'ALL',
  };

  readonly verifyOptions = [
    { label: 'All',        value: 'ALL'        },
    { label: '✓ Verified', value: 'VERIFIED'   },
    { label: 'Pending',    value: 'UNVERIFIED' },
  ];

  readonly statusOptions = [
    { label: 'All',      value: 'ALL'      },
    { label: 'Active',   value: 'ACTIVE'   },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  readonly regOptions = [
    { label: 'All',            value: 'ALL'     },
    { label: 'Has Reg. No',    value: 'WITH'    },
    { label: 'No Reg. No',     value: 'WITHOUT' },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.loadNgos(); }

  loadNgos(): void {
    this.loading = true;
    this.api.get<any>('/admin/ngos').subscribe({
      next: res => {
        // Load ALL NGOs so admin can see and manage both active and inactive ones.
        this.ngos = res.data ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get availableCities(): string[] {
    return [...new Set(this.ngos.map(n => n.city).filter((c: any) => !!c))].sort() as string[];
  }

  get activeFilterCount(): number {
    return [
      this.filters.search.trim() !== '',
      this.filters.verified !== 'ALL',
      this.filters.status   !== 'ALL',
      this.filters.city     !== 'ALL',
      this.filters.regNo    !== 'ALL',
    ].filter(Boolean).length;
  }

  get filteredNgos(): any[] {
    let result = [...this.ngos];

    // Search: name, city, email
    const q = this.filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(n =>
        n.name?.toLowerCase().includes(q) ||
        n.city?.toLowerCase().includes(q) ||
        n.email?.toLowerCase().includes(q)
      );
    }

    // Verification
    if (this.filters.verified === 'VERIFIED')   result = result.filter(n =>  n.isVerified);
    if (this.filters.verified === 'UNVERIFIED') result = result.filter(n => !n.isVerified);

    // Status
    if (this.filters.status === 'ACTIVE')   result = result.filter(n =>  n.isActive);
    if (this.filters.status === 'INACTIVE') result = result.filter(n => !n.isActive);

    // City
    if (this.filters.city !== 'ALL') {
      result = result.filter(n => n.city === this.filters.city);
    }

    // Registration No
    if (this.filters.regNo === 'WITH')    result = result.filter(n =>  !!n.registrationNo);
    if (this.filters.regNo === 'WITHOUT') result = result.filter(n => !n.registrationNo);

    // Sort
    result.sort((a, b) => {
      switch (this.filters.sort) {
        case 'name_asc':  return (a.name || '').localeCompare(b.name || '');
        case 'name_desc': return (b.name || '').localeCompare(a.name || '');
        case 'date_desc': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'date_asc':  return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        default: return 0;
      }
    });

    return result;
  }

  clearAll(): void {
    this.filters = { search: '', verified: 'ALL', status: 'ALL', sort: 'name_asc', city: 'ALL', regNo: 'ALL' };
  }

  locationOf(ngo: any): string {
    return [ngo.address, ngo.city].filter((v: any) => !!v).join(', ') || '—';
  }

  verify(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/verify`, { verified: true }).subscribe({
      next: () => {
        ngo.isVerified = true;
        if (this.selected?.id === ngo.id) this.selected = { ...this.selected, isVerified: true };
        this.snack.open('NGO verified! ✓', '', { duration: 2000 });
      }
    });
  }

  toggle(ngo: any): void {
    this.api.patch<any>(`/admin/ngos/${ngo.id}/toggle`, { active: !ngo.isActive }).subscribe({
      next: () => {
        ngo.isActive = !ngo.isActive;
        if (this.selected?.id === ngo.id) this.selected = { ...this.selected, isActive: ngo.isActive };
        this.snack.open(`NGO ${ngo.isActive ? 'activated' : 'deactivated'}.`, '', { duration: 2000 });
      }
    });
  }
}
