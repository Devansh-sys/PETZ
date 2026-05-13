import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  pendingApprovals: any[] = [];
  cols = ['avatar', 'name', 'role', 'status', 'city', 'joined', 'actions'];
  loading  = true;
  selected: any | null = null;

  filters = {
    search: '',
    role:   'ALL',
    status: 'ALL',
    sort:   'name_asc',
    city:   'ALL',
    phone:  'ALL',
  };

  readonly roleOptions = [
    { label: 'All',      value: 'ALL'      },
    { label: 'User',     value: 'USER'     },
    { label: 'NGO',      value: 'NGO'      },
    { label: 'Hospital', value: 'HOSPITAL' },
    { label: 'Admin',    value: 'ADMIN'    },
  ];

  readonly statusOptions = [
    { label: 'All',      value: 'ALL'      },
    { label: 'Active',   value: 'ACTIVE'   },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  readonly phoneOptions = [
    { label: 'All',          value: 'ALL'     },
    { label: 'Has Phone',    value: 'WITH'    },
    { label: 'No Phone',     value: 'WITHOUT' },
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/admin/users').subscribe({
      next: res => {
        // Exclude NGO/HOSPITAL accounts that are still pending approval —
        // they belong in the Pending Approvals section, not the main users list.
        this.users = (res.data ?? []).filter((u: any) =>
          !((u.role === 'NGO' || u.role === 'HOSPITAL') && u.isApproved === false)
        );
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.loadPendingApprovals();
  }

  loadPendingApprovals(): void {
    this.api.get<any>('/admin/pending-approvals').subscribe({
      next: res => { this.pendingApprovals = res.data ?? []; }
    });
  }

  get availableCities(): string[] {
    return [...new Set(this.users.map(u => u.city).filter((c: any) => !!c))].sort() as string[];
  }

  get activeFilterCount(): number {
    return [
      this.filters.search.trim() !== '',
      this.filters.role   !== 'ALL',
      this.filters.status !== 'ALL',
      this.filters.city   !== 'ALL',
      this.filters.phone  !== 'ALL',
    ].filter(Boolean).length;
  }

  get filteredUsers(): any[] {
    let result = [...this.users];

    // Search: name or email (case-insensitive)
    const q = this.filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    // Role
    if (this.filters.role !== 'ALL') {
      result = result.filter(u => u.role === this.filters.role);
    }

    // Status
    if (this.filters.status === 'ACTIVE')   result = result.filter(u =>  u.isActive);
    if (this.filters.status === 'INACTIVE') result = result.filter(u => !u.isActive);

    // City
    if (this.filters.city !== 'ALL') {
      result = result.filter(u => u.city === this.filters.city);
    }

    // Phone
    if (this.filters.phone === 'WITH')    result = result.filter(u =>  !!u.phone);
    if (this.filters.phone === 'WITHOUT') result = result.filter(u => !u.phone);

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
    this.filters = { search: '', role: 'ALL', status: 'ALL', sort: 'name_asc', city: 'ALL', phone: 'ALL' };
  }

  locationOf(user: any): string {
    return [user.address, user.city].filter((v: any) => !!v).join(', ') || '—';
  }

  toggle(user: any): void {
    this.api.patch<any>(`/admin/users/${user.id}/toggle`, { active: !user.isActive }).subscribe({
      next: res => {
        user.isActive = res.data.isActive;
        if (this.selected?.id === user.id) this.selected = { ...this.selected, isActive: user.isActive };
        this.snack.open(`User ${user.isActive ? 'activated' : 'deactivated'}.`, '', { duration: 2500 });
      }
    });
  }

  approve(user: any): void {
    this.api.patch<any>(`/admin/users/${user.id}/approve`, { approved: true }).subscribe({
      next: res => {
        this.pendingApprovals = this.pendingApprovals.filter(u => u.id !== user.id);
        // Also update the user in the main list if already loaded
        const existing = this.users.find(u => u.id === user.id);
        if (existing) { existing.isApproved = true; }
        else { this.users.push({ ...res.data }); }
        this.snack.open(`${user.name} has been approved. They can now log in.`, 'OK', { duration: 4000 });
      }
    });
  }

  reject(user: any): void {
    this.api.patch<any>(`/admin/users/${user.id}/toggle`, { active: false }).subscribe({
      next: () => {
        this.pendingApprovals = this.pendingApprovals.filter(u => u.id !== user.id);
        this.snack.open(`${user.name}'s registration has been rejected.`, '', { duration: 3000 });
      }
    });
  }
}
