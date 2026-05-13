import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  role = '';
  profileData: any = null;
  loading  = true;
  editMode = false;
  editForm: any = {};
  saving   = false;

  get initials(): string {
    return (this.user?.name ?? 'U').charAt(0).toUpperCase();
  }

  get avatarInitial(): string {
    const name: string = (this.editMode && this.role === 'USER')
      ? (this.editForm?.name ?? '')
      : (this.user?.name ?? '');
    return (name || 'U').charAt(0).toUpperCase();
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      USER: 'Pet Owner', NGO: 'NGO / Rescue Org', HOSPITAL: 'Veterinary Hospital', ADMIN: 'Administrator'
    };
    return map[this.role] ?? this.role;
  }

  get roleIcon(): string {
    const map: Record<string, string> = {
      USER: 'pets', NGO: 'business', HOSPITAL: 'local_hospital', ADMIN: 'admin_panel_settings'
    };
    return map[this.role] ?? 'person';
  }

  get dashboardRoute(): string {
    const map: Record<string, string> = {
      USER: '/dashboard', NGO: '/ngo', HOSPITAL: '/hospital', ADMIN: '/admin'
    };
    return map[this.role] ?? '/dashboard';
  }

  get quickLinks(): { label: string; icon: string; route: string }[] {
    const maps: Record<string, { label: string; icon: string; route: string }[]> = {
      USER: [
        { label: 'Dashboard',      icon: 'dashboard',   route: '/dashboard'      },
        { label: 'My Adoptions',   icon: 'favorite',    route: '/adoption/my'    },
        { label: 'Appointments',   icon: 'event',       route: '/appointments'   },
        { label: 'Rescue Reports', icon: 'emergency',   route: '/rescue'         }
      ],
      NGO: [
        { label: 'NGO Dashboard',  icon: 'dashboard',   route: '/ngo'            },
        { label: 'Rescue Queue',   icon: 'emergency',   route: '/ngo/rescues'    },
        { label: 'My Animals',     icon: 'pets',        route: '/ngo/animals'    },
        { label: 'Applications',   icon: 'assignment',  route: '/ngo/applications'}
      ],
      HOSPITAL: [
        { label: 'Dashboard',      icon: 'dashboard',   route: '/hospital'                },
        { label: 'Appointments',   icon: 'event',       route: '/hospital/appointments'   },
        { label: 'Doctors',        icon: 'medical_services', route: '/hospital/doctors'  }
      ],
      ADMIN: [
        { label: 'Admin Panel',    icon: 'admin_panel_settings', route: '/admin' }
      ]
    };
    return maps[this.role] ?? [];
  }

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser$.value;
    this.role = this.user?.role ?? '';

    if (this.role === 'NGO') {
      this.api.get<any>('/ngo/profile').subscribe({
        next: res => { this.profileData = res.data; this.loading = false; },
        error: ()  => { this.loading = false; }
      });
    } else if (this.role === 'HOSPITAL') {
      this.api.get<any>('/hospitals/profile').subscribe({
        next: res => { this.profileData = res.data; this.loading = false; },
        error: ()  => { this.loading = false; }
      });
    } else if (this.role === 'USER') {
      // Fetch full user profile to get phone, city, address
      this.api.get<any>('/users/me').subscribe({
        next: res => { this.user = { ...this.user, ...res.data }; this.loading = false; },
        error: ()  => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }

  startEdit(): void {
    if (this.role === 'USER') {
      this.editForm = {
        name:    this.user?.name    ?? '',
        phone:   this.user?.phone   ?? '',
        city:    this.user?.city    ?? '',
        address: this.user?.address ?? '',
      };
    } else if (this.role === 'NGO') {
      this.editForm = {
        name:        this.profileData?.name        ?? '',
        description: this.profileData?.description ?? '',
        phone:       this.profileData?.phone       ?? '',
        email:       this.profileData?.email       ?? '',
        city:        this.profileData?.city        ?? '',
        address:     this.profileData?.address     ?? '',
      };
    } else if (this.role === 'HOSPITAL') {
      this.editForm = {
        name:    this.profileData?.name    ?? '',
        phone:   this.profileData?.phone   ?? '',
        email:   this.profileData?.email   ?? '',
        city:    this.profileData?.city    ?? '',
        address: this.profileData?.address ?? '',
      };
    }
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editForm = {};
  }

  saveProfile(): void {
    if (this.saving) return;
    this.saving = true;

    if (this.role === 'USER') {
      this.api.put<any>('/users/me', this.editForm).subscribe({
        next: res => {
          this.user = { ...this.user, ...this.editForm };
          // Keep auth BehaviorSubject + localStorage in sync so header name updates
          const current = this.auth.currentUser$.value;
          if (current) {
            const updated = { ...current, name: this.editForm.name };
            localStorage.setItem('petz_user', JSON.stringify(updated));
            this.auth.currentUser$.next(updated);
          }
          this.saving   = false;
          this.editMode = false;
          this.snack.open('Profile updated!', '', { duration: 2500 });
        },
        error: err => {
          this.saving = false;
          this.snack.open(err.error?.message ?? 'Error updating profile.', 'Close', { duration: 3000 });
        }
      });

    } else if (this.role === 'NGO') {
      this.api.post<any>('/ngo/profile', this.editForm).subscribe({
        next: res => {
          this.profileData = res.data;
          this.saving      = false;
          this.editMode    = false;
          this.snack.open('NGO profile updated!', '', { duration: 2500 });
        },
        error: err => {
          this.saving = false;
          this.snack.open(err.error?.message ?? 'Error updating NGO profile.', 'Close', { duration: 3000 });
        }
      });

    } else if (this.role === 'HOSPITAL') {
      this.api.post<any>('/hospitals/profile', this.editForm).subscribe({
        next: res => {
          this.profileData = res.data;
          this.saving      = false;
          this.editMode    = false;
          this.snack.open('Hospital profile updated!', '', { duration: 2500 });
        },
        error: err => {
          this.saving = false;
          this.snack.open(err.error?.message ?? 'Error updating hospital profile.', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
