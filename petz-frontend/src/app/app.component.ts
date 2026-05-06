import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  navItems: { label: string; icon: string; route: string; roles: string[] }[] = [
    // USER only
    { label: 'Dashboard',       icon: 'dashboard',            route: '/dashboard',    roles: ['USER'] },
    { label: 'My Pets',         icon: 'pets',                 route: '/pets',         roles: ['USER'] },
    { label: 'Appointments',    icon: 'event',                route: '/appointments', roles: ['USER'] },
    { label: 'Rescue',          icon: 'emergency',            route: '/rescue',       roles: ['USER'] },
    { label: 'Adopt',           icon: 'favorite',             route: '/adoption',     roles: ['USER'] },
    // NGO only
    { label: 'Dashboard',       icon: 'dashboard',            route: '/dashboard',    roles: ['NGO'] },
    { label: 'Rescue Queue',    icon: 'emergency',            route: '/rescue',       roles: ['NGO'] },
    { label: 'NGO Portal',      icon: 'business',             route: '/ngo',          roles: ['NGO'] },
    // HOSPITAL only
    { label: 'Dashboard',       icon: 'dashboard',            route: '/dashboard',    roles: ['HOSPITAL'] },
    { label: 'Appointments',    icon: 'event',                route: '/appointments', roles: ['HOSPITAL'] },
    { label: 'Hospital Portal', icon: 'local_hospital',       route: '/hospital',     roles: ['HOSPITAL'] },
    // ADMIN only
    { label: 'Admin Panel',     icon: 'admin_panel_settings', route: '/admin',        roles: ['ADMIN'] }
  ];

  constructor(
    public auth: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.role = user?.role ?? null;
      this.userName = user?.name ?? '';
      if (user) this.notifService.connect();
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
