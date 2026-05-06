import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  template: `
    <div class="page-container" style="max-width:760px">

      <!-- Header -->
      <div class="page-header" style="margin-bottom:28px">
        <div class="page-header-left" style="display:flex;align-items:center">
          <button mat-icon-button [routerLink]="dashboardRoute"
                  style="background:#fff;border:1px solid #E0EBF2;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
          </button>
          <div>
            <h1>My Profile</h1>
            <p>Your account details and information</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading profile...</span>
        </div>
      }

      @if (!loading) {

        <!-- ── Account card (all roles) ───────────────────── -->
        <div class="card profile-card">
          <div class="profile-avatar">{{ initials }}</div>
          <div class="profile-main">
            <div class="profile-name">{{ user?.name }}</div>
            <div class="role-badge" [ngClass]="'role-' + role.toLowerCase()">
              <mat-icon class="role-icon">{{ roleIcon }}</mat-icon>
              {{ roleLabel }}
            </div>
          </div>
        </div>

        <!-- ── Personal info ──────────────────────────────── -->
        <div class="card info-card">
          <div class="section-title">Account Information</div>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-icon-wrap orange"><mat-icon>mail_outline</mat-icon></div>
              <div class="info-content">
                <span class="info-label">Email</span>
                <span class="info-value">{{ user?.email }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon-wrap purple"><mat-icon>badge</mat-icon></div>
              <div class="info-content">
                <span class="info-label">Account Type</span>
                <span class="info-value">{{ roleLabel }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon-wrap green"><mat-icon>verified_user</mat-icon></div>
              <div class="info-content">
                <span class="info-label">Account ID</span>
                <span class="info-value">#{{ user?.userId }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── NGO profile card ───────────────────────────── -->
        @if (role === 'NGO' && profileData) {
          <div class="card info-card">
            <div class="section-title">NGO Details</div>
            <div class="info-grid">
              <div class="info-row">
                <div class="info-icon-wrap orange"><mat-icon>business</mat-icon></div>
                <div class="info-content">
                  <span class="info-label">Organisation Name</span>
                  <span class="info-value">{{ profileData.name }}</span>
                </div>
              </div>
              @if (profileData.description) {
                <div class="info-row">
                  <div class="info-icon-wrap purple"><mat-icon>info_outline</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">About</span>
                    <span class="info-value">{{ profileData.description }}</span>
                  </div>
                </div>
              }
              @if (profileData.city) {
                <div class="info-row">
                  <div class="info-icon-wrap green"><mat-icon>place</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">City</span>
                    <span class="info-value">{{ profileData.city }}</span>
                  </div>
                </div>
              }
              @if (profileData.phone) {
                <div class="info-row">
                  <div class="info-icon-wrap red"><mat-icon>phone</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Phone</span>
                    <span class="info-value">{{ profileData.phone }}</span>
                  </div>
                </div>
              }
              @if (profileData.email) {
                <div class="info-row">
                  <div class="info-icon-wrap orange"><mat-icon>mail_outline</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Organisation Email</span>
                    <span class="info-value">{{ profileData.email }}</span>
                  </div>
                </div>
              }
              @if (profileData.website) {
                <div class="info-row">
                  <div class="info-icon-wrap purple"><mat-icon>language</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Website</span>
                    <span class="info-value">{{ profileData.website }}</span>
                  </div>
                </div>
              }
              <div class="info-row">
                <div class="info-icon-wrap green"><mat-icon>check_circle_outline</mat-icon></div>
                <div class="info-content">
                  <span class="info-label">Status</span>
                  <span class="info-value">
                    <span [class]="profileData.active ? 'status-active' : 'status-inactive'">
                      {{ profileData.active ? 'Active' : 'Inactive' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ── HOSPITAL profile card ──────────────────────── -->
        @if (role === 'HOSPITAL' && profileData) {
          <div class="card info-card">
            <div class="section-title">Hospital Details</div>
            <div class="info-grid">
              <div class="info-row">
                <div class="info-icon-wrap red"><mat-icon>local_hospital</mat-icon></div>
                <div class="info-content">
                  <span class="info-label">Hospital Name</span>
                  <span class="info-value">{{ profileData.name }}</span>
                </div>
              </div>
              @if (profileData.address) {
                <div class="info-row">
                  <div class="info-icon-wrap green"><mat-icon>place</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Address</span>
                    <span class="info-value">{{ profileData.address }}</span>
                  </div>
                </div>
              }
              @if (profileData.city) {
                <div class="info-row">
                  <div class="info-icon-wrap green"><mat-icon>location_city</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">City</span>
                    <span class="info-value">{{ profileData.city }}</span>
                  </div>
                </div>
              }
              @if (profileData.phone) {
                <div class="info-row">
                  <div class="info-icon-wrap orange"><mat-icon>phone</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Phone</span>
                    <span class="info-value">{{ profileData.phone }}</span>
                  </div>
                </div>
              }
              @if (profileData.email) {
                <div class="info-row">
                  <div class="info-icon-wrap purple"><mat-icon>mail_outline</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Hospital Email</span>
                    <span class="info-value">{{ profileData.email }}</span>
                  </div>
                </div>
              }
              @if (profileData.specializations) {
                <div class="info-row">
                  <div class="info-icon-wrap red"><mat-icon>medical_services</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Specializations</span>
                    <span class="info-value">{{ profileData.specializations }}</span>
                  </div>
                </div>
              }
              <div class="info-row">
                <div class="info-icon-wrap green"><mat-icon>check_circle_outline</mat-icon></div>
                <div class="info-content">
                  <span class="info-label">Status</span>
                  <span class="info-value">
                    <span [class]="profileData.active ? 'status-active' : 'status-inactive'">
                      {{ profileData.active ? 'Active' : 'Inactive' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ── ADMIN profile card ─────────────────────────── -->
        @if (role === 'ADMIN') {
          <div class="card info-card admin-notice">
            <mat-icon style="font-size:40px;width:40px;height:40px;color:#FF8C42;margin-bottom:12px">
              admin_panel_settings
            </mat-icon>
            <p style="font-weight:700;color:#1A3547;margin:0 0 4px">Platform Administrator</p>
            <p style="color:#8BA3B5;font-size:0.85rem;margin:0">
              You have full access to manage users, NGOs, hospitals, and rescue operations.
            </p>
          </div>
        }

        <!-- ── Quick links ─────────────────────────────────── -->
        <div class="card info-card">
          <div class="section-title">Quick Navigation</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            @for (link of quickLinks; track link.route) {
              <button mat-stroked-button [routerLink]="link.route"
                      style="border-radius:12px;color:#4A6478;border-color:#C8DCE8;height:40px">
                <mat-icon>{{ link.icon }}</mat-icon>
                {{ link.label }}
              </button>
            }
          </div>
        </div>

      }

    </div>
  `,
  styles: [`
    .profile-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 28px 28px;
      margin-bottom: 16px;
    }
    .profile-avatar {
      width: 72px; height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      color: #fff;
      font-size: 2rem;
      font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 8px 24px rgba(255,140,66,0.3);
    }
    .profile-name {
      font-size: 1.4rem;
      font-weight: 900;
      color: #1A3547;
      margin-bottom: 8px;
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .role-icon { font-size: 14px; width: 14px; height: 14px; }
    .role-user      { background: #EFF6FF; color: #1D4ED8; }
    .role-ngo       { background: #F0FDF4; color: #15803D; }
    .role-hospital  { background: #FFF1F2; color: #BE123C; }
    .role-admin     { background: #FFF7ED; color: #9A3412; }

    .info-card {
      padding: 24px 28px;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8BA3B5;
      margin-bottom: 18px;
      padding-bottom: 10px;
      border-bottom: 1px solid #E0EBF2;
    }
    .info-grid { display: flex; flex-direction: column; gap: 14px; }
    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .info-icon-wrap {
      width: 38px; height: 38px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #fff; }
    }
    .info-icon-wrap.orange { background: linear-gradient(135deg,#FF9F5A,#FF8C42); }
    .info-icon-wrap.purple { background: linear-gradient(135deg,#B97AFB,#7C3AED); }
    .info-icon-wrap.green  { background: linear-gradient(135deg,#34D399,#059669); }
    .info-icon-wrap.red    { background: linear-gradient(135deg,#F87171,#DC2626); }

    .info-content { display: flex; flex-direction: column; padding-top: 2px; }
    .info-label { font-size: 0.72rem; font-weight: 700; color: #8BA3B5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .info-value { font-size: 0.9rem; font-weight: 600; color: #1A3547; }

    .status-active   { color: #15803D; font-weight: 700; }
    .status-inactive { color: #DC2626; font-weight: 700; }

    .admin-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px;
    }
  `]
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
