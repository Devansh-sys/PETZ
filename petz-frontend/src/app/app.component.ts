import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  role: string | null = null;
  userName = '';
  unreadCount$: Observable<number>;

  navItems: { label: string; icon: string; route: string; roles: string[] }[] = [
    // USER only
    { label: 'Dashboard',       icon: 'dashboard',            route: '/dashboard',         roles: ['USER'] },
    { label: 'My Adoptions',    icon: 'favorite',             route: '/adoption/my',       roles: ['USER'] },
    { label: 'Browse Animals',  icon: 'pets',                 route: '/adoption/animals',  roles: ['USER'] },
    { label: 'Appointments',    icon: 'event',                route: '/appointments',      roles: ['USER'] },
    { label: 'Rescue',          icon: 'emergency',            route: '/rescue',            roles: ['USER'] },
    // NGO only
    { label: 'NGO Dashboard',   icon: 'dashboard',            route: '/ngo',          roles: ['NGO'] },
    { label: 'Rescue Queue',    icon: 'emergency',            route: '/ngo/rescues',  roles: ['NGO'] },
    { label: 'My Animals',      icon: 'pets',                 route: '/ngo/animals',  roles: ['NGO'] },
    { label: 'Applications',    icon: 'assignment',           route: '/ngo/applications', roles: ['NGO'] },
    // HOSPITAL only
    { label: 'Hospital Dashboard', icon: 'dashboard',         route: '/hospital',         roles: ['HOSPITAL'] },
    { label: 'Appointments',    icon: 'event',                route: '/hospital/appointments', roles: ['HOSPITAL'] },
    { label: 'Doctors',         icon: 'medical_services',     route: '/hospital/doctors', roles: ['HOSPITAL'] },
    // ADMIN only
    { label: 'Admin Panel',     icon: 'admin_panel_settings', route: '/admin',        roles: ['ADMIN'] }
  ];

  constructor(
    public auth: AuthService,
    public notifService: NotificationService,
    private router: Router
  ) {
    this.unreadCount$ = this.notifService.unreadCount$;
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.role = user?.role ?? null;
      this.userName = user?.name ?? '';
      if (user) {
        this.notifService.connect();
        // Load existing unread count from REST on login
        this.notifService.loadAll().subscribe({
          next: res => {
            const all: any[] = res.data ?? [];
            const unread = all.filter((n: any) => !n.isRead).length;
            this.notifService.unreadCount$.next(unread);
          }
        });
      }
    });
  }

  visibleNav(): typeof this.navItems {
    return this.navItems.filter(item =>
      !item.roles || (this.role && item.roles.includes(this.role))
    );
  }

  logout(): void {
    this.notifService.disconnect();
    this.auth.logout();
  }
}
