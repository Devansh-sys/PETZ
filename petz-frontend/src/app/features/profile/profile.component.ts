import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

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
  loading = true;

  get initials(): string {
    return (this.user?.name ?? 'U').charAt(0).toUpperCase();
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

  constructor(private auth: AuthService, private api: ApiService) {}

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
    } else {
      this.loading = false;
    }
  }
}
